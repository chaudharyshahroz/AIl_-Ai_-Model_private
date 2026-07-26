/**
 * Pricing for the default model catalog (per 1M tokens, in micro-cents).
 *
 * The values here are the upstream provider list prices. The DB admin pricing rules
 * (lib/ai/registry.ts → effectivePriceFor) can override or add markup.
 *
 * 1 cent = 1,000,000 micro-cents.
 * $1.00 per 1M input tokens = 100 cents * 1,000,000 = 100,000,000 micros.
 *
 * Sources (as of 2026):
 *   - OpenAI:    https://openai.com/api/pricing
 *   - Anthropic: https://www.anthropic.com/pricing
 *   - Google:    https://ai.google.dev/pricing
 */
export const PROVIDER_PRICING: Record<
  string,
  Record<string, { input: number; output: number; cachedInput?: number }>
> = {
  openai: {
    "gpt-4o":                { input:  2_500_000,  output: 10_000_000 },
    "gpt-4o-mini":           { input:    150_000,  output:    600_000 },
    "gpt-4.1":               { input:  2_000_000,  output:  8_000_000 },
    "gpt-4.1-mini":          { input:    400_000,  output:  1_600_000 },
    "gpt-4.1-nano":          { input:    100_000,  output:    400_000 },
    "o1":                    { input: 15_000_000,  output: 60_000_000 },
    "o1-mini":               { input:  3_000_000,  output: 12_000_000 },
    "o3":                    { input: 10_000_000,  output: 40_000_000 },
    "o3-mini":               { input:  1_100_000,  output:  4_400_000 },
    "o4-mini":               { input:  1_100_000,  output:  4_400_000 },
  },
  anthropic: {
    "claude-3-5-sonnet-20241022": { input: 3_000_000, output: 15_000_000 },
    "claude-3-5-sonnet-20240620": { input: 3_000_000, output: 15_000_000 },
    "claude-3-5-haiku-20241022":  { input:   800_000, output:  4_000_000 },
    "claude-3-opus-20240229":     { input: 15_000_000, output: 75_000_000 },
    "claude-3-haiku-20240307":    { input:   250_000, output:  1_250_000 },
    "claude-sonnet-4-5":          { input: 3_000_000, output: 15_000_000 },
    "claude-opus-4-1":            { input: 15_000_000, output: 75_000_000 },
  },
  google: {
    "gemini-1.5-pro":       { input:  1_250_000, output:  5_000_000, cachedInput:   312_500 },
    "gemini-1.5-flash":     { input:     75_000, output:    300_000, cachedInput:    18_750 },  // $0.075/$0.30
    "gemini-2.0-flash":     { input:    100_000, output:    400_000 },
    "gemini-2.0-flash-exp": { input:           0, output:           0 }, // free during experimental
    "gemini-2.5-pro":       { input:  1_250_000, output:  10_000_000 },
    "gemini-2.5-flash":     { input:    300_000, output:    2_500_000 },
  },
};

/**
 * Resolve the price for a (provider, model) pair. Returns zeros if the model
 * isn't in the static catalog — the admin pricing rules in the DB will then apply.
 */
export function priceFor(
  providerId: string,
  modelId: string,
): { input: number; output: number; cachedInput?: number } {
  const providerPricing = PROVIDER_PRICING[providerId];
  if (!providerPricing) return { input: 0, output: 0 };
  return providerPricing[modelId] ?? { input: 0, output: 0 };
}
