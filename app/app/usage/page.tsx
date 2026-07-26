import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMicros, formatTokens, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Usage" };

export default async function UsagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [total, recent, byModel, byDay] = await Promise.all([
    db.usageEvent.aggregate({
      where: { userId: session.user.id, createdAt: { gte: since } },
      _sum: { inputTokens: true, outputTokens: true, costMicros: true },
      _count: { _all: true },
    }),
    db.usageEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { conversation: { select: { title: true, id: true } } },
    }),
    db.usageEvent.groupBy({
      by: ["modelId"],
      where: { userId: session.user.id, createdAt: { gte: since } },
      _sum: { inputTokens: true, outputTokens: true, costMicros: true },
      _count: { _all: true },
    }),
    db.$queryRaw<Array<{ day: string; cost: number; tokens: number }>>`
      SELECT
        date(createdAt) as day,
        SUM(costMicros) as cost,
        SUM(inputTokens + outputTokens) as tokens
      FROM UsageEvent
      WHERE userId = ${session.user.id} AND createdAt >= ${since}
      GROUP BY date(createdAt)
      ORDER BY day ASC
    `,
  ]);

  const totalIn = total._sum.inputTokens ?? 0;
  const totalOut = total._sum.outputTokens ?? 0;
  const totalCost = total._sum.costMicros ?? 0;
  const requestCount = total._count._all ?? 0;

  const maxDayCost = Math.max(1, ...byDay.map((d) => d.cost));

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
          <p className="text-sm text-muted-foreground">Last 30 days · personal workspace</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Total cost" value={formatMicros(totalCost)} />
          <Stat label="Total tokens" value={formatTokens(totalIn + totalOut)} />
          <Stat label="Requests" value={formatTokens(requestCount)} />
          <Stat label="Avg / request" value={requestCount ? formatMicros(Math.round(totalCost / requestCount)) : "$0.00"} />
        </div>

        {/* Daily cost chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily cost</CardTitle>
          </CardHeader>
          <CardContent>
            {byDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage yet.</p>
            ) : (
              <div className="flex h-32 items-end gap-1">
                {byDay.map((d) => (
                  <div
                    key={d.day}
                    className="group relative flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary"
                    style={{ height: `${(d.cost / maxDayCost) * 100}%`, minHeight: "2px" }}
                    title={`${d.day}: ${formatMicros(d.cost)}`}
                  />
                ))}
              </div>
            )}
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{byDay[0]?.day ?? ""}</span>
              <span>{byDay[byDay.length - 1]?.day ?? ""}</span>
            </div>
          </CardContent>
        </Card>

        {/* By model */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By model</CardTitle>
          </CardHeader>
          <CardContent>
            {byModel.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage yet.</p>
            ) : (
              <div className="space-y-2">
                {byModel
                  .sort((a, b) => (b._sum.costMicros ?? 0) - (a._sum.costMicros ?? 0))
                  .map((m) => (
                    <div key={m.modelId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{m.modelId}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {m._count._all} req
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{formatTokens((m._sum.inputTokens ?? 0) + (m._sum.outputTokens ?? 0))} tok</span>
                        <span className="font-medium text-foreground">{formatMicros(m._sum.costMicros ?? 0)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              <div className="space-y-1.5">
                {recent.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {e.status === "error" ? (
                        <Badge variant="destructive" className="shrink-0">Error</Badge>
                      ) : (
                        <Badge variant="success" className="shrink-0">OK</Badge>
                      )}
                      <span className="truncate font-mono text-xs">{e.modelId}</span>
                      {e.conversation && (
                        <span className="truncate text-muted-foreground">in {e.conversation.title}</span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatTokens(e.inputTokens + e.outputTokens)} tok</span>
                      <span>{formatMicros(e.costMicros)}</span>
                      <span>{formatRelativeTime(e.createdAt)}</span>
                    </div>
                  </div>
                ))}
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
