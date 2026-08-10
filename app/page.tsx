import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Star,
  FileText,
  Presentation,
  ImageIcon,
  Database,
  Shield,
  MessageSquare,
  Globe,
  Cpu,
} from "lucide-react";

export const dynamic = "force-dynamic";

const MODELS = [
  { name: "GPT-4o", provider: "OpenAI", id: "openai" },
  { name: "Claude Sonnet 4.5", provider: "Anthropic", id: "anthropic" },
  { name: "Gemini 2.5 Pro", provider: "Google", id: "google" },
  { name: "Grok 2", provider: "xAI", id: "xai" },
  { name: "DeepSeek V3", provider: "DeepSeek", id: "deepseek" },
  { name: "Kimi K2 128K", provider: "Moonshot", id: "moonshot" },
  { name: "Mistral Large 2", provider: "Mistral", id: "mistral" },
  { name: "Command R+", provider: "Cohere", id: "cohere" },
  { name: "Sonar Large", provider: "Perplexity", id: "perplexity" },
  { name: "Llama 3.3 70B", provider: "Groq", id: "groq" },
  { name: "Qwen Max", provider: "Alibaba", id: "qwen" },
  { name: "o3-mini", provider: "OpenAI", id: "openai" },
];

const SKILLS = [
  { name: "Deep Research", desc: "Multi-source synthesis with citations" },
  { name: "Code Reviewer", desc: "PR feedback grounded in your repo" },
  { name: "Document Creator", desc: "Reports, briefs, and proposals" },
  { name: "Data Analyst", desc: "CSV/spreadsheet insights and charts" },
];

const CREATORS = [
  { icon: FileText, name: "Document" },
  { icon: Presentation, name: "Presentation" },
  { icon: ImageIcon, name: "Image" },
  { icon: Database, name: "Spreadsheet" },
  { icon: Cpu, name: "Code" },
];

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <MarketingHeader />
      <Hero />
      <SocialProof />
      <BentoFeatures />
      <Connect />
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
      {/* Warm glow behind the headline */}
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
                Now with Reklu Auto
                <span className="text-muted-foreground">— routing built in</span>
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="display-xl mt-7 text-balance text-[clamp(2.75rem,7vw,5.25rem)]">
                Every model.
                <br />
                <span className="text-muted-foreground/80">Answering as one.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mx-auto mt-7 max-w-xl text-balance text-[17px] leading-relaxed text-muted-foreground">
                Stop juggling tabs for GPT, Claude, and Gemini. Reklu routes every question to
                the right model — or lets you choose — in one connected workspace.
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
          {MODELS.slice(0, 6).map((m) => (
            <span
              key={m.provider + m.name}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium"
            >
              <ProviderDot providerId={m.id} />
              {m.provider}
            </span>
          ))}
          <span className="text-xs text-muted-foreground">+7 more</span>
        </div>
      </div>
    </section>
  );
}

function BentoFeatures() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto mb-14 max-w-2xl text-center">
          <SectionEyebrow icon={Sparkles} label="One workspace" center />
          <h2 className="display-lg text-[clamp(2rem,4vw,2.85rem)]">
            Everything, without the tab-switching
          </h2>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Chat, models, skills, and output — in one place, with the cost of every answer
            shown up front.
          </p>
        </ScrollReveal>

        <div className="grid gap-4 lg:grid-cols-3 lg:[grid-template-areas:'chat_chat_models'_'chat_chat_skills']">
          <ScrollReveal className="lg:[grid-area:chat]">
            <div className="elev-card h-full rounded-2xl border border-border/70 bg-card p-7">
              <SectionEyebrow icon={MessageSquare} label="Unified chat" />
              <h3 className="display-md text-2xl">
                One chat. Every model.
                <br />
                Switch mid-conversation.
              </h3>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Let Reklu Auto pick, or choose yourself. Compare models side by side with
                transparent cost and latency on every response.
              </p>

              <div className="mt-7 space-y-2.5">
                <div className="elev-card rounded-xl rounded-tl-sm border border-border/60 bg-background p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <ProviderDot providerId="openai" /> GPT-4o
                  </div>
                  <p className="mt-1.5 text-sm">
                    Sure — here's a function that reads a CSV in TypeScript…
                  </p>
                </div>
                <div className="elev-lift rounded-xl rounded-tl-sm border border-primary/20 bg-card p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <ProviderDot providerId="anthropic" /> Switched to Claude Sonnet 4.5
                  </div>
                  <p className="mt-1.5 text-sm">
                    I can do that, plus a type-safe parser. Want error handling for malformed
                    rows?
                  </p>
                </div>
              </div>

              <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                {[
                  "Auto explains its pick",
                  "Cost, latency, tokens shown",
                  "Branching conversations",
                  "Full-text search",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.06} className="lg:[grid-area:models]">
            <div className="elev-card h-full rounded-2xl border border-border/70 bg-card p-7">
              <SectionEyebrow icon={Globe} label="Providers" />
              <h3 className="display-md text-xl">All the leading models</h3>
              <p className="mt-2.5 text-sm text-muted-foreground">
                Direct official APIs. No reseller, no markup on list price.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {MODELS.slice(0, 7).map((m, i) => (
                  <span
                    key={`${m.name}-${i}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 py-1.5 text-xs font-medium"
                  >
                    <ProviderDot providerId={m.id} />
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.12} className="lg:[grid-area:skills]">
            <div className="elev-card h-full rounded-2xl border border-border/70 bg-card p-7">
              <SectionEyebrow icon={Zap} label="Skills" />
              <h3 className="display-md text-xl">Complete AI workflows</h3>
              <p className="mt-2.5 text-sm text-muted-foreground">
                Instructions, model policy, tools, and quality checks — not a prompt library.
              </p>
              <div className="mt-5 space-y-2">
                {SKILLS.map((s) => (
                  <div
                    key={s.name}
                    className="rounded-lg border border-border/70 bg-background px-3 py-2"
                  >
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1} className="mt-4">
          <div className="elev-card flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border/70 bg-card p-7">
            <div>
              <SectionEyebrow icon={FileText} label="Create" />
              <h3 className="display-md text-xl">Real artifacts, not just text</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate, edit, and export — from chat or a dedicated canvas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {CREATORS.map(({ icon: Icon, name }) => (
                <span
                  key={name}
                  className="elev-card inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3.5 py-2.5 text-sm font-medium"
                >
                  <Icon className="size-4 text-primary" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function Connect() {
  return (
    <section className="border-t border-border/60 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <ScrollReveal>
            <SectionEyebrow icon={Globe} label="Connect" />
            <h2 className="display-lg text-[clamp(1.9rem,3.5vw,2.6rem)]">
              Connect AI to the tools you already use
            </h2>
            <p className="mt-4 text-[17px] text-muted-foreground">
              Native connectors for the apps you live in. Reklu reads your context and acts on
              your behalf — with explicit approval before every write.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                "Google Drive",
                "Gmail",
                "Calendar",
                "Slack",
                "Notion",
                "GitHub",
                "OneDrive",
                "Outlook",
                "Linear",
              ].map((c) => (
                <div
                  key={c}
                  className="rounded-lg border border-border/70 bg-card px-3 py-2.5 text-sm text-muted-foreground"
                >
                  {c}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="elev-float rounded-2xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="size-3.5 text-primary" /> Permission requested
              </div>
              <div className="mt-4 rounded-xl border border-border/70 bg-background p-4">
                <div className="text-sm font-semibold">Send email to team@acme.com</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Subject: Q3 GTM plan draft for review
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Hi team — I've drafted the Q3 GTM plan for the new visibility product. It
                  covers the ICP, three core plays, and a 30-day pulse measurement…
                </p>
              </div>
              <div className="mt-4 flex gap-2.5">
                <Button size="sm" className="flex-1">
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Reject
                </Button>
              </div>
            </div>
          </ScrollReveal>
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
        "The model comparison alone justified it. Our writers pick the model that fits the brief instead of defaulting to whatever tab was open.",
      name: "Priya N.",
      role: "Content Lead",
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
                <p className="mt-6 flex-1 text-[15px] leading-relaxed">"{t.quote}"</p>
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
      q: "How does Reklu connect to AI providers?",
      a: "We use direct official APIs from OpenAI, Anthropic, Google, and others. We never route through resellers or mark up list price — what you see is what the provider charges.",
    },
    {
      q: "Can I bring my own API key?",
      a: "Yes. Add your own key in Settings → Providers and Reklu will use it. Keys are encrypted at rest and never exposed to your browser.",
    },
    {
      q: "How does Reklu Auto decide which model to use?",
      a: "It looks at your message, the capabilities required (vision, tools, reasoning), and your quality/speed/cost preference — then picks the best available model and shows you why.",
    },
    {
      q: "What is a skill?",
      a: "A versioned AI workflow: instructions, model policy, allowed tools, output format, and quality checks. Skills are not saved prompts — they are real, testable workflows.",
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
            <ScrollReveal key={it.q} delay={Math.min(i * 0.05, 0.2)}>
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
                />
              ))}
            </div>
            <h2 className="display-lg text-balance text-[clamp(2rem,4.5vw,3.25rem)]">
              Ready to try every leading model?
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[17px] text-background/70">
              Open Reklu, start a chat, and let the workspace handle the rest.
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
