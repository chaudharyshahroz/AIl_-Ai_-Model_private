import type { ModelDescriptor, UnifiedGenerationRequest } from "./types";

/**
 * Reklu Auto — selects an appropriate model for a given request based on:
 *   - intent (code, chat, reasoning, vision, ...)
 *   - required capabilities (tools, vision, large context, ...)
 *   - user preference (quality vs. speed vs. cost)
 *   - current provider availability
 *
 * Returns a model AND a short user-facing explanation of the choice.
 *
 * The explanation is the ONLY thing surfaced to the user; this function
 * never reveals internal scoring weights or proprietary reasoning.
 */

export type Intent =
  | "chat"          // general conversation
  | "code"          // writing, reviewing, or debugging code
  | "reasoning"     // math, planning, multi-step problems
  | "vision"        // image input
  | "long_context"  // very long documents (>100k tokens)
  | "tools"         // heavy tool use
  | "creative"      // creative writing
  | "research";     // web research / synthesis

export type UserPreference = "auto" | "quality" | "balanced" | "speed" | "cost";

export interface AutoDecision {
  model: ModelDescriptor;
  reason: string;             // short, user-facing explanation
  // Internal signal (for the model scorecard / analytics — never shown to users):
  intent: Intent;
  preference: UserPreference;
  // What alternatives were considered
  considered: string[];
}

const INTENT_KEYWORDS: Record<Intent, RegExp[]> = {
  code: [
    /\bcode\b/i, /\bfunction\b/i, /\bbug\b/i, /\bdebug/i, /\brefactor/i,
    /\btypescript\b/i, /\bpython\b/i, /\bjavascript\b/i, /\brust\b/i, /\bgo\b/i,
    /\bimplement\b/i, /\bapi\b/i, /\bclass\b/i, /\bcompiler\b/i, /\bsyntax\b/i,
  ],
  reasoning: [
    /\breason/i, /\bprove\b/i, /\bsolve\b/i, /\bmath/i, /\bequation/i,
    /\bstep.by.step\b/i, /\blogic\b/i, /\btheorem\b/i,
  ],
  vision: [
    /\bimage\b/i, /\bscreenshot\b/i, /\bphoto\b/i, /\bdiagram\b/i, /\bchart\b/i, /\bpicture\b/i,
  ],
  long_context: [
    /\bsummarize\b.*\b(book|document|paper|article|essay|report)\b/i,
    /\bpdf\b/i, /\bpaper\b/i, /\btranscript\b/i, /\bwhole book\b/i,
  ],
  tools: [
    /\buse my\b/i, /\bconnect to\b/i, /\bintegrate with\b/i, /\bcheck my calendar\b/i,
    /\bsend\b/i, /\bcreate a file\b/i,
  ],
  creative: [
    /\bstory\b/i, /\bpoem\b/i, /\bsong\b/i, /\bnovel\b/i, /\bcharacter\b/i,
    /\bcreative\b/i, /\bimagine\b/i,
  ],
  research: [
    /\bresearch\b/i, /\bsources\b/i, /\bcite\b/i, /\blatest\b/i, /\brecent news\b/i,
    /\bvs\.?\b/i, /\bcompare\b/i, /\breview\b/i,
  ],
  chat: [],
};

export function detectIntent(
  request: Pick<UnifiedGenerationRequest, "messages">,
): Intent {
  const lastUserText = (request.messages ?? [])
    .filter((m) => m.role === "user")
    .flatMap((m) => m.parts)
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n");
  const hasImage = (request.messages ?? [])
    .flatMap((m) => m.parts)
    .some((p) => p.type === "image");
  if (hasImage) return "vision";

  let bestIntent: Intent = "chat";
  let bestScore = 0;
  for (const [intent, patterns] of Object.entries(INTENT_KEYWORDS) as [Intent, RegExp[]][]) {
    if (intent === "chat") continue;
    let score = 0;
    for (const p of patterns) {
      const matches = lastUserText.match(new RegExp(p.source, "gi"));
      if (matches) score += matches.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }
  return bestIntent;
}

export interface SelectOptions {
  preference: UserPreference;
  // If the caller has explicit model capabilities, prefer models matching them
  requiresVision?: boolean;
  requiresTools?: boolean;
  requiresReasoning?: boolean;
  // Soft context hint — used to pick models with big context windows for long docs
  estimatedInputTokens?: number;
}

/**
 * Select the best model from the available catalog.
 */
export function selectModel(
  available: ModelDescriptor[],
  intent: Intent,
  options: SelectOptions = { preference: "auto" },
): AutoDecision {
  if (available.length === 0) {
    throw new Error(
      "No models are available. Configure at least one provider (set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_AI_API_KEY).",
    );
  }

  const candidates = available.filter((m) => {
    if (options.requiresVision && !m.capabilities.supportsVision) return false;
    if (options.requiresTools && !m.capabilities.supportsTools) return false;
    if (options.requiresReasoning && !m.capabilities.supportsReasoning) return false;
    if (options.estimatedInputTokens && m.capabilities.contextWindow < options.estimatedInputTokens) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    throw new Error(
      "No available model matches the request's requirements (vision/tools/reasoning/context). Add more providers or relax the requirements.",
    );
  }

  // Score each candidate
  const pref = options.preference === "auto" ? "balanced" : options.preference;
  const scored = candidates.map((m) => ({
    model: m,
    score: scoreModel(m, intent, pref, options),
  }));
  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0];

  return {
    model: winner.model,
    intent,
    preference: options.preference,
    considered: scored.map((s) => s.model.providerModelId),
    reason: explainChoice(winner.model, intent, pref),
  };
}

function scoreModel(
  m: ModelDescriptor,
  intent: Intent,
  pref: UserPreference,
  options: SelectOptions,
): number {
  let s = 0;

  // Intent fit
  if (intent === "code" && /codex|coder|gpt-4\.1|claude-3-5|claude-sonnet|gemini/i.test(m.displayName)) s += 30;
  if (intent === "reasoning" && m.capabilities.supportsReasoning) s += 40;
  if (intent === "vision" && m.capabilities.supportsVision) s += 50;
  if (intent === "long_context" && m.capabilities.contextWindow >= 1_000_000) s += 40;
  if (intent === "tools" && m.capabilities.supportsTools) s += 30;
  if (intent === "creative" && /claude|gpt-4|sonnet|opus/i.test(m.displayName)) s += 20;
  if (intent === "research" && m.capabilities.supportsWebSearch) s += 25;

  // Preference
  if (pref === "quality") s += 50;
  if (pref === "speed") {
    s += m.capabilities.maxOutputTokens > 16_000 ? 5 : 20;
  }
  if (pref === "cost") {
    // Prefer cheaper models
    const inputPrice = m.priceInputMicrosPer1M ?? 0;
    if (inputPrice === 0) s += 20; // unknown — treat as cheap
    else if (inputPrice < 1_000_000) s += 30;
    else if (inputPrice < 5_000_000) s += 10;
  }

  // Capability match
  if (options.requiresVision && m.capabilities.supportsVision) s += 10;
  if (options.requiresTools && m.capabilities.supportsTools) s += 10;
  if (options.requiresReasoning && m.capabilities.supportsReasoning) s += 10;

  // Penalize tiny context windows
  if (m.capabilities.contextWindow < 32_000) s -= 20;

  return s;
}

function explainChoice(m: ModelDescriptor, intent: Intent, pref: UserPreference): string {
  const reasons: string[] = [];
  if (intent === "code") reasons.push("strong coding performance");
  if (intent === "reasoning") reasons.push("reasoning capability");
  if (intent === "vision") reasons.push("vision input support");
  if (intent === "long_context") reasons.push(`${Math.round(m.capabilities.contextWindow / 1000)}k-token context window`);
  if (intent === "tools") reasons.push("tool use");
  if (intent === "creative") reasons.push("strong writing quality");
  if (intent === "research") reasons.push(m.capabilities.supportsWebSearch ? "web search support" : "research strength");
  if (reasons.length === 0) reasons.push("balanced chat performance");

  if (pref === "quality") reasons.push("quality preference");
  if (pref === "speed") reasons.push("speed preference");
  if (pref === "cost") reasons.push("cost preference");

  return `Selected ${m.displayName} for ${reasons.join(", ")}.`;
}
