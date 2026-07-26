import { describe, it, expect } from "vitest";
import { detectIntent, selectModel } from "@/lib/ai/auto";
import type { ModelDescriptor } from "@/lib/ai/types";

const make = (overrides: Partial<ModelDescriptor>): ModelDescriptor => ({
  providerId: "openai",
  providerModelId: "gpt-4o",
  displayName: "GPT-4o",
  capabilities: {
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
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
  ...overrides,
});

describe("detectIntent", () => {
  it("detects code intent from 'debug this function'", () => {
    const intent = detectIntent({
      messages: [{ role: "user", parts: [{ type: "text", text: "Help me debug this TypeScript function" }] }],
    });
    expect(intent).toBe("code");
  });

  it("detects research intent from 'compare X vs Y'", () => {
    const intent = detectIntent({
      messages: [{ role: "user", parts: [{ type: "text", text: "Compare Postgres vs SQLite for a small SaaS" }] }],
    });
    expect(intent).toBe("research");
  });

  it("detects vision intent from image attachments", () => {
    const intent = detectIntent({
      messages: [
        { role: "user", parts: [{ type: "text", text: "What's in this picture?" }, { type: "image", imageUrl: "https://x" }] },
      ],
    });
    expect(intent).toBe("vision");
  });

  it("defaults to chat when nothing matches", () => {
    const intent = detectIntent({
      messages: [{ role: "user", parts: [{ type: "text", text: "Hello there" }] }],
    });
    expect(intent).toBe("chat");
  });
});

describe("selectModel", () => {
  it("throws when no models are available", () => {
    expect(() => selectModel([], "chat")).toThrow(/No models are available/);
  });

  it("filters by required capabilities", () => {
    const textOnly = make({ providerModelId: "text-only", displayName: "Text only", capabilities: { ...make({}).capabilities, supportsVision: false } });
    const vision = make({ providerModelId: "vision", displayName: "Vision", capabilities: { ...make({}).capabilities, supportsVision: true } });
    const decision = selectModel([textOnly, vision], "chat", { preference: "balanced", requiresVision: true });
    expect(decision.model.providerModelId).toBe("vision");
  });

  it("picks reasoning-capable model for reasoning intent", () => {
    const nonReasoning = make({ providerModelId: "base", displayName: "Base" });
    const reasoning = make({ providerModelId: "reasoner", displayName: "Reasoner", capabilities: { ...make({}).capabilities, supportsReasoning: true } });
    const decision = selectModel([nonReasoning, reasoning], "reasoning", { preference: "balanced" });
    expect(decision.model.providerModelId).toBe("reasoner");
  });

  it("returns a user-facing reason", () => {
    const m = make({ providerModelId: "gpt-4o", displayName: "GPT-4o" });
    const decision = selectModel([m], "code", { preference: "balanced" });
    expect(decision.reason).toMatch(/Selected GPT-4o for/);
    expect(decision.considered).toContain("gpt-4o");
  });
});
