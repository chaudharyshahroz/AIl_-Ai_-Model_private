import { SpectrumRule } from "@/components/ui/spectrum-rule";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { PricingGrid } from "@/components/marketing/pricing-grid";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="display-lg text-4xl sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <SpectrumRule className="mx-auto mt-6 w-16" />
        <p className="mt-6 text-muted-foreground">
          Pay for what you use. No hidden fees. Cancel any time.
        </p>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <PricingGrid />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Enterprise plans available with SSO, SCIM, and private deployment.
        </p>
      </section>
      <MarketingFooter />
    </div>
  );
}
