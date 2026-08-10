import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProviderDot } from "@/components/ui/provider-badge";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { AnnouncementBar } from "@/components/marketing/announcement-bar";
import { HeroConstellation } from "@/components/marketing/hero-constellation";
import { ProviderMark } from "@/components/marketing/provider-mark";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { Reveal, ScrollReveal } from "@/components/marketing/reveal";
import { AppPreview } from "@/components/marketing/app-preview";
import { FeatureSection } from "@/components/marketing/feature-section";
import { RoutingDemo } from "@/components/marketing/demos/routing-demo";
import { BuildDemo } from "@/components/marketing/demos/build-demo";
import { CreateDemo } from "@/components/marketing/demos/create-demo";
import { SkillsDemo } from "@/components/marketing/demos/skills-demo";
import { ConnectDemo } from "@/components/marketing/demos/connect-demo";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Hammer,
  Wand2,
  Plug,
  MessageSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PROVIDERS = [
  { name: "OpenAI", id: "openai" },
  { name: "Anthropic", id: "anthropic" },
  { name: "Google", id: "google" },
  { name: "xAI", id: "xai" },
  { name: "DeepSeek", id: "deepseek" },
  { name: "Mistral", id: "mistral" },
];

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <MarketingHeader />
      <Hero />
      <SocialProof />
      <Capabilities />

      <FeatureSection
        eyebrow="Unified chat"
        icon={MessageSquare}
        title={<>One chat.<br />Every model.</>}
        body="Ask once. Reklu Auto reads the request, checks which models can actually handle it, and routes to the best fit — then tells you why it chose."
        bullets={[
          "Switch models mid-conversation without losing context",
          "Compare two to four models side by side",
          "Cost, latency, and token count on every response",
          "Bring your own key for any provider",
        ]}
        demo={<RoutingDemo />}
      />

      <FeatureSection
        eyebrow="Build"
        icon={Hammer}
        title={<>Describe an app.<br />Get a real one.</>}
        body="Go from a sentence to a working website or mobile app. Reklu writes the code, renders a live preview as it goes, and lets you iterate by just saying what to change."
        bullets={[
          "Websites, landing pages, dashboards, and mobile screens",
          "Live preview updates as the code streams in",
          "Refine by conversation — no need to touch the code",
          "Export the source or download a ready-to-host file",
        ]}
        demo={<BuildDemo />}
        flip
      />

      <FeatureSection
        eyebrow="Create"
        icon={Wand2}
        title={<>Documents, decks,<br />images, and data.</>}
        body="Reklu produces real files, not just text in a chat window. Everything is editable in a side-by-side canvas and exports to the format you actually need."
        bullets={[
          "Documents and reports → DOCX, PDF",
          "Presentations with real slide layouts → PPTX",
          "Images and diagrams → PNG, SVG",
          "Spreadsheets with working formulas → XLSX, CSV",
        ]}
        demo={<CreateDemo />}
      />

      <FeatureSection
        eyebrow="Skills"
        icon={Zap}
        title={<>Workflows, not<br />saved prompts.</>}
        body="A skill bundles instructions, a model policy, the tools it may use, an output format, and quality checks — so the same task runs the same way every time."
        bullets={[
          "Versioned and testable, with evaluation runs",
          "Each skill picks its own model policy",
          "Install from the catalog or write your own",
          "Share across your whole workspace",
        ]}
        demo={<SkillsDemo />}
        flip
      />

      <FeatureSection
        eyebrow="Connect"
        icon={Plug}
        title={<>MCP servers,<br />plugins, and your apps.</>}
        body="Connect any Model Context Protocol server, plus native integrations for the tools you already use. Reklu reads your context — and asks before it writes anything."
        bullets={[
          "Any MCP server over streamable HTTP or SSE",
          "Native connectors: Drive, Gmail, Slack, Notion, GitHub, Linear",
          "Per-tool approvals, one-off or recurring",
          "Every tool call written to an audit log",
        ]}
        demo={<ConnectDemo />}
      />

      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative -mt-16 overflow-hidden pt-16">
      <div className="absolute inset-0 grid-bg" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[880px] -translate-x-1/2 rounded-full opacity-[0.13] blur-[110px]"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pt-28">
        <div className="relative">
          <HeroConstellation />

          <div className="relative mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="elev-card inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-[13px] font-medium">
                <Sparkles className="size-3.5 text-primary" />
                Chat, build, create — one workspace
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="display-xl mt-7 text-balance text-[clamp(2.75rem,7vw,5.25rem)]">
                Every model.
                <br />
                <span className="text-muted-foreground/80">Every kind of work.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-xl text-balance text-[17px] leading-relaxed text-muted-foreground">
                Chat with GPT, Claude, and Gemini. Build websites and apps. Create documents,
                decks, images, and spreadsheets. Run skills and connect your tools — all in one
                workspace.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="xl" className="w-full sm:w-auto">
                  <Link href="/sign-up">
                    Start 7-day free trial <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="ink" className="w-full sm:w-auto">
                  <Link href="/features">See how it works</Link>
                </Button>
              </div>
              <p className="mt-5 text-[13px] text-muted-foreground">
                No credit card required · Free tier available · Bring your own key
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.3} className="mt-16 sm:mt-20">
          <AppPreview />
        </Reveal>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="border-y border-border/60 bg-card/40 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 lg:flex-row lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-primary text-primary" />
            ))}
          </div>
          <span className="text-sm">
            <span className="font-semibold">4.9</span>
            <span className="ml-1.5 text-muted-foreground">from 2,000+ teams</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <span className="mr-1 text-sm text-muted-foreground">Connects to</span>
          {PROVIDERS.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium"
            >
              <ProviderDot providerId={p.id} />
              {p.name}
            </span>
          ))}
          <span className="text-xs text-muted-foreground">+7 more</span>
        </div>
      </div>
    </section>
  );
}

/** Overview of the four surfaces, each linking down to its section. */
function Capabilities() {
  const items = [
    {
      icon: MessageSquare,
      title: "Chat",
      desc: "Every leading model, with automatic routing and transparent cost.",
    },
    {
      icon: Hammer,
      title: "Build",
      desc: "Websites and mobile apps from a prompt, with a live preview.",
    },
    {
      icon: Wand2,
      title: "Create",
      desc: "Docs, decks, images, and spreadsheets you can actually export.",
    },
    {
      icon: Plug,
      title: "Connect",
      desc: "Skills, MCP servers, and plugins wired into your own tools.",
    },
  ];

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto mb-12 max-w-2xl text-center">
          <SectionEyebrow icon={Sparkles} label="One workspace" center />
          <h2 className="display-lg text-[clamp(2rem,4vw,2.85rem)]">
            Four surfaces, one subscription
          </h2>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Most teams pay for four tools to do this. Reklu puts them behind one login and one
            bill.
          </p>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <ScrollReveal key={it.title} delay={i * 0.06}>
              <div className="elev-card-hover h-full rounded-2xl border border-border/70 bg-card p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                  <it.icon className="size-5 text-primary" />
                </span>
                <h3 className="display-md mt-4 text-lg">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      metric: "62%",
      metricLabel: "less time per task",
      quote:
        "We stopped paying for three separate AI subscriptions. Reklu routes to whatever's best and we finally see what each answer actually costs.",
      name: "Marcus A.",
      role: "Head of Engineering",
    },
    {
      metric: "4 → 1",
      metricLabel: "tools consolidated",
      quote:
        "Our team ships internal dashboards straight from chat now. The thing that used to be a two-week ticket is an afternoon.",
      name: "Priya N.",
      role: "Product Lead",
    },
  ];

  return (
    <section className="border-t border-border/60 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
          <SectionEyebrow icon={Star} label="Testimonials" center />
          <h2 className="display-lg text-[clamp(2rem,4vw,2.85rem)]">
            Teams that stopped tab-switching
          </h2>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.08}>
              <div className="elev-card flex h-full flex-col rounded-2xl border border-border/70 bg-card p-8">
                <div className="flex items-baseline gap-2.5">
                  <span className="display-lg text-4xl text-primary">{t.metric}</span>
                  <span className="text-sm text-muted-foreground">{t.metricLabel}</span>
                </div>
                <p className="mt-6 flex-1 text-[15px] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                  <span className="grid size-9 place-items-center rounded-full bg-muted text-xs font-semibold">
                    {t.name.slice(0, 1)}
                  </span>
                  <div className="text-sm">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="border-t border-border/60 py-24 sm:py-28" id="pricing">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
          <SectionEyebrow icon={Zap} label="Pricing" center />
          <h2 className="display-lg text-[clamp(2rem,4vw,2.85rem)]">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Pay for what you use. Cancel any time.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <PricingGrid />
        </ScrollReveal>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Enterprise plans available with SSO, SCIM, and private deployment.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "What can Reklu actually build?",
      a: "Websites, landing pages, dashboards, and mobile app screens. You describe what you want, Reklu writes the code and renders a live preview you can iterate on by conversation. Export the source or download a ready-to-host file.",
    },
    {
      q: "How does Reklu connect to AI providers?",
      a: "Direct official APIs from OpenAI, Anthropic, Google, and others. We never route through resellers or mark up list price — what you see is what the provider charges.",
    },
    {
      q: "Can I bring my own API key?",
      a: "Yes. Add your own key in Settings → Providers and Reklu will use it. Keys are encrypted at rest with AES-256-GCM and never exposed to your browser.",
    },
    {
      q: "How does Reklu Auto decide which model to use?",
      a: "It looks at your message, the capabilities required (vision, tools, reasoning, context length), and your quality/speed/cost preference — then picks the best available model and shows you why.",
    },
    {
      q: "What is a skill?",
      a: "A versioned AI workflow: instructions, model policy, allowed tools, output format, and quality checks. Skills are not saved prompts — they are real, testable workflows you can evaluate and share.",
    },
    {
      q: "Which MCP servers and plugins are supported?",
      a: "Any Model Context Protocol server over streamable HTTP or SSE. Alongside that there are native connectors for Google Drive, Gmail, Calendar, Slack, Notion, GitHub, Linear, and more. Every tool call that writes requires explicit approval.",
    },
    {
      q: "Is my data private?",
      a: "Your conversations and files are private to your workspace. We never train on your data, and you can delete your account and everything in it at any time.",
    },
  ];

  return (
    <section className="border-t border-border/60 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="display-lg text-[clamp(2rem,4vw,2.85rem)]">Frequently asked</h2>
        </ScrollReveal>
        <div className="space-y-3">
          {items.map((it, i) => (
            <ScrollReveal key={it.q} delay={Math.min(i * 0.04, 0.2)}>
              <div className="elev-card rounded-xl border border-border/70 bg-card p-6">
                <h3 className="font-display text-[17px] font-semibold tracking-tight">{it.q}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{it.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 py-24 sm:py-28">
      <ScrollReveal className="mx-auto max-w-5xl">
        <div className="elev-float relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center text-background sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-[100px]"
            style={{ background: "hsl(var(--primary))" }}
          />
          <div className="relative">
            <div className="mb-6 flex justify-center gap-2">
              {["openai", "anthropic", "google", "xai"].map((id, i) => (
                <ProviderMark
                  key={id}
                  providerId={id}
                  letter={["O", "A", "G", "X"][i]}
                  size="sm"
                  className="demo-float"
                  style={{ "--demo-delay": `${i * 0.25}s` } as React.CSSProperties}
                />
              ))}
            </div>
            <h2 className="display-lg text-balance text-[clamp(2rem,4.5vw,3.25rem)]">
              One workspace for all of it
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[17px] text-background/70">
              Chat, build, create, and connect — without paying for four tools to do it.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="w-full sm:w-auto">
                <Link href="/sign-up">
                  Start 7-day free trial <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="ghost"
                className="w-full border border-background/20 text-background hover:bg-background/10 hover:text-background sm:w-auto"
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
