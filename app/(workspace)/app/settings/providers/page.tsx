import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, KeyRound, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Providers" };

export default async function ProvidersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  // Show what's currently configured (admin-managed)
  const systemCreds = await db.providerCredential.findMany({
    where: { scope: "system", revokedAt: null, isValid: true },
    select: { providerId: true, lastValidatedAt: true, label: true },
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Providers</h1>
          <p className="text-sm text-muted-foreground">
            AI provider keys are managed by the admin team, not by individual users. This keeps
            billing and rate limits under one roof.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4" />
              Admin-managed
            </CardTitle>
            <CardDescription>
              Your workspace uses the deployment's system-wide provider keys. You don't need to
              add or maintain your own.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemCreds.length === 0 ? (
              <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                <p className="font-medium text-warning-foreground">No providers configured yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  An admin needs to add at least one provider key in the admin dashboard before
                  chat will work.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {systemCreds.map((c) => (
                  <div
                    key={c.providerId}
                    className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-3.5 text-muted-foreground" />
                      <span className="font-medium">{c.providerId}</span>
                      {c.label && <span className="text-xs text-muted-foreground">· {c.label}</span>}
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            )}
            {session.user.isAdmin && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/providers">
                  Open admin · provider keys <ArrowRight />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4" /> Need a provider added?
            </CardTitle>
            <CardDescription>
              If your team needs a specific model or provider that's not in the list, reach out
              to your admin and they'll add it in minutes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
