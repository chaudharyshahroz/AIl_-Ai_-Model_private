import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminPageShell } from "@/components/admin/page-shell";
import { ProviderDot } from "@/components/ui/provider-badge";
import { revalidatePath } from "next/cache";
import { Key, Trash2, ExternalLink, ShieldCheck, AlertCircle, CheckCircle2, TestTube2 } from "lucide-react";
import { getProviderEnvKey } from "@/lib/env";
import { getAdapter, openAICompatProviderList } from "@/lib/ai/registry";
import { decrypt, encrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · API Keys" };

const NATIVE_PROVIDERS = [
  { id: "openai", name: "OpenAI", docs: "https://platform.openai.com/api-keys", models: ["gpt-4o", "gpt-4o-mini", "o3-mini"] },
  { id: "anthropic", name: "Anthropic", docs: "https://console.anthropic.com/settings/keys", models: ["Claude Sonnet 4.5", "Claude 3.5 Sonnet", "Claude 3.5 Haiku"] },
  { id: "google", name: "Google AI", docs: "https://aistudio.google.com/apikey", models: ["Gemini 2.5 Pro", "Gemini 2.5 Flash", "Gemini 2.0 Flash"] },
];

const COMPAT_PROVIDERS = openAICompatProviderList().map((p) => ({
  id: p.id,
  name: p.displayName,
  docs: p.websiteUrl,
  models: p.models.map((m) => m.displayName),
}));

export default async function AdminProvidersPage() {
  const admin = await requireAdmin();
  const systemCreds = await db.providerCredential.findMany({
    where: { scope: "system", revokedAt: null },
    select: { id: true, providerId: true, label: true, lastValidatedAt: true, isValid: true, validationError: true, baseUrl: true, createdAt: true },
    orderBy: { providerId: "asc" },
  });
  const sysByProvider = new Map(systemCreds.map((c) => [c.providerId, c]));

  async function addKey(formData: FormData) {
    "use server";
    const admin = await requireAdmin();
    const providerId = String(formData.get("providerId") ?? "");
    const apiKey = String(formData.get("apiKey") ?? "").trim();
    const label = String(formData.get("label") ?? "").trim() || null;
    const baseUrl = String(formData.get("baseUrl") ?? "").trim() || null;
    if (!providerId || !apiKey) return;
    const adapter = getAdapter(providerId);
    if (!adapter) return;
    const result = await adapter.validateCredential({ apiKey, source: "system", baseUrl: baseUrl ?? undefined });
    const enc = encrypt(apiKey);
    const existing = await db.providerCredential.findFirst({
      where: { scope: "system", providerId, revokedAt: null },
    });
    if (existing) {
      await db.providerCredential.update({
        where: { id: existing.id },
        data: {
          encryptedKey: enc,
          isValid: result.valid,
          validationError: result.valid ? null : result.error,
          lastValidatedAt: new Date(),
          baseUrl,
          label,
        },
      });
    } else {
      await db.providerCredential.create({
        data: {
          providerId,
          encryptedKey: enc,
          isValid: result.valid,
          validationError: result.valid ? null : result.error,
          lastValidatedAt: new Date(),
          baseUrl,
          label,
          scope: "system",
        },
      });
    }
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        actorType: "admin",
        action: result.valid ? "provider.key.added" : "provider.key.added_invalid",
        targetType: "provider",
        targetId: providerId,
        metadata: JSON.stringify({ valid: result.valid, label }),
      },
    });
    revalidatePath("/admin/providers");
    revalidatePath("/app/chat");
  }

  async function removeKey(formData: FormData) {
    "use server";
    const admin = await requireAdmin();
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    const cred = await db.providerCredential.findUnique({ where: { id } });
    await db.providerCredential.update({ where: { id }, data: { revokedAt: new Date() } });
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        actorType: "admin",
        action: "provider.key.removed",
        targetType: "provider",
        targetId: cred?.providerId ?? null,
        metadata: JSON.stringify({ credentialId: id }),
      },
    });
    revalidatePath("/admin/providers");
    revalidatePath("/app/chat");
  }

  async function testKey(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const cred = await db.providerCredential.findUnique({ where: { id } });
    if (!cred) return;
    const adapter = getAdapter(cred.providerId);
    if (!adapter) return;
    const apiKey = decrypt(cred.encryptedKey);
    const result = await adapter.validateCredential({ apiKey, source: "system", baseUrl: cred.baseUrl ?? undefined });
    await db.providerCredential.update({
      where: { id },
      data: {
        isValid: result.valid,
        validationError: result.valid ? null : result.error,
        lastValidatedAt: new Date(),
      },
    });
    revalidatePath("/admin/providers");
  }

  return (
    <AdminPageShell
      title="Provider API keys"
      subtitle="System-wide keys. All users in this deployment use these to talk to providers. Keys are encrypted at rest with AES-256-GCM and never sent to the browser."
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" />
            How keys are stored
          </CardTitle>
          <CardDescription>
            Each key is encrypted with your ENCRYPTION_KEY before it hits the database. Only the
            server decrypts at request time. Removing a key immediately blocks new chat requests
            for that provider.
          </CardDescription>
        </CardHeader>
      </Card>

      {[...NATIVE_PROVIDERS, ...COMPAT_PROVIDERS].map((p) => {
        const sysKey = sysByProvider.get(p.id);
        const envKey = getProviderEnvKey(p.id);
        const hasAny = !!sysKey || !!envKey;
        return (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ProviderDot providerId={p.id} />
                  {p.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {sysKey?.isValid && <Badge variant="success"><CheckCircle2 className="mr-1 size-3" /> Connected</Badge>}
                  {sysKey && !sysKey.isValid && <Badge variant="destructive"><AlertCircle className="mr-1 size-3" /> Invalid</Badge>}
                  {envKey && !sysKey && <Badge variant="secondary">Env key (read-only)</Badge>}
                </div>
              </div>
              <CardDescription>{p.models.join(" · ")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sysKey && (
                <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Key className="size-3.5 text-muted-foreground" />
                      <code className="font-mono text-xs">sys-{p.id}-••••{sysKey.id.slice(-6)}</code>
                      {sysKey.label && <span className="text-xs text-muted-foreground">· {sysKey.label}</span>}
                    </div>
                    <div className="flex gap-1.5">
                      <form action={testKey}>
                        <input type="hidden" name="id" value={sysKey.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          <TestTube2 /> Test
                        </Button>
                      </form>
                      <form action={removeKey}>
                        <input type="hidden" name="id" value={sysKey.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          <Trash2 /> Remove
                        </Button>
                      </form>
                    </div>
                  </div>
                  {sysKey.validationError && (
                    <p className="text-xs text-destructive">{sysKey.validationError}</p>
                  )}
                  {sysKey.baseUrl && (
                    <p className="text-xs text-muted-foreground">Base URL: {sysKey.baseUrl}</p>
                  )}
                  {sysKey.lastValidatedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      Last tested: {new Date(sysKey.lastValidatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {envKey && !sysKey && (
                <p className="text-xs text-muted-foreground">
                  A system env key is configured. Override it below to manage via this dashboard.
                </p>
              )}

              <form action={addKey} className="space-y-3">
                <input type="hidden" name="providerId" value={p.id} />
                <div className="space-y-2">
                  <Label htmlFor={`${p.id}-key`}>{sysKey ? "Replace key" : "API key"}</Label>
                  <Input
                    id={`${p.id}-key`}
                    name="apiKey"
                    type="password"
                    placeholder="Paste your key"
                    required={!sysKey}
                    autoComplete="off"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${p.id}-label`}>Label (optional)</Label>
                    <Input id={`${p.id}-label`} name="label" placeholder="e.g. Primary" maxLength={60} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${p.id}-base`}>Base URL (optional)</Label>
                    <Input
                      id={`${p.id}-base`}
                      name="baseUrl"
                      placeholder="https://api.openai.com/v1"
                      maxLength={200}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit">{sysKey ? "Replace key" : "Add key"}</Button>
                  <a
                    href={p.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Get a key <ExternalLink className="ml-0.5 inline size-3" />
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        );
      })}

      <Separator />
      <p className="text-xs text-muted-foreground">
        More providers ship in Phase 4 (xAI, DeepSeek, Mistral, Cohere, Moonshot, Qwen,
        Perplexity, Groq, Together, Fireworks). Adding a new provider is a single adapter file.
      </p>
    </AdminPageShell>
  );
}
