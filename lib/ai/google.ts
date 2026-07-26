import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type Content,
  type Part,
} from "@google/generative-ai";
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
 * Google Gemini provider adapter.
 * Direct integration via the official `@google/generative-ai` SDK.
 */
export class GoogleAdapter implements AIProviderAdapter {
  readonly providerId = "google";

  private getClient(credential: ProviderCredential): GoogleGenerativeAI {
    return new GoogleGenerativeAI(credential.apiKey);
  }

  async listModels(credential: ProviderCredential): Promise<ModelDescriptor[]> {
    // The Node SDK doesn't ship a listModels helper, but we have a stable catalog.
    return this.staticCatalog().map((m) => ({ ...m, providerId: this.providerId }));
  }

  async getModel(
    _credential: ProviderCredential,
    modelId: string,
  ): Promise<ModelDescriptor | null> {
    const entry = this.staticCatalog().find((m) => m.providerModelId === modelId);
    return entry ? { ...entry, providerId: this.providerId } : null;
  }

  async generate(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): Promise<UnifiedResponse> {
    const client = this.getClient(credential);
    const model = this.buildModel(client, request);
    const contents = this.buildContents(request);
    const started = Date.now();
    try {
      const res = await model.generateContent({ contents, systemInstruction: request.system });
      const text = res.response.text();
      const usage = res.response.usageMetadata;
      const inputTokens = usage?.promptTokenCount ?? 0;
      const outputTokens = usage?.candidatesTokenCount ?? 0;
      const cachedTokens = usage?.cachedContentTokenCount ?? 0;
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
        finishReason: mapFinishReason(res.response.candidates?.[0]?.finishReason),
        latencyMs: Date.now() - started,
        modelId: request.modelId,
        providerId: this.providerId,
      };
    } catch (err) {
      throw normalizeGoogleError(this.providerId, err);
    }
  }

  async *stream(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): AsyncIterable<UnifiedStreamEvent> {
    const client = this.getClient(credential);
    const model = this.buildModel(client, request);
    const contents = this.buildContents(request);
    const started = Date.now();
    let firstTokenAt: number | null = null;
    let inputTokens = 0;
    let outputTokens = 0;
    let cachedInputTokens = 0;
    let finishReason: string | undefined;

    try {
      const stream = await model.generateContentStream({ contents, systemInstruction: request.system });
      yield {
        type: "start",
        requestId: request.requestId ?? cryptoRandomId(),
        modelId: request.modelId,
        providerId: this.providerId,
      };
      for await (const chunk of stream.stream) {
        if (request.abortSignal?.aborted) {
          yield { type: "finish", reason: "cancelled", latencyMs: Date.now() - started };
          return;
        }
        const text = chunk.text();
        if (text) {
          if (firstTokenAt === null) firstTokenAt = Date.now();
          yield { type: "text", delta: text };
        }
        const meta = chunk.usageMetadata;
        if (meta) {
          inputTokens = meta.promptTokenCount ?? inputTokens;
          outputTokens = meta.candidatesTokenCount ?? outputTokens;
          cachedInputTokens = meta.cachedContentTokenCount ?? cachedInputTokens;
        }
        const cand = (chunk as unknown as { candidates?: Array<{ finishReason?: string }> }).candidates;
        if (cand?.[0]?.finishReason) finishReason = cand[0].finishReason;
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
        reason: mapFinishReason(finishReason),
        latencyMs: Date.now() - started,
        timeToFirstTokenMs: firstTokenAt ? firstTokenAt - started : undefined,
      };
    } catch (err) {
      if (request.abortSignal?.aborted) {
        yield { type: "finish", reason: "cancelled", latencyMs: Date.now() - started };
        return;
      }
      const e = normalizeGoogleError(this.providerId, err);
      yield { type: "error", code: e.code, message: e.message, retriable: e.retriable };
    }
  }

  async validateCredential(credential: ProviderCredential): Promise<CredentialStatus> {
    try {
      const client = this.getClient(credential);
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
      const res = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
      });
      const _ = res.response.text();
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

  private buildModel(client: GoogleGenerativeAI, request: UnifiedGenerationRequest): GenerativeModel {
    return client.getGenerativeModel({
      model: request.modelId,
      generationConfig: {
        ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
        ...(request.topP !== undefined ? { topP: request.topP } : {}),
        ...(request.maxOutputTokens !== undefined ? { maxOutputTokens: request.maxOutputTokens } : {}),
        ...(request.stopSequences?.length ? { stopSequences: request.stopSequences } : {}),
      },
    });
  }

  private buildContents(request: UnifiedGenerationRequest): Content[] {
    return request.messages
      .filter((m) => m.role !== "system")
      .map((m): Content => {
        if (m.role === "user") {
          const parts: Part[] = m.parts
            .map((p): Part | null => {
              if (p.type === "text" && p.text) return { text: p.text };
              if (p.type === "image" && p.imageUrl) {
                if (p.imageUrl.startsWith("data:")) {
                  const match = p.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
                  if (match) {
                    return {
                      inlineData: { mimeType: match[1], data: match[2] },
                    };
                  }
                }
                return { fileData: { mimeType: p.mimeType ?? "image/jpeg", fileUri: p.imageUrl } };
              }
              return null;
            })
            .filter((p): p is Part => p !== null);
          return { role: "user", parts };
        }
        if (m.role === "assistant") {
          const text = m.parts
            .filter((p) => p.type === "text" && p.text)
            .map((p) => p.text!)
            .join("");
          return { role: "model", parts: [{ text }] };
        }
        return { role: "user", parts: [] };
      });
  }

  private staticCatalog(): ModelDescriptor[] {
    return [
      {
        providerId: this.providerId,
        providerModelId: "gemini-2.5-pro",
        displayName: "Gemini 2.5 Pro",
        family: "gemini-2.5",
        capabilities: {
          contextWindow: 2_000_000,
          maxOutputTokens: 64_000,
          inputModalities: ["text", "image", "audio", "video", "pdf"],
          outputModalities: ["text"],
          supportsTools: true,
          supportsVision: true,
          supportsAudio: true,
          supportsReasoning: true,
          supportsStreaming: true,
          supportsStructuredOutput: true,
          supportsWebSearch: true,
        },
        priceInputMicrosPer1M: priceFor(this.providerId, "gemini-2.5-pro").input || undefined,
        priceOutputMicrosPer1M: priceFor(this.providerId, "gemini-2.5-pro").output || undefined,
      },
      {
        providerId: this.providerId,
        providerModelId: "gemini-2.5-flash",
        displayName: "Gemini 2.5 Flash",
        family: "gemini-2.5",
        capabilities: {
          contextWindow: 1_000_000,
          maxOutputTokens: 64_000,
          inputModalities: ["text", "image", "audio", "video", "pdf"],
          outputModalities: ["text"],
          supportsTools: true,
          supportsVision: true,
          supportsAudio: true,
          supportsReasoning: true,
          supportsStreaming: true,
          supportsStructuredOutput: true,
          supportsWebSearch: true,
        },
        priceInputMicrosPer1M: priceFor(this.providerId, "gemini-2.5-flash").input || undefined,
        priceOutputMicrosPer1M: priceFor(this.providerId, "gemini-2.5-flash").output || undefined,
      },
      {
        providerId: this.providerId,
        providerModelId: "gemini-2.0-flash",
        displayName: "Gemini 2.0 Flash",
        family: "gemini-2.0",
        capabilities: {
          contextWindow: 1_000_000,
          maxOutputTokens: 8_192,
          inputModalities: ["text", "image", "audio", "video", "pdf"],
          outputModalities: ["text"],
          supportsTools: true,
          supportsVision: true,
          supportsAudio: true,
          supportsReasoning: false,
          supportsStreaming: true,
          supportsStructuredOutput: true,
          supportsWebSearch: true,
        },
        priceInputMicrosPer1M: priceFor(this.providerId, "gemini-2.0-flash").input || undefined,
        priceOutputMicrosPer1M: priceFor(this.providerId, "gemini-2.0-flash").output || undefined,
      },
    ];
  }
}

function mapFinishReason(reason: string | undefined): FinishReason {
  switch (reason) {
    case "STOP":
      return "stop";
    case "MAX_TOKENS":
      return "length";
    case "SAFETY":
      return "content_filter";
    case "RECITATION":
      return "refusal";
    default:
      return "stop";
  }
}

function normalizeGoogleError(providerId: string, err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const e = err as { status?: number; message?: string };
  const status = e.status ?? 0;
  const retriable = status === 429 || status >= 500;
  let code = "unknown";
  if (status === 400) code = "bad_request";
  else if (status === 401 || status === 403) code = "invalid_api_key";
  else if (status === 404) code = "model_not_found";
  else if (status === 429) code = "rate_limited";
  else if (status >= 500) code = "provider_unavailable";
  return new ProviderError(providerId, code, e.message ?? "Google request failed", retriable, status);
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
