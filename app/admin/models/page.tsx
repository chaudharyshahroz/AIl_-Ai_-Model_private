import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revalidatePath } from "next/cache";
import { formatMicros } from "@/lib/utils";
import { Cpu, RotateCw, Power, PowerOff, AlertCircle } from "lucide-react";
import { getAdapter } from "@/lib/ai/registry";
import { PROVIDER_PRICING, priceFor } from "@/lib/ai/pricing";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Models" };

export default async function AdminModelsPage() {
  await requireAdmin();
  const models = await db.modelDefinition.findMany({
    include: { provider: true },
    orderBy: [{ provider: { displayName: "asc" } }, { displayName: "asc" }],
  });

  async function toggleEnabled(formData: FormData) {
    "use server";
    const admin = await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const isEnabledForUsers = formData.get("action") === "enable";
    if (!id) return;
    await db.modelDefinition.update({ where: { id }, data: { isEnabledForUsers } });
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        actorType: "admin",
        action: isEnabledForUsers ? "model.enabled" : "model.disabled",
        targetType: "model",
        targetId: id,
      },
    });
    revalidatePath("/admin/models");
    revalidatePath("/app/chat");
  }

  async function updatePricing(formData: FormData) {
    "use server";
    const admin = await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const inDollars = String(formData.get("input") ?? "").trim();
    const outDollars = String(formData.get("output") ?? "").trim();
    if (!id) return;
    const data: Record<string, unknown> = {};
    if (inDollars) data.priceInputMicrosPer1M = Math.round(parseFloat(inDollars) * 1_000_000);
    if (outDollars) data.priceOutputMicrosPer1M = Math.round(parseFloat(outDollars) * 1_000_000);
    await db.modelDefinition.update({ where: { id }, data });
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        actorType: "admin",
        action: "model.pricing.updated",
        targetType: "model",
        targetId: id,
        metadata: JSON.stringify(data),
      },
    });
    revalidatePath("/admin/models");
  }

  async function syncProvider(formData: FormData) {
    "use server";
    await requireAdmin();
    const providerId = String(formData.get("providerId") ?? "");
    if (!providerId) return;
    const adapter = getAdapter(providerId);
    if (!adapter) return;
    const cred = await db.providerCredential.findFirst({
      where: { scope: "system", providerId, revokedAt: null, isValid: true },
    });
    if (!cred) {
      await db.modelProvider.update({
        where: { id: providerId },
        data: { syncStatus: "error", syncError: "No valid system key configured" },
      });
      revalidatePath("/admin/models");
      return;
    }
    try {
      const { decrypt } = await import("@/lib/crypto");
      const apiKey = decrypt(cred.encryptedKey);
      const discovered = await adapter.listModels({ apiKey, source: "system" });
      // Mark provider as healthy
      await db.modelProvider.update({
        where: { id: providerId },
        data: { syncStatus: "ok", syncError: null, lastSyncedAt: new Date() },
      });
      // Upsert discovered models (add new ones in pending status)
      let added = 0;
      for (const m of discovered) {
        const existing = await db.modelDefinition.findUnique({
          where: { providerId_providerModelId: { providerId, providerModelId: m.providerModelId } },
        });
        if (!existing) {
          await db.modelDefinition.create({
            data: {
              providerId,
              providerModelId: m.providerModelId,
              displayName: m.displayName,
              family: m.family,
              contextWindow: m.capabilities.contextWindow,
              maxOutputTokens: m.capabilities.maxOutputTokens,
              inputModalities: JSON.stringify(m.capabilities.inputModalities),
              outputModalities: JSON.stringify(m.capabilities.outputModalities),
              supportsTools: m.capabilities.supportsTools,
              supportsVision: m.capabilities.supportsVision,
              supportsAudio: m.capabilities.supportsAudio,
              supportsReasoning: m.capabilities.supportsReasoning,
              supportsStreaming: m.capabilities.supportsStreaming,
              supportsStructuredOutput: m.capabilities.supportsStructuredOutput,
              supportsWebSearch: m.capabilities.supportsWebSearch,
              priceInputMicrosPer1M: m.priceInputMicrosPer1M ?? 0,
              priceOutputMicrosPer1M: m.priceOutputMicrosPer1M ?? 0,
              qualityScore: 50,
              speedScore: 50,
              costScore: 50,
              isEnabledForUsers: false,
              status: "active",
            },
          });
          added += 1;
        }
      }
      await db.auditLog.create({
        data: {
          actorId: (await requireAdmin()).id,
          actorType: "admin",
          action: "model.sync",
          targetType: "provider",
          targetId: providerId,
          metadata: JSON.stringify({ added, total: discovered.length }),
        },
      });
    } catch (err) {
      await db.modelProvider.update({
        where: { id: providerId },
        data: { syncStatus: "error", syncError: (err as Error).message, lastSyncedAt: new Date() },
      });
    }
    revalidatePath("/admin/models");
  }

  const providers = await db.modelProvider.findMany({ orderBy: { displayName: "asc" } });
  const byProvider = new Map<string, typeof models>();
  for (const m of models) {
    if (!byProvider.has(m.providerId)) byProvider.set(m.providerId, []);
    byProvider.get(m.providerId)!.push(m);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Models</h1>
        <p className="text-sm text-muted-foreground">
          {models.filter((m) => m.isEnabledForUsers).length} of {models.length} models visible to users.
        </p>
      </div>

      {providers.map((provider) => {
        const providerModels = byProvider.get(provider.id) ?? [];
        return (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Cpu className="size-4" /> {provider.displayName}
                  </CardTitle>
                  <CardDescription>
                    {providerModels.length} models · last sync{" "}
                    {provider.lastSyncedAt ? new Date(provider.lastSyncedAt).toLocaleString() : "never"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {provider.syncStatus === "ok" && <Badge variant="success">Synced</Badge>}
                  {provider.syncStatus === "error" && <Badge variant="destructive"><AlertCircle className="mr-1 size-3" />Error</Badge>}
                  {provider.syncStatus === "pending" && <Badge variant="secondary">Pending</Badge>}
                  <form action={syncProvider}>
                    <input type="hidden" name="providerId" value={provider.id} />
                    <Button type="submit" size="sm" variant="outline">
                      <RotateCw /> Sync
                    </Button>
                  </form>
                </div>
              </div>
              {provider.syncError && (
                <p className="mt-2 text-xs text-destructive">{provider.syncError}</p>
              )}
            </CardHeader>
            <CardContent>
              {providerModels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No models registered. Click Sync to fetch the catalog.</p>
              ) : (
                <div className="space-y-2">
                  {providerModels.map((m) => {
                    const staticPrice = priceFor(m.providerId, m.providerModelId);
                    return (
                      <div key={m.id} className="rounded-lg border bg-card p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{m.displayName}</span>
                              {m.supportsReasoning && <Badge variant="outline" className="text-[10px]">Reasoning</Badge>}
                              {m.supportsVision && <Badge variant="outline" className="text-[10px]">Vision</Badge>}
                              {m.supportsTools && <Badge variant="outline" className="text-[10px]">Tools</Badge>}
                              {m.status === "deprecated" && <Badge variant="destructive" className="text-[10px]">Deprecated</Badge>}
                            </div>
                            <code className="font-mono text-xs text-muted-foreground">{m.providerModelId}</code>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {(m.contextWindow / 1000).toFixed(0)}k context · {(m.maxOutputTokens / 1000).toFixed(0)}k max output
                            </div>
                          </div>
                          <form action={toggleEnabled}>
                            <input type="hidden" name="id" value={m.id} />
                            <input type="hidden" name="action" value={m.isEnabledForUsers ? "disable" : "enable"} />
                            <Button
                              type="submit"
                              size="sm"
                              variant={m.isEnabledForUsers ? "outline" : "default"}
                            >
                              {m.isEnabledForUsers ? (
                                <>
                                  <PowerOff /> Disable
                                </>
                              ) : (
                                <>
                                  <Power /> Enable
                                </>
                              )}
                            </Button>
                          </form>
                        </div>
                        <form action={updatePricing} className="mt-3 flex flex-wrap items-end gap-2 border-t pt-3">
                          <input type="hidden" name="id" value={m.id} />
                          <div className="flex-1 min-w-[140px]">
                            <Label htmlFor={`${m.id}-in`} className="text-xs">Input $ / 1M tokens</Label>
                            <Input
                              id={`${m.id}-in`}
                              name="input"
                              type="number"
                              step="0.01"
                              defaultValue={(m.priceInputMicrosPer1M / 1_000_000).toFixed(2)}
                              className="h-8"
                            />
                            {staticPrice.input > 0 && m.priceInputMicrosPer1M !== staticPrice.input && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                List: ${(staticPrice.input / 1_000_000).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <div className="flex-1 min-w-[140px]">
                            <Label htmlFor={`${m.id}-out`} className="text-xs">Output $ / 1M tokens</Label>
                            <Input
                              id={`${m.id}-out`}
                              name="output"
                              type="number"
                              step="0.01"
                              defaultValue={(m.priceOutputMicrosPer1M / 1_000_000).toFixed(2)}
                              className="h-8"
                            />
                            {staticPrice.output > 0 && m.priceOutputMicrosPer1M !== staticPrice.output && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                List: ${(staticPrice.output / 1_000_000).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <Button type="submit" size="sm" variant="outline">Save</Button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
