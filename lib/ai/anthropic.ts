import Anthropic from "@anthropic-ai/sdk";
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
 * Anthropic provider adapter.
 * Direct integration via the official `@anthropic-ai/sdk` SDK.
 */
export class AnthropicAdapter implements AIProviderAdapter {
  readonly providerId = "anthropic";

  private getClient(credential: ProviderCredential): Anthropic {
    return new Anthropic({
      apiKey: credential.apiKey,
      baseURL: credential.baseUrl,
    });
  }

  async listModels(credential: ProviderCredential): Promise<ModelDescriptor[]> {
    // Anthropic has no public models.list() endpoint, so we return a static catalog
    // and verify access by making a lightweight request.
    return this.staticCatalog().map((m) => ({
      ...m,
      providerId: this.providerId,
    }));
  }

  async getModel(
    credential: ProviderCredential,
    modelId: string,
  ): Promise<ModelDescriptor | null> {
    const entry = this.staticCatalog().find((m) => m.providerModelId === modelId);
    if (!entry) return null;
    return { ...entry, providerId: this.providerId };
  }

  async generate(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): Promise<UnifiedResponse> {
    const client = this.getClient(credential);
    const params = buildMessagesParams(request);
    const started = Date.now();
    try {
      const res = await client.messages.create({
        ...params,
        stream: false,
      });
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      const inputTokens = res.usage.input_tokens;
      const outputTokens = res.usage.output_tokens;
      const cachedTokens =
        (res.usage as unknown as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;
      return {
        text,
        toolCalls: [],
        usage: { inputTokens, outputTokens, cachedInputTokens: cachedTokens },
        costMicros: estimateCostMicros(
          this.providerId,
          request.modelId,
          inputTokens,
          outputTokens,
          cachedTokens,
        ),
        finishReason: mapStopReason(res.stop_reason),
        latencyMs: Date.now() - started,
        modelId: request.modelId,
        providerId: this.providerId,
      };
    } catch (err) {
      throw normalizeAnthropicError(this.providerId, err);
    }
  }

  async *stream(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): AsyncIterable<UnifiedStreamEvent> {
    const client = this.getClient(credential);
    const params = buildMessagesParams(request);
    const started = Date.now();
    let firstTokenAt: number | null = null;
    let textAccum = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let cachedInputTokens = 0;
    let stopReason: string | null = null;

    try {
      const stream = client.messages.stream({ ...params });
      yield {
        type: "start",
        requestId: request.requestId ?? cryptoRandomId(),
        modelId: request.modelId,
        providerId: this.providerId,
      };
      for await (const event of stream) {
        if (request.abortSignal?.aborted) {
          await stream.controller.abort();
          yield { type: "finish", reason: "cancelled", latencyMs: Date.now() - started };
          return;
        }
        if (event.type === "content_block_delta") {
          const delta = event.delta;
          if (delta.type === "text_delta") {
            if (firstTokenAt === null) firstTokenAt = Date.now();
            textAccum += delta.text;
            yield { type: "text", delta: delta.text };
          }
        } else if (event.type === "message_delta") {
          stopReason = event.delta.stop_reason ?? stopReason;
          const usage = (event.usage as unknown as { output_tokens?: number })?.output_tokens;
          if (typeof usage === "number") outputTokens = usage;
        } else if (event.type === "message_start") {
          const u = event.message.usage;
          inputTokens = u.input_tokens;
          cachedInputTokens =
            (u as unknown as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;
        }
      }
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
        reason: mapStopReason(stopReason),
        latencyMs: Date.now() - started,
        timeToFirstTokenMs: firstTokenAt ? firstTokenAt - started : undefined,
      };
    } catch (err) {
      if (request.abortSignal?.aborted) {
        yield { type: "finish", reason: "cancelled", latencyMs: Date.now() - started };
        return;
      }
      const e = normalizeAnthropicError(this.providerId, err);
      yield { type: "error", code: e.code, message: e.message, retriable: e.retriable };
    }
  }

  async validateCredential(credential: ProviderCredential): Promise<CredentialStatus> {
    try {
      const client = this.getClient(credential);
      // A cheap way: ask for 1 token from the smallest model.
      const res = await client.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      });
      return { valid: true, accountLabel: res.model };
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

  private staticCatalog(): ModelDescriptor[] {
    return [
      {
        providerId: this.providerId,
        providerModelId: "claude-sonnet-4-5",
        displayName: "Claude Sonnet 4.5",
        family: "claude-4",
        capabilities: {
          contextWindow: 200_000,
          maxOutputTokens: 8_192,
          inputModalities: ["text", "image", "pdf"],
          outputModalities: ["text"],
          supportsTools: true,
          supportsVision: true,
          supportsAudio: false,
          supportsReasoning: true,
          supportsStreaming: true,
          supportsStructuredOutput: true,
          supportsWebSearch: false,
        },
        priceInputMicrosPer1M: priceFor(this.providerId, "claude-sonnet-4-5").input || undefined,
        priceOutputMicrosPer1M: priceFor(this.providerId, "claude-sonnet-4-5").output || undefined,
      },
      {
        providerId: this.providerId,
        providerModelId: "claude-3-5-sonnet-20241022",
        displayName: "Claude 3.5 Sonnet",
        family: "claude-3.5",
        capabilities: {
          contextWindow: 200_000,
          maxOutputTokens: 8_192,
          inputModalities: ["text", "image", "pdf"],
          outputModalities: ["text"],
          supportsTools: true,
          supportsVision: true,
          supportsAudio: false,
          supportsReasoning: false,
          supportsStreaming: true,
          supportsStructuredOutput: true,
          supportsWebSearch: false,
        },
        priceInputMicrosPer1M: priceFor(this.providerId, "claude-3-5-sonnet-20241022").input || undefined,
        priceOutputMicrosPer1M: priceFor(this.providerId, "claude-3-5-sonnet-20241022").output || undefined,
      },
      {
        providerId: this.providerId,
        providerModelId: "claude-3-5-haiku-20241022",
        displayName: "Claude 3.5 Haiku",
        family: "claude-3.5",
        capabilities: {
          contextWindow: 200_000,
          maxOutputTokens: 8_192,
          inputModalities: ["text"],
          outputModalities: ["text"],
          supportsTools: true,
          supportsVision: false,
          supportsAudio: false,
          supportsReasoning: false,
          supportsStreaming: true,
          supportsStructuredOutput: true,
          supportsWebSearch: false,
        },
        priceInputMicrosPer1M: priceFor(this.providerId, "claude-3-5-haiku-20241022").input || undefined,
        priceOutputMicrosPer1M: priceFor(this.providerId, "claude-3-5-haiku-20241022").output || undefined,
      },
    ];
  }
}

// ----- module-private helpers ----------------------------------------------

function buildMessagesParams(request: UnifiedGenerationRequest) {
  const system: string | undefined = request.system;
  const messages: Anthropic.MessageParam[] = request.messages
    .filter((m) => m.role !== "system")
    .map((m) => {
      if (m.role === "user") {
        const content: Anthropic.ContentBlock[] = m.parts
          .map((p): Anthropic.ContentBlock | null => {
            if (p.type === "text" && p.text) {
              return { type: "text", text: p.text };
            }
            if (p.type === "image" && p.imageUrl) {
              if (p.imageUrl.startsWith("data:")) {
                const match = p.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                  return {
                    type: "image",
                    source: { type: "base64", media_type: match[1], data: match[2] },
                  } as unknown as Anthropic.ContentBlock;
                }
              }
              return {
                type: "image",
                source: { type: "url", url: p.imageUrl },
              } as unknown as Anthropic.ContentBlock;
            }
            return null;
          })
          .filter((c): c is Anthropic.ContentBlock => c !== null);
        return { role: "user" as const, content };
      }
      if (m.role === "assistant") {
        const text = m.parts
          .filter((p) => p.type === "text" && p.text)
          .map((p) => p.text!)
          .join("");
        return { role: "assistant" as const, content: text };
      }
      return { role: "user" as const, content: "" };
    });

  const params: Anthropic.MessageCreateParams = {
    model: request.modelId,
    messages,
    max_tokens: request.maxOutputTokens ?? 4_096,
  };
  if (system) params.system = system;
  if (request.temperature !== undefined) params.temperature = request.temperature;
  if (request.topP !== undefined) params.top_p = request.topP;
  if (request.stopSequences?.length) params.stop_sequences = request.stopSequences;
  return params;
}

function mapStopReason(reason: string | null | undefined): FinishReason {
  switch (reason) {
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "max_tokens":
      return "length";
    case "tool_use":
      return "tool_use";
    case "refusal":
      return "refusal";
    default:
      return "stop";
  }
}

function normalizeAnthropicError(providerId: string, err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const e = err as { status?: number; name?: string; message?: string; error?: { type?: string } };
  const status = e.status ?? 0;
  const retriable = status === 429 || status >= 500;
  let code = e.error?.type ?? e.name ?? "unknown";
  if (status === 401) code = "invalid_api_key";
  else if (status === 403) code = "permission_denied";
  else if (status === 404) code = "model_not_found";
  else if (status === 429) code = "rate_limited";
  else if (status === 529) code = "provider_overloaded";
  else if (status >= 500) code = "provider_unavailable";
  return new ProviderError(providerId, code, e.message ?? "Anthropic request failed", retriable, status);
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

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2, 12);
}
