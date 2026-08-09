import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PRICING_TIERS } from "@/lib/marketing/pricing-tiers";

export function PricingGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {PRICING_TIERS.map((t) => (
        <Card
          key={t.name}
          className={t.featured ? "relative border-primary/60 shadow-md ring-1 ring-primary/20" : ""}
        >
          {t.featured && (
            <div className="spectrum-rule absolute inset-x-6 -top-px" />
          )}
          <CardContent className="p-6">
            {t.featured && <Badge className="mb-3">Most popular</Badge>}
            <h3 className="font-display text-lg font-semibold">{t.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold tracking-tight">{t.price}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full" variant={t.featured ? "default" : "outline"}>
              <Link href="/sign-up">{t.cta}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
