import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageShell } from "@/components/admin/page-shell";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Audit log" };

export default async function AdminAuditPage() {
  await requireAdmin();
  const events = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const actorIds = Array.from(new Set(events.map((e) => e.actorId).filter(Boolean) as string[]));
  const actors = await db.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true, email: true },
  });
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  return (
    <AdminPageShell
      title="Audit log"
      subtitle="Last 200 events · every admin action is recorded."
      maxWidth="5xl"
    >
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {events.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">No events yet.</p>
            ) : (
              events.map((e) => {
                const actor = e.actorId ? actorMap.get(e.actorId) : null;
                return (
                  <div key={e.id} className="grid grid-cols-[160px_1fr_auto] gap-3 p-3 text-sm hover:bg-muted/30">
                    <div>
                      <Badge variant="outline" className="text-[10px]">{e.action}</Badge>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs">
                        {actor && <span className="text-muted-foreground">by {actor.name ?? actor.email}</span>}
                        {e.targetType && e.targetId && (
                          <span className="ml-2 text-muted-foreground">
                            on {e.targetType}:{e.targetId.slice(0, 8)}
                          </span>
                        )}
                      </div>
                      {e.metadata && e.metadata !== "{}" && (
                        <pre className="mt-1 max-w-2xl overflow-x-auto rounded bg-muted/40 px-2 py-1 font-mono text-[10px] text-muted-foreground">
                          {e.metadata}
                        </pre>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatRelativeTime(e.createdAt)}</div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
