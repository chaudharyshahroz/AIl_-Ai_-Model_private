import { db } from "@/lib/db";
import { resolveProvider } from "@/lib/ai/registry";
import { detectIntent, selectModel, type UserPreference } from "@/lib/ai/auto";
import { getProviderEnvKey } from "@/lib/env";
import { decrypt } from "@/lib/crypto";
import { BUILD_SYSTEM_PROMPT, BUILD_REWRITE_SYSTEM_PROMPT } from "@/lib/build/parser";
import type { ModelDescriptor, UnifiedGenerationRequest, UnifiedMessage, ProviderCredential } from "@/lib/ai/types";

/**
 * The chat orchestrator — the single place that turns a "user said X" event
 * into a streaming response. It:
 *   - resolves the model (manual or Reklu Auto)
 *   - builds the request (with system + history)
 *   - resolves the provider credential
 *   - persists messages before/after
 *   - emits usage events for billing
 *
 * The route handler (app/api/chat/stream/route.ts) wraps the returned async
 * iterable in a Server-Sent Events response.
 */

export interface ChatContext {
  userId: string;
  organizationId: string;
  conversationId: string;
  // The user's new message text
  userMessage: string;
  // Optional attachments (Phase 6)
  attachments?: Array<{ type: "image"; url: string; mimeType: string }>;
  // Model selection
  modelId?: string;        // explicit model
  auto?: boolean;          // use Reklu Auto
  preference?: UserPreference; // quality | balanced | speed | cost
  // Sampling
  temperature?: number;
  maxOutputTokens?: number;
  // Conversation behavior
  regenerate?: boolean;    // user clicked "regenerate" on a previous assistant turn
  parentMessageId?: string;
  // System
  system?: string;
  // Mode
  mode?: "chat" | "build"; // "build" enables the build system prompt + artifact extraction
  // Abort
  abortSignal?: AbortSignal;
}

export interface OrchestratorResult {
  model: ModelDescriptor;
  reason: string;         // user-facing "why this model" text
  stream: AsyncIterable<import("@/lib/ai/types").UnifiedStreamEvent>;
  // The assistant message row was pre-created and will be updated as we stream
  assistantMessageId: string;
}

export async function orchestrate(ctx: ChatContext): Promise<OrchestratorResult> {
  // 1. Load conversation + prior messages
  const conversation = await db.conversation.findUnique({
    where: { id: ctx.conversationId },
    include: {
      messages: {
        orderBy: { ordinal: "asc" },
        select: { id: true, role: true, content: true, modelId: true, modelProviderId: true, ordinal: true },
      },
    },
  });
  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== ctx.userId) throw new Error("Forbidden");

  // 2. Persist the user message
  const nextOrdinal = (conversation.messages[conversation.messages.length - 1]?.ordinal ?? -1) + 1;
  const userMessageRow = await db.message.create({
    data: {
      conversationId: ctx.conversationId,
      userId: ctx.userId,
      role: "user",
      content: ctx.userMessage,
      ordinal: nextOrdinal,
    },
  });
  // Update conversation preview
  await db.conversation.update({
    where: { id: ctx.conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: ctx.userMessage.slice(0, 200),
    },
  });

  // 3. Build the message history for the provider
  const history: UnifiedMessage[] = conversation.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant" | "system" | "tool",
      parts: m.content ? [{ type: "text" as const, text: m.content }] : [],
    }));
  // Append the new user message
  const userParts: UnifiedMessage["parts"] = [{ type: "text", text: ctx.userMessage }];
  if (ctx.attachments) {
    for (const a of ctx.attachments) {
      userParts.push({ type: "image", imageUrl: a.url, mimeType: a.mimeType });
    }
  }
  history.push({ role: "user", parts: userParts });

  // 4. Resolve the model
  const useAuto = ctx.auto ?? !ctx.modelId;
  const pref = ctx.preference ?? "balanced";
  const intent = detectIntent({ messages: history });
  const requiresVision = ctx.attachments?.some((a) => a.type === "image") ?? false;

  const enabled = await db.modelDefinition.findMany({
    where: { isEnabledForUsers: true, status: "active" },
  });
  const configuredProviderIds = new Set(
    Object.keys({
      openai: getProviderEnvKey("openai"),
      anthropic: getProviderEnvKey("anthropic"),
      google: getProviderEnvKey("google"),
    }).filter((k) => !!getProviderEnvKey(k)),
  );
  const available: ModelDescriptor[] = enabled
    .filter((m) => configuredProviderIds.has(m.providerId))
    .map((m) => ({
      providerId: m.providerId,
      providerModelId: m.providerModelId,
      displayName: m.displayName,
      family: m.family ?? undefined,
      capabilities: {
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        inputModalities: JSON.parse(m.inputModalities) as import("@/lib/ai/types").Modality[],
        outputModalities: JSON.parse(m.outputModalities) as import("@/lib/ai/types").Modality[],
        supportsTools: m.supportsTools,
        supportsVision: m.supportsVision,
        supportsAudio: m.supportsAudio,
        supportsReasoning: m.supportsReasoning,
        supportsStreaming: m.supportsStreaming,
        supportsStructuredOutput: m.supportsStructuredOutput,
        supportsWebSearch: m.supportsWebSearch,
      },
      priceInputMicrosPer1M: m.priceInputMicrosPer1M || undefined,
      priceOutputMicrosPer1M: m.priceOutputMicrosPer1M || undefined,
    }));

  let chosen: ModelDescriptor;
  let reason: string;
  if (useAuto) {
    const decision = selectModel(available, intent, {
      preference: pref,
      requiresVision,
      requiresTools: false,
      requiresReasoning: false,
    });
    chosen = decision.model;
    reason = decision.reason;
  } else {
    const target = ctx.modelId!;
    const found = available.find((m) => m.providerModelId === target);
    if (!found) {
      throw new Error(
        `Model "${target}" is not available. Either it doesn't exist, is disabled, or its provider isn't configured.`,
      );
    }
    chosen = found;
    reason = `Using ${found.displayName} (selected by you).`;
  }

  // 5. Resolve credential
  // Priority: system (admin-managed) DB key > system env key
  // Users don't bring their own keys in this build — that's an admin concern.
  let sysCred: ProviderCredential | undefined;
  const sysDbCred = await db.providerCredential.findFirst({
    where: { providerId: chosen.providerId, scope: "system", revokedAt: null, isValid: true },
  });
  if (sysDbCred) {
    try {
      const apiKey = decrypt(sysDbCred.encryptedKey);
      sysCred = { apiKey, source: "system", baseUrl: sysDbCred.baseUrl ?? undefined };
    } catch (err) {
      console.warn(`[orchestrator] failed to decrypt system credential ${sysDbCred.id}: ${(err as Error).message}`);
    }
  }
  const { adapter, credential, source } = resolveProvider(chosen.providerId, {
    organizationCredential: sysCred,
  });

  // 6. Pre-create the assistant message
  const assistantMessageRow = await db.message.create({
    data: {
      conversationId: ctx.conversationId,
      role: "assistant",
      ordinal: nextOrdinal + 1,
      content: "",
      modelProviderId: chosen.providerId,
      modelId: chosen.providerModelId,
    },
  });

  // 7. Build the unified request
  const systemPrompt =
    ctx.system ??
    (ctx.mode === "build"
      ? // If the conversation has a prior assistant message in build mode, treat the new turn as an iteration
        conversation.messages.some((m) => m.role === "assistant")
        ? BUILD_REWRITE_SYSTEM_PROMPT
        : BUILD_SYSTEM_PROMPT
      : defaultSystem());
  const req: UnifiedGenerationRequest = {
    providerId: chosen.providerId,
    modelId: chosen.providerModelId,
    messages: history,
    system: systemPrompt,
    temperature: ctx.temperature,
    maxOutputTokens: ctx.maxOutputTokens ?? (ctx.mode === "build" ? 16_000 : undefined),
    stream: true,
    abortSignal: ctx.abortSignal,
    requestId: assistantMessageRow.id,
    userId: ctx.userId,
    organizationId: ctx.organizationId,
  };

  // 8. Stream, and wrap with persistence + usage
  const inner = adapter.stream(credential, req);
  const wrapped = persistStream(inner, {
    assistantMessageId: assistantMessageRow.id,
    conversationId: ctx.conversationId,
    userId: ctx.userId,
    organizationId: ctx.organizationId,
    providerId: chosen.providerId,
    modelId: chosen.providerModelId,
    credentialSource: source,
  });

  return {
    model: chosen,
    reason,
    stream: wrapped,
    assistantMessageId: assistantMessageRow.id,
  };
}

function defaultSystem(): string {
  return [
    "You are Reklu, a thoughtful AI assistant in a multi-model workspace.",
    "Be direct, useful, and honest. Use Markdown when it helps (lists, tables, code blocks).",
    "If you don't know something, say so. If you need clarification, ask.",
    "Never reveal hidden chain-of-thought. High-level reasoning summaries are fine when useful.",
  ].join("\n");
}

async function* persistStream(
  inner: AsyncIterable<import("@/lib/ai/types").UnifiedStreamEvent>,
  meta: {
    assistantMessageId: string;
    conversationId: string;
    userId: string;
    organizationId: string;
    providerId: string;
    modelId: string;
    credentialSource: "system" | "user" | "organization";
  },
): AsyncIterable<import("@/lib/ai/types").UnifiedStreamEvent> {
  const started = Date.now();
  let textAccum = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let cachedInputTokens = 0;
  let costMicros = 0;
  let finishReason: string | null = null;
  let errored: { code: string; message: string } | null = null;
  let persistTimer: NodeJS.Timeout | null = null;

  // Throttle DB writes during streaming (write at most every 500ms)
  function schedulePersist() {
    if (persistTimer) return;
    persistTimer = setTimeout(() => {
      persistTimer = null;
      void db.message
        .update({
          where: { id: meta.assistantMessageId },
          data: { content: textAccum },
        })
        .catch(() => {
          // best-effort
        });
    }, 500);
  }

  try {
    for await (const ev of inner) {
      if (ev.type === "text") {
        textAccum += ev.delta;
        schedulePersist();
      } else if (ev.type === "usage") {
        inputTokens = ev.inputTokens;
        outputTokens = ev.outputTokens;
        cachedInputTokens = ev.cachedInputTokens ?? 0;
        costMicros = ev.costMicros ?? 0;
      } else if (ev.type === "finish") {
        finishReason = ev.reason;
      } else if (ev.type === "error") {
        errored = { code: ev.code, message: ev.message };
        finishReason = "error";
      }
      yield ev;
    }
  } catch (err) {
    errored = { code: "stream_error", message: (err as Error).message };
    finishReason = "error";
    yield {
      type: "error",
      code: errored.code,
      message: errored.message,
      retriable: false,
    };
  } finally {
    if (persistTimer) clearTimeout(persistTimer);
    const latencyMs = Date.now() - started;
    try {
      await db.message.update({
        where: { id: meta.assistantMessageId },
        data: {
          content: textAccum,
          inputTokens,
          outputTokens,
          costMicros,
          finishReason: finishReason ?? "stop",
          latencyMs,
          ...(errored
            ? { errorCode: errored.code, errorMessage: errored.message }
            : {}),
        },
      });
      await db.conversation.update({
        where: { id: meta.conversationId },
        data: {
          totalInputTokens: { increment: inputTokens },
          totalOutputTokens: { increment: outputTokens },
          totalCostMicros: { increment: costMicros },
        },
      });
      await db.usageEvent.create({
        data: {
          userId: meta.userId,
          organizationId: meta.organizationId,
          providerId: meta.providerId,
          modelId: meta.modelId,
          conversationId: meta.conversationId,
          messageId: meta.assistantMessageId,
          inputTokens,
          outputTokens,
          cachedInputTokens,
          costMicros,
          status: errored ? "error" : "ok",
          errorCode: errored?.code,
        },
      });
    } catch (err) {
      console.error("[orchestrator] failed to persist final message:", err);
    }
  }
}
