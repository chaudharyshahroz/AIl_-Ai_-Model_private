export interface PricingTier {
  name: string;
  price: string;
  desc: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

/** Single source of truth for pricing — was previously duplicated between the
 * homepage pricing section and /pricing with slightly different feature lists. */
export const PRICING_TIERS: PricingTier[] = [
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
