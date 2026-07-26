import type { UnifiedStreamEvent } from "@/lib/ai/types";

/**
 * Helper to consume a UnifiedStreamEvent iterable into a final text + usage.
 * Used by non-UI code paths (skills, image gen prompts, etc.) that need to
 * wait for the full response.
 */
export async function unifiedStreamEventsToText(stream: AsyncIterable<UnifiedStreamEvent>) {
  let text = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let cachedInputTokens = 0;
  let costMicros = 0;
  let finishReason: string | null = null;
  let errored: { code: string; message: string } | null = null;
  for await (const ev of stream) {
    if (ev.type === "text") text += ev.delta;
    else if (ev.type === "usage") {
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
  }
  return {
    text,
    usage: { inputTokens, outputTokens, cachedInputTokens, costMicros },
    finishReason: finishReason ?? "stop",
    errored,
  };
}
