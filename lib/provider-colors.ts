/**
 * Single source of truth for provider identity color. Every surface that
 * names a model or provider (model selector, message meta, /models, admin
 * providers/models) should pull from here so the same provider always reads
 * the same color across the product.
 *
 * The six providers with a fixed hue also have a CSS variable defined in
 * globals.css (--provider-openai etc.) and a matching Tailwind color
 * (provider-openai, provider-anthropic, ...). Anything outside that set
 * gets a deterministic fallback hue so newly added providers still get a
 * consistent color without a code change here.
 */

export const PROVIDER_HUES: Record<string, string> = {
  openai: "--provider-openai",
  anthropic: "--provider-anthropic",
  google: "--provider-google",
  xai: "--provider-xai",
  deepseek: "--provider-deepseek",
  mistral: "--provider-mistral",
};

const FALLBACK_SATURATION = 55;
const FALLBACK_LIGHTNESS = 52;

/** Deterministically hash a provider id to a hue (0-359) for providers outside the fixed set. */
function hashHue(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

/** Returns just the HSL triple, e.g. "var(--provider-openai)" or "212 55% 52%" — usable inside hsl(...) or hsl(... / alpha). */
export function providerHsl(providerId: string): string {
  const varName = PROVIDER_HUES[providerId];
  if (varName) return `var(${varName})`;
  return `${hashHue(providerId)} ${FALLBACK_SATURATION}% ${FALLBACK_LIGHTNESS}%`;
}

/** Returns a full CSS color value, e.g. "hsl(var(--provider-openai))". */
export function providerColor(providerId: string): string {
  return `hsl(${providerHsl(providerId)})`;
}

/** Tailwind class for providers in the fixed set; null for hashed fallbacks (use inline style + providerColor instead). */
export function providerColorClass(providerId: string): string | null {
  if (providerId in PROVIDER_HUES) return `bg-provider-${providerId}`;
  return null;
}
