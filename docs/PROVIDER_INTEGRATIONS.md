# Provider Integrations

> Direct, official-API integrations. **Not** OpenRouter.

## Current (Phase 1-3)

### OpenAI

- **SDK:** `openai` ^4.73.0
- **Adapter:** `lib/ai/openai.ts`
- **Auth:** `OPENAI_API_KEY`
- **Catalog:** dynamic via `client.models.list()` filtered to chat models
- **Streaming:** `client.chat.completions.create({ stream: true })`
- **Capabilities:** tools, vision, structured output, web search (varies by model)
- **Notes:** usage tokens are estimated from text deltas because OpenAI doesn't include usage in the stream by default. Phase 10 work: enable `stream_options: { include_usage: true }` for accurate counts.

### Anthropic

- **SDK:** `@anthropic-ai/sdk` ^0.32.1
- **Adapter:** `lib/ai/anthropic.ts`
- **Auth:** `ANTHROPIC_API_KEY`
- **Catalog:** static (Anthropic doesn't expose a public models.list endpoint)
- **Streaming:** `client.messages.stream({...})` async iterator
- **Capabilities:** tools, vision (images + PDF), prompt caching
- **Notes:** prompt caching supported by wrapping system prompt in `cache_control: { type: "ephemeral" }`. Cached input tokens are tracked.

### Google AI (Gemini)

- **SDK:** `@google/generative-ai` ^0.21.0
- **Adapter:** `lib/ai/google.ts`
- **Auth:** `GOOGLE_AI_API_KEY`
- **Catalog:** static (the Node SDK doesn't ship a listModels helper)
- **Streaming:** `model.generateContentStream({...})` async iterator
- **Capabilities:** tools, vision, audio, video, PDF, web search (varies by model)
- **Notes:** 2M-token context window on Gemini 2.5 Pro. Multimodal input is the killer feature here.

## Planned (Phase 4+)

| Provider | SDK | Notes |
|---|---|---|
| xAI (Grok) | openai-compat | Use OpenAI SDK with xAI base URL |
| DeepSeek | openai-compat | Same |
| Mistral | `@mistralai/mistralai` | Native SDK |
| Cohere | `cohere-ai` | Native SDK |
| Moonshot Kimi | openai-compat | Same |
| Qwen | openai-compat | Same |
| Perplexity | openai-compat | Sonar models |
| Groq | openai-compat | Hosted OSS models |
| Together | openai-compat | Hosted OSS models |
| Fireworks | openai-compat | Hosted OSS models |
| Azure OpenAI | `@azure/openai` or openai-compat with base URL | Enterprise |
| AWS Bedrock | `@aws-sdk/client-bedrock-runtime` | Enterprise |
| Google Vertex AI | `@google-cloud/vertexai` | Enterprise |

OpenAI-compat providers can reuse `OpenAIAdapter` with a `baseUrl` override — `ProviderCredential.baseUrl` is already in the schema for this.

## Adding a new provider

1. **Adapter** — `lib/ai/<provider>.ts` implementing `AIProviderAdapter` (see `lib/ai/types.ts`).
2. **Registry** — register in `lib/ai/registry.ts`:
   ```ts
   import { NewProviderAdapter } from "./newprovider";
   adapters: { newprovider: new NewProviderAdapter() }
   ```
3. **Env key** — add to `getProviderEnvKey` in `lib/env.ts`:
   ```ts
   newprovider: process.env.NEWPROVIDER_API_KEY,
   ```
4. **Pricing** — add to `PROVIDER_PRICING` in `lib/ai/pricing.ts`.
5. **DB rows** — add to `prisma/seed.ts`:
   - One `ModelProvider` row
   - One `ModelDefinition` row per supported model
6. **Test** — `pnpm prisma:push && pnpm prisma:seed && pnpm dev`. Sign in and try the new model in the chat selector.

## Provider abstraction contract

Every adapter must implement:

```ts
interface AIProviderAdapter {
  readonly providerId: string;
  listModels(credential): Promise<ModelDescriptor[]>;
  getModel(credential, modelId): Promise<ModelDescriptor | null>;
  generate(credential, request): Promise<UnifiedResponse>;
  stream(credential, request): AsyncIterable<UnifiedStreamEvent>;
  validateCredential(credential): Promise<CredentialStatus>;
  countTokens?(credential, request): Promise<TokenEstimate>;
}
```

### Stream event protocol

`stream()` MUST yield, in order:

1. `{ type: "start", requestId, modelId, providerId }` — exactly once
2. Zero or more `{ type: "text", delta }` — partial text
3. Zero or more `{ type: "reasoning", delta }` — partial reasoning summary
4. Zero or more `{ type: "tool_call", toolCall, partial }` — tool calls
5. Zero or one `{ type: "usage", inputTokens, outputTokens, cachedInputTokens?, costMicros? }`
6. **Exactly one** of:
   - `{ type: "finish", reason, latencyMs, timeToFirstTokenMs? }` — successful end
   - `{ type: "error", code, message, retriable }` — error end

The orchestrator (`lib/ai/orchestrator.ts`) handles the rest: persistence, usage tracking, error normalization.

## Error handling

Adapters should throw `ProviderError` for hard failures (auth, network, model not found) and emit `{ type: "error" }` events for soft failures during streaming. Error codes are normalized in the adapter (see `normalizeOpenAIError`, `normalizeAnthropicError`, `normalizeGoogleError`).

Common codes:

- `invalid_api_key` — 401/403
- `permission_denied` — 403
- `model_not_found` — 404
- `rate_limited` — 429
- `provider_unavailable` — 5xx
- `provider_overloaded` — 529 (Anthropic)
- `bad_request` — 400
- `stream_error` — anything else

The chat UI surfaces these as plain-English messages (e.g. "Provider temporarily unavailable. Try again in a moment.") — never raw stack traces.
