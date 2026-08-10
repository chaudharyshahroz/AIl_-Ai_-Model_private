import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, CheckCircle2, XCircle, ExternalLink, KeyRound } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Connectors" };

const CATEGORIES = ["storage", "communication", "code", "productivity", "crm"] as const;
const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  storage: "Storage",
  communication: "Communication",
  code: "Code",
  productivity: "Productivity",
  crm: "CRM",
};

export default async function ConnectorsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const definitions = await db.connectorDefinition.findMany({
    where: { isEnabled: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const accounts = await db.connectorAccount.findMany({
    where: { userId: session.user.id, revokedAt: null },
    include: { definition: true, _count: { select: { items: true } } },
  });
  const accountByDef = new Map(accounts.map((a) => [a.definitionId, a]));

  async function disconnect(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const accountId = String(formData.get("accountId") ?? "");
    if (!accountId) return;
    await db.connectorAccount.update({
      where: { id: accountId, userId: session.user.id },
      data: { revokedAt: new Date() },
    });
    revalidatePath("/app/connectors");
  }

  // Group by category
  const byCategory = new Map<string, typeof definitions>();
  for (const d of definitions) {
    if (!byCategory.has(d.category)) byCategory.set(d.category, []);
    byCategory.get(d.category)!.push(d);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="display-lg text-2xl">Connectors</h1>
          <p className="text-sm text-muted-foreground">
            Connect your apps to Reklu. Once connected, you can mention files and data from your
            tools directly in chat.
          </p>
        </div>

        {byCategory.size === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No connectors available yet. Ask an admin to enable them.
            </CardContent>
          </Card>
        ) : (
          Array.from(byCategory.entries()).map(([cat, defs]) => (
            <div key={cat}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {defs.map((d) => {
                  const account = accountByDef.get(d.id);
                  const connected = !!account;
                  return (
                    <Card key={d.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="grid size-10 place-items-center rounded-lg bg-muted text-lg">
                            {d.iconUrl ? (
                              <img src={d.iconUrl} alt={d.name} className="size-6" />
                            ) : (
                              <Plug className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          {connected ? (
                            <Badge variant="success">
                              <CheckCircle2 className="mr-1 size-3" /> Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not connected</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base">{d.name}</CardTitle>
                        <CardDescription>{d.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {connected && account ? (
                          <div className="space-y-2">
                            {account.externalAccountLabel && (
                              <p className="text-xs text-muted-foreground">
                                Signed in as <span className="font-medium text-foreground">{account.externalAccountLabel}</span>
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {account._count.items} indexed items
                            </p>
                            {account.lastSyncedAt && (
                              <p className="text-xs text-muted-foreground">
                                Last sync {formatRelativeTime(account.lastSyncedAt)}
                              </p>
                            )}
                            <div className="flex gap-2 pt-1">
                              <Button asChild size="sm" variant="outline" className="flex-1">
                                <Link href={`/app/files?connector=${d.id}`}>
                                  Browse files
                                </Link>
                              </Button>
                              <form action={disconnect} className="flex-1">
                                <input type="hidden" name="accountId" value={account.id} />
                                <Button type="submit" size="sm" variant="ghost" className="w-full">
                                  <XCircle /> Disconnect
                                </Button>
                              </form>
                            </div>
                          </div>
                        ) : (
                          <Button asChild size="sm" className="w-full">
                            <Link href={`/api/connectors/${d.id}/connect`}>
                              <KeyRound /> Connect
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Click <strong>Connect</strong> on a connector and sign in with the provider.</p>
            <p>2. Reklu syncs your files, emails, or channels (read-only by default).</p>
            <p>3. In chat, type <code className="rounded bg-muted px-1 font-mono text-xs">@drive filename</code> to mention a file. Reklu reads the minimum needed to answer your question.</p>
            <p>4. Write actions (sending emails, posting messages) require your explicit approval each time.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
