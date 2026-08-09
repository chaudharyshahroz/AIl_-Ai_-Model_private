import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SpectrumRule } from "@/components/ui/spectrum-rule";
import { ProviderDot } from "@/components/ui/provider-badge";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { PricingGrid } from "@/components/marketing/pricing-grid";
import { Reveal, ScrollReveal } from "@/components/marketing/reveal";
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Cpu,
  Wrench,
  FileText,
  Presentation,
  ImageIcon,
  Database,
  Shield,
  MessageSquare,
  Globe,
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
  { name: "Presentation Designer", desc: "Polished slide decks" },
  { name: "Meeting Notes", desc: "Summaries, action items, owners" },
];

const CREATORS = [
  { icon: FileText, name: "Document", desc: "Reports, briefs, contracts" },
  { icon: Presentation, name: "Presentation", desc: "Polished slide decks" },
  { icon: ImageIcon, name: "Image", desc: "Generate and edit visuals" },
  { icon: Database, name: "Spreadsheet", desc: "Data, charts, forecasts" },
  { icon: Cpu, name: "Code", desc: "Generate, run, explain" },
];

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <Hero />
      <Models />
      <UnifiedChat />
      <Skills />
      <Create />
      <Connect />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Reveal>
              <div className="mb-6 flex items-center gap-2.5">
                <Sparkles className="size-3.5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Now with Reklu Auto
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Every model.
                <br />
                Answering as one.
              </h1>
              <SpectrumRule className="mt-6 w-16" />
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-balance text-lg text-muted-foreground">
                Stop juggling tabs for GPT, Claude, and Gemini. Reklu routes every question to the
                right model — or lets you choose — with one connected workspace for chat, files,
                skills, and the tools you already use.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="xl">
                  <Link href="/sign-up">
                    Start using Reklu <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline">
                  <Link href="/features">See how it works</Link>
                </Button>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">
                No credit card. Free tier available. BYOK supported.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="lg:justify-self-end">
            <DemoCard />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DemoCard() {
  return (
    <div className="relative w-full max-w-md">
      <div className="spectrum-rule-animated absolute -top-px left-4 right-4 rounded-full" />
      <div className="overflow-hidden rounded-lg border bg-card shadow-xl">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <span className="font-mono">reklu.app/app/chat</span>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              You
            </div>
            <p className="text-sm text-foreground">
              Draft a Q3 GTM plan for a tool that tracks brand visibility across ChatGPT, Claude,
              and Perplexity.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-foreground text-background">
              <Sparkles className="size-3" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium text-primary">Reklu Auto</span>
                <ProviderDot providerId="anthropic" />
                <span>Claude Sonnet 4.5 · strong reasoning</span>
              </div>
              <ul className="space-y-1.5 text-sm">
                <li className="flex gap-2">
                  <span className="text-muted-foreground">1.</span>
                  <span>Define the ICP: AI-native teams shipping to technical buyers</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">2.</span>
                  <span>Anchor on prompt monitoring, citation velocity, share-of-answer</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-muted-foreground">3.</span>
                  <span>Run a 30-day pulse across 50 priority prompts per launch</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <Badge variant="success" className="gap-1">
            <Check className="size-3" /> 124ms
          </Badge>
          <span>·</span>
          <span>2,148 tokens</span>
          <span>·</span>
          <span>$0.013</span>
        </div>
      </div>
    </div>
  );
}

function Models() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="max-w-2xl">
          <SectionEyebrow icon={Globe} label="Trusted model providers" />
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            All the leading models, in one place
          </h2>
          <p className="mt-3 text-muted-foreground">
            We connect directly to each provider — no middleman, no markup on top of list price.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MODELS.map((m, i) => (
            <Card key={`${m.name}-${i}`} className="bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ProviderDot providerId={m.id} />
                  {m.provider}
                </div>
                <div className="mt-1.5 text-sm font-medium">{m.name}</div>
              </CardContent>
            </Card>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

function UnifiedChat() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <SectionEyebrow icon={MessageSquare} label="Unified chat" />
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              One chat. Every model. Switch mid-conversation.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start a chat with any model. Switch to a different one when the task changes. Let
              Reklu Auto pick the best one for you. Compare two or four models side by side.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Reklu Auto picks the right model and explains why",
                "Compare 2-4 models in synchronized columns",
                "See transparent cost, latency, and token usage",
                "Attach files, mention @model, @skill, @connector",
                "Persistent conversations with branching and search",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={0.1} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-3 text-sm">
              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ProviderDot providerId="openai" /> GPT-4o
                </div>
                <div className="mt-1">Sure, here's a function that reads a CSV in TypeScript…</div>
              </div>
              <div className="rounded-md border bg-background p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ProviderDot providerId="anthropic" /> Switched to Claude Sonnet 4.5
                </div>
                <div className="mt-1">
                  I can do that, plus a type-safe parser. Want me to add error handling for
                  malformed rows?
                </div>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">You</div>
                <div className="mt-1">Yes, and add tests please.</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="max-w-2xl">
          <SectionEyebrow icon={Zap} label="Skills" />
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            More than prompts. Complete AI workflows.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Each Reklu skill combines instructions, model policy, tools, output format, and
            quality checks. Not a prompt library — a workflow engine.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((s) => (
            <Card key={s.name}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Wrench className="size-4 text-muted-foreground" />
                  <h3 className="font-medium">{s.name}</h3>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

function Create() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="max-w-2xl">
          <SectionEyebrow icon={Sparkles} label="Create" />
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Create real artifacts, not just text
          </h2>
          <p className="mt-3 text-muted-foreground">
            Generate, edit, and export. From chat or from a dedicated creation page.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CREATORS.map(({ icon: Icon, name, desc }) => (
            <Card key={name}>
              <CardContent className="p-5">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-3 font-medium">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

function Connect() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <SectionEyebrow icon={Globe} label="Connect" />
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Connect AI to the tools you already use.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Native connectors for the apps you live in. Reklu reads your context and acts on
              your behalf — with explicit permission for every write.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {[
                "Google Drive",
                "Gmail",
                "Google Calendar",
                "Slack",
                "Notion",
                "GitHub",
                "OneDrive",
                "Outlook",
                "Dropbox",
                "Linear",
                "Jira",
                "HubSpot",
              ].map((c) => (
                <div key={c} className="rounded-md border bg-background px-3 py-2 text-muted-foreground">
                  {c}
                </div>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="size-3" /> Permission requested
                </div>
                <div className="rounded-md border bg-background p-4">
                  <div className="text-sm font-medium">Send email to team@acme.com</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Subject: Q3 GTM plan draft for review
                  </div>
                  <div className="mt-2 max-h-24 overflow-hidden text-xs text-muted-foreground">
                    Hi team — I've drafted the Q3 GTM plan for the new visibility product. It
                    covers the ICP, three core plays, and a 30-day pulse measurement…
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="border-t py-24" id="pricing">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-muted-foreground">Pay for what you use. Cancel any time.</p>
        </ScrollReveal>
        <ScrollReveal delay={0.1} className="mt-12">
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
      a: "We use direct official APIs from OpenAI, Anthropic, and Google. We never route through resellers or mark up list price — what you see is what the provider charges.",
    },
    {
      q: "Can I bring my own API key?",
      a: "Yes. Add your own key in Settings → Providers and Reklu will use it. Keys are encrypted at rest and never exposed to your browser.",
    },
    {
      q: "How does Reklu Auto decide which model to use?",
      a: "Reklu Auto looks at your message, required capabilities (vision, tools, reasoning), and your quality/speed/cost preference. It picks the most appropriate available model and shows you why.",
    },
    {
      q: "What is a skill?",
      a: "A skill is a versioned AI workflow — instructions, model policy, allowed tools, output format, and quality checks. Skills are not saved prompts; they are real, testable workflows.",
    },
    {
      q: "Is my data private?",
      a: "Your conversations and files are private to your workspace. We never train on your data. You can delete your account and all associated data at any time.",
    },
  ];
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked
          </h2>
        </ScrollReveal>
        <div className="mt-10 space-y-3">
          {items.map((it, i) => (
            <ScrollReveal key={it.q} delay={Math.min(i * 0.05, 0.2)}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium">{it.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{it.a}</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="border-t py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <ScrollReveal>
          <h2 className="text-balance font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Ready to try every leading model?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Open Reklu, start a chat, and let the workspace handle the rest.
          </p>
          <Button asChild size="xl" className="mt-8">
            <Link href="/sign-up">
              Start using Reklu <ArrowRight />
            </Link>
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
