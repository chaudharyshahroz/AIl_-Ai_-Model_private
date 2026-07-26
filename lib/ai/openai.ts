import OpenAI from "openai";
import type {
  AIProviderAdapter,
  CredentialStatus,
  ModelDescriptor,
  ProviderCredential,
  TokenEstimate,
  UnifiedGenerationRequest,
  UnifiedResponse,
  UnifiedStreamEvent,
  FinishReason,
} from "./types";
import { NotImplementedError, ProviderError } from "./types";
import { priceFor } from "./pricing";

/**
 * OpenAI provider adapter.
 * Direct integration via the official `openai` SDK. NOT OpenRouter.
 */
export class OpenAIAdapter implements AIProviderAdapter {
  readonly providerId: string;

  constructor(providerId: string = "openai") {
    this.providerId = providerId;
  }

  private getClient(credential: ProviderCredential): OpenAI {
    return new OpenAI({
      apiKey: credential.apiKey,
      baseURL: credential.baseUrl,
    });
  }

  async listModels(credential: ProviderCredential): Promise<ModelDescriptor[]> {
    try {
      const client = this.getClient(credential);
      const res = await client.models.list();
      const out: ModelDescriptor[] = [];
      for await (const m of res) {
        // Skip non-chat models (embeddings, audio, image gen, moderation, etc.)
        if (!isLikelyChatModel(m.id)) continue;
        out.push(await this.buildDescriptor(credential, m.id));
      }
      return out;
    } catch (err) {
      throw normalizeOpenAIError(this.providerId, err);
    }
  }

  async getModel(
    credential: ProviderCredential,
    modelId: string,
  ): Promise<ModelDescriptor | null> {
    try {
      const client = this.getClient(credential);
      await client.models.retrieve(modelId);
      return await this.buildDescriptor(credential, modelId);
    } catch (err) {
      if (err instanceof OpenAI.APIConnectionError || (err as { status?: number })?.status === 404) {
        return null;
      }
      throw normalizeOpenAIError(this.providerId, err);
    }
  }

  async generate(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): Promise<UnifiedResponse> {
    const client = this.getClient(credential);
    const params = buildChatParams(request);
    const started = Date.now();
    try {
      const res = await client.chat.completions.create({ ...params, stream: false });
      const choice = res.choices[0];
      const text = choice?.message?.content ?? "";
      const usage = res.usage;
      const inputTokens = usage?.prompt_tokens ?? 0;
      const outputTokens = usage?.completion_tokens ?? 0;
      const cachedTokens = (usage as unknown as { prompt_tokens_details?: { cached_tokens?: number } })
        ?.prompt_tokens_details?.cached_tokens ?? 0;
      return {
        text,
        toolCalls: [],
        usage: { inputTokens, outputTokens, cachedInputTokens: cachedTokens },
        costMicros: estimateCostMicros(this.providerId, request.modelId, inputTokens, outputTokens, cachedTokens),
        finishReason: mapFinishReason(choice?.finish_reason ?? "stop"),
        latencyMs: Date.now() - started,
        modelId: request.modelId,
        providerId: this.providerId,
      };
    } catch (err) {
      throw normalizeOpenAIError(this.providerId, err);
    }
  }

  async *stream(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): AsyncIterable<UnifiedStreamEvent> {
    const client = this.getClient(credential);
    const params = buildChatParams(request);
    const started = Date.now();
    let firstTokenAt: number | null = null;
    let textAccum = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let cachedInputTokens = 0;
    try {
      const stream = await client.chat.completions.create({ ...params, stream: true });
      yield {
        type: "start",
        requestId: request.requestId ?? cryptoRandomId(),
        modelId: request.modelId,
        providerId: this.providerId,
      };
      for await (const chunk of stream) {
        if (request.abortSignal?.aborted) {
          yield { type: "finish", reason: "cancelled", latencyMs: Date.now() - started };
          return;
        }
        const delta = chunk.choices?.[0]?.delta;
        if (delta?.content) {
          if (firstTokenAt === null) firstTokenAt = Date.now();
          textAccum += delta.content;
          yield { type: "text", delta: delta.content };
        }
      }
      // OpenAI doesn't include usage in the stream by default; fetch non-streamed for accurate tokens.
      // For real-time usage we approximate. In production, set `stream_options: { include_usage: true }`.
      const estimated = estimateTokensFromText(textAccum);
      outputTokens = Math.max(estimated, outputTokens);
      yield {
        type: "usage",
        inputTokens,
        outputTokens,
        cachedInputTokens,
        costMicros: estimateCostMicros(
          this.providerId,
          request.modelId,
          inputTokens,
          outputTokens,
          cachedInputTokens,
        ),
      };
      yield {
        type: "finish",
        reason: "stop",
        latencyMs: Date.now() - started,
        timeToFirstTokenMs: firstTokenAt ? firstTokenAt - started : undefined,
      };
    } catch (err) {
      if (request.abortSignal?.aborted) {
        yield { type: "finish", reason: "cancelled", latencyMs: Date.now() - started };
        return;
      }
      const e = normalizeOpenAIError(this.providerId, err);
      yield { type: "error", code: e.code, message: e.message, retriable: e.retriable };
    }
  }

  async validateCredential(credential: ProviderCredential): Promise<CredentialStatus> {
    try {
      const client = this.getClient(credential);
      const res = await client.models.list();
      // Consume at least one page
      await res[Symbol.asyncIterator]().next();
      return { valid: true };
    } catch (err) {
      const e = err as { status?: number; message?: string };
      return {
        valid: false,
        error: e.message ?? "Unknown error",
        retriable: e.status === 429 || (e.status ?? 0) >= 500,
      };
    }
  }

  async countTokens(): Promise<TokenEstimate> {
    throw new NotImplementedError(this.providerId, "countTokens");
  }

  // ----- helpers -----

  private async buildDescriptor(
    _credential: ProviderCredential,
    modelId: string,
  ): Promise<ModelDescriptor> {
    const pricing = priceFor(this.providerId, modelId);
    const caps = inferOpenAICapabilities(modelId);
    return {
      providerId: this.providerId,
      providerModelId: modelId,
      displayName: prettyOpenAIName(modelId),
      family: caps.family,
      capabilities: caps.capabilities,
      priceInputMicrosPer1M: pricing.input || undefined,
      priceOutputMicrosPer1M: pricing.output || undefined,
    };
  }
}

// ----- helpers (module-private) --------------------------------------------

export function isLikelyChatModel(id: string): boolean {
  if (id.includes("embedding")) return false;
  if (id.includes("dall-e")) return false;
  if (id.includes("whisper")) return false;
  if (id.includes("tts")) return false;
  if (id.includes("moderation")) return false;
  if (id.includes("realtime")) return false;
  if (id.includes("babbage")) return false;
  if (id.includes("davinci")) return false;
  if (id.includes("curie")) return false;
  if (id.includes("ada")) return false;
  return true;
}

function prettyOpenAIName(id: string): string {
  return id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function inferOpenAICapabilities(modelId: string): { family: string; capabilities: ModelDescriptor["capabilities"] } {
  const id = modelId.toLowerCase();
  const isReasoning = id.startsWith("o1") || id.startsWith("o3") || id.startsWith("o4");
  const isMini = id.includes("mini") || id.includes("nano");
  const isGpt41 = id.includes("gpt-4.1") || id.includes("gpt-4o");
  const supportsVision = isGpt41 || isReasoning;
  const family = isReasoning ? id.split("-")[0] : isGpt41 ? "gpt-4" : "gpt";
  return {
    family,
    capabilities: {
      contextWindow: id.includes("gpt-4.1") || isReasoning ? 1_000_000 : 128_000,
      maxOutputTokens: isReasoning ? 100_000 : 16_384,
      inputModalities: supportsVision ? ["text", "image"] : ["text"],
      outputModalities: ["text"],
      supportsTools: true,
      supportsVision,
      supportsAudio: false,
      supportsReasoning: isReasoning,
      supportsStreaming: true,
      supportsStructuredOutput: true,
      supportsWebSearch: isGpt41 || isReasoning,
    },
  };
}

function buildChatParams(request: UnifiedGenerationRequest): OpenAI.Chat.ChatCompletionCreateParams {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (request.system) {
    messages.push({ role: "system", content: request.system });
  }
  for (const m of request.messages) {
    if (m.role === "system") {
      const text = m.parts
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text!)
        .join("\n");
      if (text) messages.push({ role: "system", content: text });
      continue;
    }
    if (m.role === "user") {
      const content: OpenAI.Chat.ChatCompletionContentPart[] = m.parts
        .map((p): OpenAI.Chat.ChatCompletionContentPart | null => {
          if (p.type === "text" && p.text) {
            return { type: "text", text: p.text };
          }
          if (p.type === "image" && p.imageUrl) {
            return {
              type: "image_url",
              image_url: { url: p.imageUrl },
            };
          }
          return null;
        })
        .filter((p): p is OpenAI.Chat.ChatCompletionContentPart => p !== null);
      messages.push({ role: "user", content });
      continue;
    }
    if (m.role === "assistant") {
      const text = m.parts
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text!)
        .join("");
      messages.push({ role: "assistant", content: text });
      continue;
    }
  }

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model: request.modelId,
    messages,
    stream: false, // overridden by caller
  };
  if (request.temperature !== undefined) params.temperature = request.temperature;
  if (request.topP !== undefined) params.top_p = request.topP;
  if (request.maxOutputTokens !== undefined) params.max_tokens = request.maxOutputTokens;
  if (request.stopSequences?.length) params.stop = request.stopSequences;
  return params;
}

function mapFinishReason(reason: string | null | undefined): FinishReason {
  switch (reason) {
    case "stop":
      return "stop";
    case "length":
      return "length";
    case "tool_calls":
    case "function_call":
      return "tool_use";
    case "content_filter":
      return "content_filter";
    default:
      return "stop";
  }
}

function normalizeOpenAIError(providerId: string, err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const e = err as {
    status?: number;
    code?: string;
    message?: string;
    type?: string;
  };
  const status = e.status ?? 0;
  const retriable = status === 429 || status >= 500;
  let code = e.code ?? e.type ?? "unknown";
  if (status === 401) code = "invalid_api_key";
  else if (status === 403) code = "permission_denied";
  else if (status === 404) code = "model_not_found";
  else if (status === 429) code = "rate_limited";
  else if (status >= 500) code = "provider_unavailable";
  return new ProviderError(providerId, code, e.message ?? "OpenAI request failed", retriable, status);
}

function estimateCostMicros(
  providerId: string,
  modelId: string,
  input: number,
  output: number,
  cached: number = 0,
): number {
  const p = priceFor(providerId, modelId);
  if (!p.input && !p.output) return 0;
  const billableInput = Math.max(0, input - cached);
  const cachedCost = cached * (p.cachedInput ?? p.input) * 0.000001;
  const inputCost = billableInput * p.input * 0.000001;
  const outputCost = output * p.output * 0.000001;
  return Math.round(cachedCost + inputCost + outputCost);
}

function estimateTokensFromText(text: string): number {
  // Very rough: ~4 chars per token for English. Used only as a fallback.
  return Math.ceil(text.length / 4);
}

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2, 12);
}
