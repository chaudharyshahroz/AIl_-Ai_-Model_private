import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMicros, formatTokens } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Usage" };

export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  await requireAdmin();
  const { days } = await searchParams;
  const dayCount = Math.min(180, Math.max(1, Number(days ?? 30)));

  const since = new Date();
  since.setDate(since.getDate() - dayCount);

  const [
    totals,
    byModel,
    byProvider,
    byDay,
    byOrg,
    byUser,
  ] = await Promise.all([
    db.usageEvent.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true, cachedInputTokens: true },
      _count: { _all: true },
    }),
    db.usageEvent.groupBy({
      by: ["modelId", "providerId"],
      where: { createdAt: { gte: since } },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      _count: { _all: true },
      orderBy: { _sum: { costMicros: "desc" } },
      take: 20,
    }),
    db.usageEvent.groupBy({
      by: ["providerId"],
      where: { createdAt: { gte: since } },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      _count: { _all: true },
      orderBy: { _sum: { costMicros: "desc" } },
    }),
    db.$queryRaw<Array<{ day: string; cost: number; tokens: number; reqs: number }>>`
      SELECT
        date(createdAt) as day,
        SUM(costMicros) as cost,
        SUM(inputTokens + outputTokens) as tokens,
        COUNT(*) as reqs
      FROM UsageEvent
      WHERE createdAt >= ${since}
      GROUP BY date(createdAt)
      ORDER BY day ASC
    `,
    db.usageEvent.groupBy({
      by: ["organizationId"],
      where: { createdAt: { gte: since } },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      _count: { _all: true },
      orderBy: { _sum: { costMicros: "desc" } },
      take: 20,
    }),
    db.usageEvent.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since } },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      _count: { _all: true },
      orderBy: { _sum: { costMicros: "desc" } },
      take: 20,
    }),
  ]);

  const orgIds = byOrg.map((o) => o.organizationId);
  const orgs = await db.organization.findMany({
    where: { id: { in: orgIds } },
    select: { id: true, name: true, slug: true },
  });
  const orgMap = new Map(orgs.map((o) => [o.id, o]));

  const userIds = byUser.map((u) => u.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const maxDayCost = Math.max(1, ...byDay.map((d) => d.cost));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">System usage</h1>
          <p className="text-sm text-muted-foreground">Last {dayCount} days · all users, all orgs</p>
        </div>
        <div className="flex gap-1 rounded-md border bg-muted/30 p-0.5 text-xs">
          {[7, 30, 90, 180].map((d) => (
            <a
              key={d}
              href={`/admin/usage?days=${d}`}
              className={`rounded px-2.5 py-1 ${d === dayCount ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {d}d
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total cost" value={formatMicros(totals._sum.costMicros ?? 0)} />
        <Stat label="Total tokens" value={formatTokens((totals._sum.inputTokens ?? 0) + (totals._sum.outputTokens ?? 0))} />
        <Stat label="Requests" value={(totals._count._all ?? 0).toLocaleString()} />
        <Stat
          label="Cached tokens"
          value={formatTokens(totals._sum.cachedInputTokens ?? 0)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily cost</CardTitle>
        </CardHeader>
        <CardContent>
          {byDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage in this window.</p>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {byDay.map((d) => (
                <div
                  key={d.day}
                  className="group relative flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
                  style={{ height: `${Math.max(2, (d.cost / maxDayCost) * 100)}%` }}
                  title={`${d.day}: ${formatMicros(d.cost)} · ${d.reqs} req`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By provider</CardTitle>
          </CardHeader>
          <CardContent>
            {byProvider.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage.</p>
            ) : (
              <div className="space-y-1.5">
                {byProvider.map((p) => (
                  <div key={p.providerId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{p.providerId}</Badge>
                      <span className="text-xs text-muted-foreground">{p._count._all} req</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">{formatTokens((p._sum.inputTokens ?? 0) + (p._sum.outputTokens ?? 0))}</span>
                      <span className="font-medium">{formatMicros(p._sum.costMicros ?? 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By model (top 20)</CardTitle>
          </CardHeader>
          <CardContent>
            {byModel.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage.</p>
            ) : (
              <div className="space-y-1.5">
                {byModel.map((m) => (
                  <div key={`${m.providerId}/${m.modelId}`} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{m.modelId}</code>
                      <span className="text-xs text-muted-foreground">{m._count._all} req</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">{formatTokens((m._sum.inputTokens ?? 0) + (m._sum.outputTokens ?? 0))}</span>
                      <span className="font-medium">{formatMicros(m._sum.costMicros ?? 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By organization</CardTitle>
          </CardHeader>
          <CardContent>
            {byOrg.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage.</p>
            ) : (
              <div className="space-y-1.5">
                {byOrg.map((o) => {
                  const org = orgMap.get(o.organizationId);
                  return (
                    <div key={o.organizationId} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                      <div>
                        <div className="font-medium">{org?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{org?.slug}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">{o._count._all} req</span>
                        <span className="font-medium">{formatMicros(o._sum.costMicros ?? 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By user (top 20)</CardTitle>
          </CardHeader>
          <CardContent>
            {byUser.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage.</p>
            ) : (
              <div className="space-y-1.5">
                {byUser.map((u) => {
                  const user = userMap.get(u.userId);
                  return (
                    <div key={u.userId} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                      <div>
                        <div className="font-medium">{user?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">{u._count._all} req</span>
                        <span className="font-medium">{formatMicros(u._sum.costMicros ?? 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}
