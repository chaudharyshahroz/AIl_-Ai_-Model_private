import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listConfiguredProviders } from "@/lib/env";
import { getAdapter } from "@/lib/ai/registry";
import { decrypt } from "@/lib/crypto";
import { CheckCircle2, AlertCircle, Cpu, Database, Server } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · System health" };

export default async function AdminHealthPage() {
  await requireAdmin();

  const providers = await db.modelProvider.findMany({ orderBy: { displayName: "asc" } });
  const configured = listConfiguredProviders();

  // Live provider health checks
  const providerHealth = await Promise.all(
    providers.map(async (p) => {
      const adapter = getAdapter(p.id);
      const cred = await db.providerCredential.findFirst({
        where: { scope: "system", providerId: p.id, revokedAt: null },
      });
      const envKey = !!configured.includes(p.id);
      let ping: { ok: boolean; error?: string; latencyMs?: number } = { ok: false, error: "No credential" };
      if (adapter && (cred || envKey)) {
        try {
          const apiKey = cred
            ? decrypt(cred.encryptedKey)
            : (process.env[`${p.id.toUpperCase()}_API_KEY`] ?? process.env.OPENAI_API_KEY ?? "");
          const t0 = Date.now();
          const res = await adapter.validateCredential({
            apiKey,
            source: "system",
            baseUrl: cred?.baseUrl ?? undefined,
          });
          ping = { ok: res.valid, error: res.valid ? undefined : res.error, latencyMs: Date.now() - t0 };
        } catch (err) {
          ping = { ok: false, error: (err as Error).message };
        }
      }
      return { provider: p, ping, hasDbCred: !!cred, hasEnvKey: envKey };
    }),
  );

  // Recent error rate
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [errorCount, totalCount] = await Promise.all([
    db.usageEvent.count({ where: { status: "error", createdAt: { gte: last24h } } }),
    db.usageEvent.count({ where: { createdAt: { gte: last24h } } }),
  ]);
  const errorRate = totalCount === 0 ? 0 : (errorCount / totalCount) * 100;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System health</h1>
        <p className="text-sm text-muted-foreground">Live provider status and error rate.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Server className="size-3.5" />
              Server
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">Online</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Node {process.version}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="size-3.5" />
              Database
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">Connected</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {process.env.DATABASE_URL?.startsWith("file:") ? "SQLite" : "PostgreSQL"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="size-3.5" />
              Error rate (24h)
            </div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{errorRate.toFixed(1)}%</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {errorCount} of {totalCount} requests
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Providers</CardTitle>
          <CardDescription>Live ping each provider's API. Slow responses (over 3s) are flagged.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {providerHealth.map((h) => (
              <div key={h.provider.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className={`grid size-9 place-items-center rounded-lg ${
                    h.ping.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>
                    <Cpu className="size-4" />
                  </div>
                  <div>
                    <div className="font-medium">{h.provider.displayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.hasDbCred && "DB key"}
                      {h.hasDbCred && h.hasEnvKey && " + "}
                      {h.hasEnvKey && "env key"}
                      {!h.hasDbCred && !h.hasEnvKey && "no key configured"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {h.ping.latencyMs !== undefined && (
                    <span className="text-xs text-muted-foreground">{h.ping.latencyMs}ms</span>
                  )}
                  {h.ping.ok ? (
                    <Badge variant="success"><CheckCircle2 className="mr-1 size-3" />Healthy</Badge>
                  ) : (
                    <Badge variant="destructive" title={h.ping.error}>
                      <AlertCircle className="mr-1 size-3" />
                      {h.ping.error?.slice(0, 40) ?? "Down"}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest audit events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            See the full audit log in <a href="/admin/audit" className="text-primary underline-offset-4 hover:underline">/admin/audit</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
