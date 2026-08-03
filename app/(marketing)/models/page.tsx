import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMicros } from "@/lib/utils";
import { db } from "@/lib/db";

export const metadata = { title: "Models" };
export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await db.modelDefinition.findMany({
    where: { isEnabledForUsers: true, status: "active" },
    include: { provider: true },
    orderBy: [{ provider: { displayName: "asc" } }, { displayName: "asc" }],
  });

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-semibold">Reklu</Link>
          <Button asChild size="sm"><Link href="/sign-up">Get started</Link></Button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Badge variant="outline" className="mb-4">Models</Badge>
        <h1 className="text-4xl font-semibold tracking-tight">All models, transparent pricing</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Reklu uses direct official APIs. The prices below are the providers' list prices; you can
          also bring your own key. Admin-controlled — only enabled models are shown to users.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{m.provider.displayName}</Badge>
                  {m.supportsReasoning && <Badge variant="outline">Reasoning</Badge>}
                </div>
                <h3 className="mt-3 font-medium">{m.displayName}</h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{m.providerModelId}</p>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Context</dt>
                    <dd>{formatCtx(m.contextWindow)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Input</dt>
                    <dd>{m.priceInputMicrosPer1M ? `${formatMicros(m.priceInputMicrosPer1M)} / 1M` : "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Output</dt>
                    <dd>{m.priceOutputMicrosPer1M ? `${formatMicros(m.priceOutputMicrosPer1M)} / 1M` : "—"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatCtx(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
