import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_TIERS } from "@/lib/marketing/pricing-tiers";

export function PricingGrid() {
  return (
    // Grid default (items-stretch) equalises card heights. Avoid h-full on the
    // cards: combined with the featured card's extra padding it constrains the
    // content box and squashes the flex children.
    <div className="grid gap-4 lg:grid-cols-3">
      {PRICING_TIERS.map((t) => (
        <div
          key={t.name}
          className={cn(
            "relative flex flex-col rounded-2xl border bg-card p-7",
            t.featured
              ? "elev-float border-primary/30 lg:-my-3 lg:py-10"
              : "elev-card border-border/70",
          )}
        >
          {t.featured && (
            <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
              Most popular
            </span>
          )}

          <h3 className="font-display text-lg font-semibold tracking-tight">{t.name}</h3>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="display-lg text-5xl">{t.price}</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{t.desc}</p>

          <Button
            asChild
            className="mt-7 w-full"
            size="lg"
            variant={t.featured ? "default" : "outline"}
          >
            <Link href="/sign-up">{t.cta}</Link>
          </Button>

          <div className="mt-7 border-t border-border/70 pt-6">
            <ul className="space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/12">
                    <Check className="size-2.5 text-primary" strokeWidth={3.5} />
                  </span>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
