/**
 * Unified types for the AI provider layer.
 *
 * Every provider adapter normalizes its SDK into these types.
 * The chat orchestration, usage tracking, and UI all speak this language.
 */

// ----- Capabilities --------------------------------------------------------

export type Modality = "text" | "image" | "audio" | "video" | "pdf";

export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export interface ModelCapabilities {
  contextWindow: number;
  maxOutputTokens: number;
  inputModalities: Modality[];
  outputModalities: Modality[];
  supportsTools: boolean;
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsReasoning: boolean;
  supportsStreaming: boolean;
  supportsStructuredOutput: boolean;
  supportsWebSearch: boolean;
}

// ----- Messages ------------------------------------------------------------

export interface UnifiedMessagePart {
  type: "text" | "image" | "file";
  text?: string;
  // For images, base64 data URL or https URL
  imageUrl?: string;
  // For files, an internal Reklu file ID (the orchestrator fetches the bytes)
  fileId?: string;
  mimeType?: string;
}

export interface UnifiedMessage {
  role: "system" | "user" | "assistant" | "tool";
  // Content
  parts: UnifiedMessagePart[];
  // For tool messages
  toolCallId?: string;
  toolName?: string;
  // For assistant messages with tool calls
  toolCalls?: UnifiedToolCall[];
  // Reasoning summary (if any)
  reasoningSummary?: string;
}

// ----- Tools ---------------------------------------------------------------

export interface UnifiedToolDefinition {
  name: string;
  description: string;
  // JSON Schema
  inputSchema: Record<string, unknown>;
}

export interface UnifiedToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

// ----- Generation request --------------------------------------------------

export interface UnifiedGenerationRequest {
  // Model identity
  providerId: string;
  modelId: string;
  // Conversation
  messages: UnifiedMessage[];
  system?: string;
  // Sampling
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  // Reasoning
  reasoningEffort?: ReasoningEffort;
  // Tools
  tools?: UnifiedToolDefinition[];
  // Behavior
  stream: boolean;
  // Abort
  abortSignal?: AbortSignal;
  // Request ID for tracing
  requestId?: string;
  // User/tenant for logging only — never sent to the provider
  userId?: string;
  organizationId?: string;
}

// ----- Streaming events ----------------------------------------------------

export type UnifiedStreamEvent =
  | { type: "start"; requestId: string; modelId: string; providerId: string }
  | { type: "reasoning"; delta: string }
  | { type: "text"; delta: string }
  | { type: "tool_call"; toolCall: UnifiedToolCall; partial: boolean }
  | {
      type: "usage";
      inputTokens: number;
      outputTokens: number;
      cachedInputTokens?: number;
      costMicros?: number;
    }
  | { type: "finish"; reason: FinishReason; latencyMs: number; timeToFirstTokenMs?: number }
  | { type: "error"; code: string; message: string; retriable: boolean };

export type FinishReason =
  | "stop"
  | "length"
  | "tool_use"
  | "content_filter"
  | "refusal"
  | "error"
  | "cancelled";

// ----- Non-streaming response ---------------------------------------------

export interface UnifiedResponse {
  text: string;
  reasoningSummary?: string;
  toolCalls: UnifiedToolCall[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    cachedInputTokens: number;
  };
  costMicros: number;
  finishReason: FinishReason;
  latencyMs: number;
  modelId: string;
  providerId: string;
}

// ----- Provider credentials -----------------------------------------------

export type ProviderCredentialSource = "system" | "organization" | "user";

export interface ProviderCredential {
  // Decrypted API key — never serialized to the client
  apiKey: string;
  source: ProviderCredentialSource;
  // Optional base URL override (e.g. Azure, Bedrock)
  baseUrl?: string;
}

// ----- Adapter contract ---------------------------------------------------

export interface AIProviderAdapter {
  readonly providerId: string;

  /**
   * Return a list of models the configured credential is allowed to use.
   * If the credential is invalid or unauthorized, throw.
   */
  listModels(credential: ProviderCredential): Promise<ModelDescriptor[]>;

  /**
   * Return a single model descriptor.
   */
  getModel(credential: ProviderCredential, modelId: string): Promise<ModelDescriptor | null>;

  /**
   * Run a non-streaming generation.
   */
  generate(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): Promise<UnifiedResponse>;

  /**
   * Stream a generation. The returned async iterable MUST emit a `start` event first,
   * then `text`/`reasoning`/`tool_call` deltas, then either `finish` or `error` last.
   */
  stream(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): AsyncIterable<UnifiedStreamEvent>;

  /**
   * Validate a credential by making a lightweight API call.
   * Returns { valid: true } on success or { valid: false, error } on failure.
   */
  validateCredential(credential: ProviderCredential): Promise<CredentialStatus>;

  /**
   * Estimate token count for the given request. Optional — providers that don't
   * support it can throw NotImplementedError and the orchestrator will fall back
   * to a character-based estimate.
   */
  countTokens?(
    credential: ProviderCredential,
    request: UnifiedGenerationRequest,
  ): Promise<TokenEstimate>;
}

export interface ModelDescriptor {
  providerId: string;
  providerModelId: string;
  displayName: string;
  family?: string;
  capabilities: ModelCapabilities;
  // Per 1M tokens, in micro-cents. Providers that don't publish pricing leave these at 0
  // and the admin pricing rules in the database take over.
  priceInputMicrosPer1M?: number;
  priceOutputMicrosPer1M?: number;
  deprecationNote?: string;
}

export type CredentialStatus =
  | { valid: true; accountId?: string; accountLabel?: string }
  | { valid: false; error: string; retriable: boolean };

export interface TokenEstimate {
  inputTokens: number;
  // Some providers can estimate output too; for the ones that can't, leave at 0
  outputTokens?: number;
}

// ----- Errors --------------------------------------------------------------

export class ProviderError extends Error {
  constructor(
    public readonly providerId: string,
    public readonly code: string,
    message: string,
    public readonly retriable: boolean = false,
    public readonly httpStatus?: number,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export class NotImplementedError extends Error {
  constructor(public readonly providerId: string, public readonly feature: string) {
    super(`${feature} is not implemented for provider ${providerId}`);
    this.name = "NotImplementedError";
  }
}
