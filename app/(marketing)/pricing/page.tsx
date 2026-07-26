import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export const metadata = { title: "Pricing" };

const TIERS = [
  {
    name: "Free",
    price: "$0",
    desc: "Try every model with monthly credits.",
    features: [
      "Limited monthly credits",
      "Access to basic models",
      "Limited file uploads",
      "Personal workspace",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$20",
    desc: "Premium models, more credits, BYOK.",
    features: [
      "All available models",
      "Larger monthly credit allowance",
      "Model comparison",
      "Full artifact creation",
      "Custom skills",
      "BYOK",
      "Priority processing",
    ],
    cta: "Upgrade to Pro",
    featured: true,
  },
  {
    name: "Team",
    price: "$40",
    desc: "Shared workspace, central billing.",
    features: [
      "Everything in Pro",
      "Shared skills & connectors",
      "Team credits",
      "Central billing",
      "Admin controls",
      "Audit logs",
    ],
    cta: "Contact sales",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="font-semibold">Reklu</Link>
          <Button asChild size="sm"><Link href="/sign-up">Get started</Link></Button>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
        <p className="mt-4 text-muted-foreground">Pay for what you use. No hidden fees. Cancel any time.</p>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((t) => (
            <Card key={t.name} className={t.featured ? "border-primary shadow-lg" : ""}>
              <CardContent className="p-6">
                {t.featured && <Badge className="mb-3">Most popular</Badge>}
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">{t.price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 text-primary" />
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
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Enterprise plans available with SSO, SCIM, and private deployment.
        </p>
      </section>
    </div>
  );
}
