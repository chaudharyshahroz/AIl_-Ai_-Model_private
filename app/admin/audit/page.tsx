import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
          {events.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((e) => {
                  const actor = e.actorId ? actorMap.get(e.actorId) : null;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="text-[10px]">{e.action}</Badge>
                      </TableCell>
                      <TableCell className="min-w-[280px]">
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
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-xs text-muted-foreground">
                        {formatRelativeTime(e.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
