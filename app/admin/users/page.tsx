import { requireAdmin } from "@/lib/admin/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AdminPageShell } from "@/components/admin/page-shell";
import { revalidatePath } from "next/cache";
import { formatMicros, formatRelativeTime, formatTokens } from "@/lib/utils";
import { Search, Ban, CheckCircle2, ShieldCheck, Coins } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const { q, page } = await searchParams;
  const pageNum = Math.max(1, Number(page ?? 1));
  const perPage = 25;
  const skip = (pageNum - 1) * perPage;

  const where = {
    deletedAt: null,
    ...(q
      ? {
          OR: [
            { email: { contains: q } },
            { name: { contains: q } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: perPage,
      include: {
        memberships: {
          include: { organization: { select: { id: true, name: true, slug: true } } },
          take: 1,
        },
        _count: {
          select: { conversations: { where: { deletedAt: null } } },
        },
        usageEvents: {
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          select: { costMicros: true, inputTokens: true, outputTokens: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  async function setSuspended(formData: FormData) {
    "use server";
    await requireAdmin();
    const userId = String(formData.get("userId") ?? "");
    const isSuspended = formData.get("action") === "suspend";
    if (!userId) return;
    await db.user.update({ where: { id: userId }, data: { isSuspended } });
    revalidatePath("/admin/users");
  }

  async function setAdmin(formData: FormData) {
    "use server";
    await requireAdmin();
    const userId = String(formData.get("userId") ?? "");
    const isAdmin = formData.get("action") === "grant";
    if (!userId) return;
    await db.user.update({ where: { id: userId }, data: { isAdmin } });
    revalidatePath("/admin/users");
  }

  async function grantCredits(formData: FormData) {
    "use server";
    const admin = await requireAdmin();
    const userId = String(formData.get("userId") ?? "");
    const amountMicros = Number(formData.get("amountMicros") ?? 0);
    if (!userId || !Number.isFinite(amountMicros) || amountMicros === 0) return;
    const user = await db.user.findUnique({ where: { id: userId }, select: { memberships: { take: 1, select: { organizationId: true } } } });
    const orgId = user?.memberships[0]?.organizationId;
    if (!orgId) return;
    // Find current balance
    const last = await db.creditLedgerEntry.findFirst({
      where: { userId, organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
    const balanceMicros = (last?.balanceMicros ?? 0) + amountMicros;
    await db.creditLedgerEntry.create({
      data: {
        userId,
        organizationId: orgId,
        kind: amountMicros > 0 ? "grant" : "adjustment",
        amountMicros,
        balanceMicros,
        description: `Admin grant by ${admin.email}`,
        createdByUserId: admin.id,
      },
    });
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        actorType: "admin",
        action: amountMicros > 0 ? "credit.granted" : "credit.adjusted",
        targetType: "user",
        targetId: userId,
        metadata: JSON.stringify({ amountMicros, balanceMicros }),
      },
    });
    revalidatePath("/admin/users");
  }

  return (
    <AdminPageShell
      title="Users"
      subtitle={`${total.toLocaleString()} total · page ${pageNum} of ${totalPages || 1}`}
      actions={
        <form className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name or email…"
            className="pl-8"
          />
        </form>
      }
    >
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Org</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Chats</TableHead>
                  <TableHead className="text-right">Tokens (30d)</TableHead>
                  <TableHead className="text-right">Cost (30d)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const totalCost = u.usageEvents.reduce((s, e) => s + e.costMicros, 0);
                  const totalTokens = u.usageEvents.reduce((s, e) => s + e.inputTokens + e.outputTokens, 0);
                  const org = u.memberships[0]?.organization;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">{u.name ?? "—"}</span>
                          {u.isAdmin && (
                            <Badge variant="outline" className="gap-1 text-[10px]">
                              <ShieldCheck className="size-2.5" /> Admin
                            </Badge>
                          )}
                          {u.isSuspended && (
                            <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{org?.name ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatRelativeTime(u.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-mono">{u._count.conversations}</TableCell>
                      <TableCell className="text-right font-mono">{formatTokens(totalTokens)}</TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatMicros(totalCost)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <form action={grantCredits}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="amountMicros" value="5000000" />
                            <Button type="submit" size="sm" variant="outline" title="Grant $5 in credits">
                              <Coins /> +$5
                            </Button>
                          </form>
                          <form action={setAdmin}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input
                              type="hidden"
                              name="action"
                              value={u.isAdmin ? "revoke" : "grant"}
                            />
                            <Button type="submit" size="sm" variant="outline">
                              {u.isAdmin ? "Revoke admin" : "Make admin"}
                            </Button>
                          </form>
                          <form action={setSuspended}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input
                              type="hidden"
                              name="action"
                              value={u.isSuspended ? "unsuspend" : "suspend"}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              variant={u.isSuspended ? "outline" : "destructive"}
                            >
                              {u.isSuspended ? (
                                <>
                                  <CheckCircle2 /> Unsuspend
                                </>
                              ) : (
                                <>
                                  <Ban /> Suspend
                                </>
                              )}
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={q ? `/admin/users?q=${q}&page=${p}` : `/admin/users?page=${p}`}
              className={`rounded-md px-3 py-1 ${
                p === pageNum
                  ? "bg-admin text-admin-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
