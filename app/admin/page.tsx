import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMicros, formatRelativeTime, formatTokens } from "@/lib/utils";
import { listConfiguredProviders } from "@/lib/env";
import { listAdapterIds } from "@/lib/ai/registry";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  Cpu,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminHome() {
  await requireAdmin();
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [
    userCount,
    orgCount,
    conversationCount,
    messageCount,
    recentErrors,
    totalCost,
    last24h,
    recentEvents,
    topUsers,
    configuredProviders,
  ] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.organization.count({ where: { deletedAt: null } }),
    db.conversation.count({ where: { deletedAt: null } }),
    db.message.count(),
    db.usageEvent.count({ where: { status: "error", createdAt: { gte: since } } }),
    db.usageEvent.aggregate({
      where: { createdAt: { gte: since } },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
    }),
    db.usageEvent.aggregate({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      _sum: { costMicros: true },
      _count: { _all: true },
    }),
    db.usageEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { email: true, name: true } },
        conversation: { select: { title: true, id: true } },
      },
    }),
    db.usageEvent.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since } },
      _sum: { costMicros: true, inputTokens: true, outputTokens: true },
      _count: { _all: true },
      orderBy: { _sum: { costMicros: "desc" } },
      take: 5,
    }),
    Promise.resolve({ configured: listConfiguredProviders(), registered: listAdapterIds() }),
  ]);

  const last24hUsers = await db.user.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const topUserIds = topUsers.map((t) => t.userId);
  const topUserDetails = await db.user.findMany({
    where: { id: { in: topUserIds } },
    select: { id: true, email: true, name: true },
  });
  const topUserMap = new Map(topUserDetails.map((u) => [u.id, u]));

  const missingProviders = configuredProviders.registered.filter(
    (id) => !configuredProviders.configured.includes(id),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin overview</h1>
        <p className="text-sm text-muted-foreground">Last 30 days · system-wide</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat icon={Users} label="Users" value={userCount.toString()} sub={`+${last24hUsers.length} today`} href="/admin/users" />
        <Stat icon={MessageSquare} label="Conversations" value={conversationCount.toLocaleString()} sub={`${messageCount.toLocaleString()} messages`} href="/admin/users" />
        <Stat icon={DollarSign} label="30d cost" value={formatMicros(totalCost._sum.costMicros ?? 0)} sub={`${formatTokens((totalCost._sum.inputTokens ?? 0) + (totalCost._sum.outputTokens ?? 0))} tokens`} href="/admin/usage" />
        <Stat icon={AlertCircle} label="Errors (30d)" value={recentErrors.toString()} sub="failed requests" href="/admin/usage" />
      </div>

      {/* Provider health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="size-4" />
            Provider health
          </CardTitle>
          <CardDescription>
            {configuredProviders.configured.length} of {configuredProviders.registered.length} providers have a system key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {configuredProviders.registered.map((id) => {
              const ok = configuredProviders.configured.includes(id);
              return (
                <div
                  key={id}
                  className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs"
                >
                  <span
                    className={`size-1.5 rounded-full ${ok ? "bg-success" : "bg-muted-foreground/40"}`}
                  />
                  <span className="font-medium">{id}</span>
                </div>
              );
            })}
          </div>
          {missingProviders.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {missingProviders.length} provider{missingProviders.length === 1 ? "" : "s"} missing keys.{" "}
              <Link href="/admin/providers" className="text-primary underline-offset-4 hover:underline">
                Add keys →
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" /> Top users (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No usage yet.</p>
            ) : (
              <div className="space-y-1.5">
                {topUsers.map((t) => {
                  const u = topUserMap.get(t.userId);
                  return (
                    <div key={t.userId} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{u?.name ?? "—"}</div>
                        <div className="truncate text-xs text-muted-foreground">{u?.email}</div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{t._count._all} req</span>
                        <span className="font-mono">{formatTokens((t._sum.inputTokens ?? 0) + (t._sum.outputTokens ?? 0))} tok</span>
                        <span className="font-medium text-foreground">{formatMicros(t._sum.costMicros ?? 0)}</span>
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4" /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="space-y-1.5">
                {recentEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                    <div className="flex min-w-0 items-center gap-2">
                      {e.status === "error" ? (
                        <Badge variant="destructive" className="shrink-0">Error</Badge>
                      ) : (
                        <Badge variant="success" className="shrink-0">OK</Badge>
                      )}
                      <span className="truncate font-mono text-xs">{e.modelId}</span>
                      {e.user && (
                        <span className="truncate text-xs text-muted-foreground">
                          by {e.user.name ?? e.user.email}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(e.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New users (24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {last24hUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups in the last 24 hours.</p>
          ) : (
            <div className="space-y-1.5">
              {last24hUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{u.name ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(u.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
        </div>
        <div className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="block transition-opacity hover:opacity-80">
      {inner}
    </Link>
  );
}
