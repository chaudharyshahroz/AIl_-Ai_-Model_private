import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AdminPageShell } from "@/components/admin/page-shell";
import { ProviderDot } from "@/components/ui/provider-badge";
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
    <AdminPageShell
      title="System usage"
      subtitle={`Last ${dayCount} days · all users, all orgs`}
      actions={
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
      }
    >
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
          <CardContent className="p-0">
            {byProvider.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No usage.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider</TableHead>
                    <TableHead className="text-right">Req</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byProvider.map((p) => (
                    <TableRow key={p.providerId}>
                      <TableCell className="flex items-center gap-1.5 font-medium">
                        <ProviderDot providerId={p.providerId} />
                        {p.providerId}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{p._count._all}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatTokens((p._sum.inputTokens ?? 0) + (p._sum.outputTokens ?? 0))}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatMicros(p._sum.costMicros ?? 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By model (top 20)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byModel.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No usage.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Req</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byModel.map((m) => (
                    <TableRow key={`${m.providerId}/${m.modelId}`}>
                      <TableCell className="flex items-center gap-1.5">
                        <ProviderDot providerId={m.providerId} />
                        <code className="font-mono text-xs">{m.modelId}</code>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{m._count._all}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {formatTokens((m._sum.inputTokens ?? 0) + (m._sum.outputTokens ?? 0))}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatMicros(m._sum.costMicros ?? 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By organization</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byOrg.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No usage.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead className="text-right">Req</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byOrg.map((o) => {
                    const org = orgMap.get(o.organizationId);
                    return (
                      <TableRow key={o.organizationId}>
                        <TableCell>
                          <div className="font-medium">{org?.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{org?.slug}</div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{o._count._all}</TableCell>
                        <TableCell className="text-right font-medium">{formatMicros(o._sum.costMicros ?? 0)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By user (top 20)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byUser.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No usage.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Req</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byUser.map((u) => {
                    const user = userMap.get(u.userId);
                    return (
                      <TableRow key={u.userId}>
                        <TableCell>
                          <div className="font-medium">{user?.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{u._count._all}</TableCell>
                        <TableCell className="text-right font-medium">{formatMicros(u._sum.costMicros ?? 0)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
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
