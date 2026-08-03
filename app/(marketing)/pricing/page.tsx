import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check } from "lucide-react";

export const metadata = { title: "Pricing" };

const TIERS = [
  ["Free", "$0", "Explore Reklu with core chat and starter credits.", ["Personal workspace", "Starter model credits", "Conversation history"]],
  ["Pro", "$20", "Premium models, BYOK, and larger monthly usage.", ["All model families", "Bring your own keys", "Model comparison", "Artifact creation", "Priority queue"]],
  ["Team", "$40", "Shared model work with admin controls.", ["Everything in Pro", "Shared skills", "Team usage tracking", "Central billing", "Audit trail"]],
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <MarketingHeader />
      <section className="relative px-4 py-20 text-center sm:px-6">
        <div className="absolute inset-0 grid-bg opacity-55" />
        <div className="relative mx-auto max-w-4xl">
          <Badge variant="outline" className="rounded-full bg-card/70">Pricing</Badge>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
            Pay for model work without mystery.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Start free, upgrade when you need premium models, or centralize usage for your team.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map(([name, price, desc, features], index) => (
            <Card key={name as string} className={index === 1 ? "border-primary bg-card shadow-2xl shadow-primary/10" : "bg-card/85 shadow-sm"}>
              <CardContent className="p-7">
                {index === 1 && <Badge className="mb-5 rounded-full">Most popular</Badge>}
                <h2 className="text-2xl font-semibold">{name as string}</h2>
                <div className="mt-4 text-5xl font-semibold">{price as string}</div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{desc as string}</p>
                <ul className="mt-7 space-y-3 text-sm">
                  {(features as string[]).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-8 w-full rounded-full" variant={index === 1 ? "default" : "outline"}>
                  <Link href="/sign-up">{index === 2 ? "Contact sales" : "Start now"}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Enterprise plans are available with SSO, SCIM, audit exports, and private deployment.
        </p>
      </section>
    </main>
  );
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
