import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpectrumRule } from "@/components/ui/spectrum-rule";
import { ProviderDot } from "@/components/ui/provider-badge";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { Layers } from "lucide-react";
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
      <MarketingHeader />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-4 flex items-center gap-2 text-primary">
          <Layers className="size-3.5" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Models</span>
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          All models, transparent pricing
        </h1>
        <SpectrumRule className="mt-6 w-16" />
        <p className="mt-6 max-w-2xl text-muted-foreground">
          Reklu uses direct official APIs. The prices below are the providers' list prices; you can
          also bring your own key. Admin-controlled — only enabled models are shown to users.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="gap-1.5">
                    <ProviderDot providerId={m.provider.id} />
                    {m.provider.displayName}
                  </Badge>
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
      <MarketingFooter />
    </div>
  );
}

function formatCtx(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
