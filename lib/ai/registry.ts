import type { AIProviderAdapter, ModelDescriptor, ProviderCredential } from "./types";
import { OpenAIAdapter, isLikelyChatModel } from "./openai";
import { AnthropicAdapter } from "./anthropic";
import { GoogleAdapter } from "./google";
import { OPENAI_COMPAT_PROVIDERS, openAICompatAdapterFor, type OpenAICompatProvider } from "./providers";
import { getProviderEnvKey } from "@/lib/env";

/**
 * Provider registry — the single entry point for the rest of the app.
 * Holds the live adapter instances and exposes a normalized API.
 *
 * To add a new provider:
 *   1. For an OpenAI-compat API: add to OPENAI_COMPAT_PROVIDERS in lib/ai/providers.ts
 *   2. For a custom API: implement AIProviderAdapter in lib/ai/<provider>.ts
 *      and register in `adapters` below
 *   3. Add the env key lookup in lib/env.ts
 *   4. Add pricing in lib/ai/pricing.ts
 *   5. Run pnpm prisma:push and seed (or sync via admin)
 */

const adapters: Record<string, AIProviderAdapter> = {
  openai: new OpenAIAdapter("openai"),
  anthropic: new AnthropicAdapter(),
  google: new GoogleAdapter(),
};

// OpenAI-compatible providers (xAI, DeepSeek, Moonshot, etc.)
for (const p of OPENAI_COMPAT_PROVIDERS) {
  const adapter = openAICompatAdapterFor(p.id);
  if (adapter) adapters[p.id] = adapter;
}

export function openAICompatProviderList(): OpenAICompatProvider[] {
  return OPENAI_COMPAT_PROVIDERS;
}

export function getAdapter(providerId: string): AIProviderAdapter | null {
  return adapters[providerId] ?? null;
}

export function listAdapterIds(): string[] {
  return Object.keys(adapters);
}

/**
 * Try to obtain a credential for a provider from the configured sources.
 * Order: system env key (Reklu-managed) → null (caller should ask user for BYOK).
 *
 * If the provider is not configured, returns null. The caller is responsible
 * for surfacing a clear "provider not configured" error to the user.
 */
export function getSystemCredential(providerId: string): ProviderCredential | null {
  const apiKey = getProviderEnvKey(providerId);
  if (!apiKey) return null;
  return { apiKey, source: "system" };
}

export interface ResolvedProvider {
  adapter: AIProviderAdapter;
  credential: ProviderCredential;
  source: "system" | "user" | "organization";
}

/**
 * Resolve a provider + credential in one call. Throws a clear error if not configured.
 */
export function resolveProvider(
  providerId: string,
  opts: { userCredential?: ProviderCredential; organizationCredential?: ProviderCredential } = {},
): ResolvedProvider {
  const adapter = getAdapter(providerId);
  if (!adapter) {
    throw new Error(
      `Unknown provider: ${providerId}. Supported: ${listAdapterIds().join(", ")}`,
    );
  }
  if (opts.organizationCredential?.apiKey) {
    return { adapter, credential: opts.organizationCredential, source: "organization" };
  }
  if (opts.userCredential?.apiKey) {
    return { adapter, credential: opts.userCredential, source: "user" };
  }
  const system = getSystemCredential(providerId);
  if (system) {
    return { adapter, credential: system, source: "system" };
  }
  throw new Error(
    `Provider "${providerId}" is not configured. Set the appropriate env var or add a BYOK key in Settings → Providers.`,
  );
}

/**
 * Get the list of models the current deployment is allowed to use.
 * Combines the static catalog (from the adapter) with the admin-controlled
 * enable/disable flags in the database.
 */
export async function listAvailableModels(
  enabledModelIds?: Set<string>,
): Promise<ModelDescriptor[]> {
  const configured = Object.keys(adapters).filter((id) => !!getProviderEnvKey(id));
  const out: ModelDescriptor[] = [];
  for (const providerId of configured) {
    const adapter = adapters[providerId];
    const cred = getSystemCredential(providerId)!;
    try {
      const models = await adapter.listModels(cred);
      for (const m of models) {
        if (enabledModelIds && !enabledModelIds.has(m.providerModelId)) continue;
        out.push(m);
      }
    } catch (err) {
      console.error(`[registry] failed to list models for ${providerId}:`, err);
    }
  }
  return out;
}
