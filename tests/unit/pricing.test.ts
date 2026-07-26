import { describe, it, expect } from "vitest";
import { priceFor, PROVIDER_PRICING } from "@/lib/ai/pricing";

describe("pricing", () => {
  it("returns known OpenAI price for gpt-4o", () => {
    const p = priceFor("openai", "gpt-4o");
    expect(p.input).toBe(2_500_000); // $2.50 per 1M input tokens (in micro-cents)
    expect(p.output).toBe(10_000_000); // $10.00
  });

  it("returns known Anthropic price for Claude Sonnet 4.5", () => {
    const p = priceFor("anthropic", "claude-sonnet-4-5");
    expect(p.input).toBeGreaterThan(0);
    expect(p.output).toBeGreaterThan(0);
  });

  it("returns known Google price for Gemini 2.5 Pro", () => {
    const p = priceFor("google", "gemini-2.5-pro");
    expect(p.input).toBeGreaterThan(0);
  });

  it("returns zeros for unknown models", () => {
    const p = priceFor("openai", "gpt-9000");
    expect(p.input).toBe(0);
    expect(p.output).toBe(0);
  });

  it("returns zeros for unknown providers", () => {
    const p = priceFor("reklus", "anything");
    expect(p.input).toBe(0);
  });

  it("includes cached input pricing for Gemini", () => {
    const p = priceFor("google", "gemini-1.5-pro");
    expect(p.cachedInput).toBeDefined();
    expect(p.cachedInput).toBeLessThan(p.input);
  });
});
