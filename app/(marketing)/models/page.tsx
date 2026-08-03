import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatMicros } from "@/lib/utils";

export const metadata = { title: "Models" };
export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  const models = await db.modelDefinition.findMany({
    where: { isEnabledForUsers: true, status: "active" },
    include: { provider: true },
    orderBy: [{ provider: { displayName: "asc" } }, { displayName: "asc" }],
  });

  return (
    <main className="min-h-screen">
      <MarketingHeader />
      <section className="relative px-4 py-20 sm:px-6">
        <div className="absolute inset-0 grid-bg opacity-55" />
        <div className="relative mx-auto max-w-5xl">
          <Badge variant="outline" className="rounded-full bg-card/70">Models</Badge>
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
            The model catalog stays visible.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Admins decide what is enabled. Users see provider, capability, context, and price
            before choosing or letting Reklu Auto decide.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <Card key={m.id} className="bg-card/90 shadow-sm">
              <CardContent className="p-5">
                <div className="model-rail mb-4 h-1.5 rounded-full" />
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="rounded-full">{m.provider.displayName}</Badge>
                  {m.supportsReasoning && <Badge variant="outline" className="rounded-full">Reasoning</Badge>}
                </div>
                <h2 className="mt-4 text-xl font-semibold">{m.displayName}</h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{m.providerModelId}</p>
                <dl className="mt-5 space-y-2 text-sm">
                  <Row label="Context" value={formatCtx(m.contextWindow)} />
                  <Row label="Input" value={m.priceInputMicrosPer1M ? `${formatMicros(m.priceInputMicrosPer1M)} / 1M` : "Included"} />
                  <Row label="Output" value={m.priceOutputMicrosPer1M ? `${formatMicros(m.priceOutputMicrosPer1M)} / 1M` : "Included"} />
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-lg bg-muted/45 px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function formatCtx(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function MarketingHeader() {
  return (
    <header className="border-b bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold">Reklu</Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full"><Link href="/sign-in">Sign in</Link></Button>
          <Button asChild size="sm" className="rounded-full"><Link href="/sign-up">Get started</Link></Button>
        </div>
      </div>
    </header>
  );
}
