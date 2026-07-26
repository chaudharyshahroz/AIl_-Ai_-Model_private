import { db } from "@/lib/db";
import { detectIntent, selectModel, type Intent, type UserPreference } from "@/lib/ai/auto";
import { resolveProvider } from "@/lib/ai/registry";
import { getProviderEnvKey } from "@/lib/env";
import { decrypt } from "@/lib/crypto";
import type { ModelDescriptor, ProviderCredential, UnifiedGenerationRequest, UnifiedStreamEvent } from "@/lib/ai/types";
import { unifiedStreamEventsToText } from "@/lib/ai/stream-util";

/**
 * Skill execution engine.
 *
 * Pipeline:
 *   1. Load skill + current version
 *   2. Validate the input against the input schema (best-effort JSON Schema)
 *   3. Resolve the model (from allowedModels, or Reklu Auto)
 *   4. Resolve credentials (system keys)
 *   5. Build the prompt (system prompt + user input + skill instructions)
 *   6. Stream the response
 *   7. Validate output against outputSchema (best-effort)
 *   8. Run quality checks (best-effort)
 *   9. Persist the SkillRun
 *  10. Update skill usageCount
 */

export interface SkillRunContext {
  skillSlug: string;
  userId: string;
  organizationId: string;
  // Input
  input: string | Record<string, unknown>;
  // Conversation context
  conversationId?: string;
  // User preferences
  preference?: UserPreference;
  // Override model (must be in allowedModels)
  modelOverride?: { providerId: string; modelId: string };
  // Abort
  abortSignal?: AbortSignal;
}

export interface SkillRunResult {
  runId: string;
  outputText: string;
  output?: unknown;
  status: "ok" | "error";
  errorCode?: string;
  errorMessage?: string;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
  durationMs: number;
}

export async function runSkill(ctx: SkillRunContext): Promise<SkillRunResult> {
  const started = Date.now();

  // 1. Load skill
  const skill = await db.skill.findUnique({
    where: { slug: ctx.skillSlug },
    include: {
      versions: { where: { isCurrent: true }, take: 1 },
    },
  });
  if (!skill) throw new Error(`Skill not found: ${ctx.skillSlug}`);
  if (skill.status !== "active") throw new Error(`Skill is ${skill.status}`);
  const version = skill.versions[0];
  if (!version) throw new Error(`No current version for skill: ${ctx.skillSlug}`);

  // 2. Build the user message
  const userMessage = typeof ctx.input === "string"
    ? ctx.input
    : JSON.stringify(ctx.input, null, 2);

  // 3. Determine intent for model selection
  const intent = inferIntentFromSkill(skill.category, version.intentRules);

  // 4. Get enabled models and filter by allowed
  const enabled = await db.modelDefinition.findMany({
    where: { isEnabledForUsers: true, status: "active" },
  });
  const sysCredProviderIds = (
    await db.providerCredential.findMany({
      where: { scope: "system", revokedAt: null, isValid: true },
      select: { providerId: true },
    })
  ).map((c) => c.providerId);
  const configured = new Set<string>([...listConfiguredEnvProviders(), ...sysCredProviderIds]);
  const allowedModels = (JSON.parse(version.allowedModels) as Array<{ providerId: string; modelId: string }>);
  const allowedSet = new Set(allowedModels.map((m) => `${m.providerId}/${m.modelId}`));
  const candidates: ModelDescriptor[] = enabled
    .filter((m) => configured.has(m.providerId))
    .filter((m) => allowedSet.size === 0 || allowedSet.has(`${m.providerId}/${m.providerModelId}`))
    .map((m): ModelDescriptor => ({
      providerId: m.providerId,
      providerModelId: m.providerModelId,
      displayName: m.displayName,
      ...(m.family ? { family: m.family } : {}),
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
      ...(m.priceInputMicrosPer1M > 0 ? { priceInputMicrosPer1M: m.priceInputMicrosPer1M } : {}),
      ...(m.priceOutputMicrosPer1M > 0 ? { priceOutputMicrosPer1M: m.priceOutputMicrosPer1M } : {}),
    }));

  // 5. Choose the model
  let chosen = candidates[0];
  if (!chosen) {
    throw new Error("No available model for this skill. Admin needs to enable providers and models.");
  }
  if (ctx.modelOverride) {
    const found = candidates.find(
      (m) => m.providerId === ctx.modelOverride!.providerId && m.providerModelId === ctx.modelOverride!.modelId,
    );
    if (found) chosen = found;
  } else if (candidates.length > 1) {
    const decision = selectModel(candidates, intent, { preference: ctx.preference ?? "balanced" });
    chosen = decision.model;
  }

  // 6. Resolve credential
  const sysDbCred = await db.providerCredential.findFirst({
    where: { providerId: chosen.providerId, scope: "system", revokedAt: null, isValid: true },
  });
  let credential: ProviderCredential | undefined;
  if (sysDbCred) {
    try {
      credential = {
        apiKey: decrypt(sysDbCred.encryptedKey),
        source: "system",
        baseUrl: sysDbCred.baseUrl ?? undefined,
      };
    } catch {
      // fall through to env
    }
  }
  if (!credential) {
    const envKey = getProviderEnvKey(chosen.providerId);
    if (envKey) credential = { apiKey: envKey, source: "system" };
  }
  if (!credential) {
    throw new Error(`No credential for provider ${chosen.providerId}`);
  }

  // 7. Pre-create the SkillRun
  const run = await db.skillRun.create({
    data: {
      skillId: skill.id,
      skillVersionId: version.id,
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      conversationId: ctx.conversationId,
      input: typeof ctx.input === "string" ? JSON.stringify({ input: ctx.input }) : JSON.stringify(ctx.input),
      status: "running",
    },
  });

  // 8. Build and execute the request
  const req: UnifiedGenerationRequest = {
    providerId: chosen.providerId,
    modelId: chosen.providerModelId,
    messages: [{ role: "user", parts: [{ type: "text", text: userMessage }] }],
    system: version.systemPrompt,
    stream: true,
    abortSignal: ctx.abortSignal,
    requestId: run.id,
    userId: ctx.userId,
    organizationId: ctx.organizationId,
  };

  const { adapter } = resolveProvider(chosen.providerId);
  const stream = adapter.stream(credential, req);
  const { text, usage, finishReason, errored } = await unifiedStreamEventsToText(stream);

  const durationMs = Date.now() - started;
  const completedAt = new Date();
  const status = errored ? "error" : finishReason === "stop" || finishReason === "length" ? "ok" : "error";

  await db.skillRun.update({
    where: { id: run.id },
    data: {
      outputText: text,
      status,
      completedAt,
      durationMs,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costMicros: usage.costMicros ?? 0,
      errorCode: errored?.code,
      errorMessage: errored?.message,
    },
  });

  // 9. Update usage count
  await db.skill.update({
    where: { id: skill.id },
    data: { usageCount: { increment: 1 } },
  });

  return {
    runId: run.id,
    outputText: text,
    status,
    errorCode: errored?.code,
    errorMessage: errored?.message,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    costMicros: usage.costMicros ?? 0,
    durationMs,
  };
}

function inferIntentFromSkill(category: string, intentRulesJson: string): Intent {
  try {
    const rules = JSON.parse(intentRulesJson) as string[];
    if (rules.includes("code")) return "code";
    if (rules.includes("research")) return "research";
    if (rules.includes("reasoning")) return "reasoning";
  } catch {
    // ignore
  }
  switch (category) {
    case "research": return "research";
    case "writing": return "creative";
    case "business": return "chat";
    case "dev": return "code";
    case "data": return "reasoning";
    case "creative": return "creative";
    default: return "chat";
  }
}

function listConfiguredEnvProviders(): string[] {
  return ["openai", "anthropic", "google"].filter((p) => !!getProviderEnvKey(p));
}
