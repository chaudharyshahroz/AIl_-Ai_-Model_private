import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Check,
  Cpu,
  Database,
  FileText,
  Globe2,
  ImageIcon,
  LockKeyhole,
  MessageSquare,
  Presentation,
  ShieldCheck,
  Sparkles,
  Split,
  Wand2,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

const MODELS = [
  ["OpenAI", "GPT-4o", "o3-mini"],
  ["Anthropic", "Claude Sonnet 4.5", "Claude Haiku"],
  ["Google", "Gemini 2.5 Pro", "Gemini Flash"],
  ["xAI", "Grok", "reasoning"],
  ["DeepSeek", "V3", "code"],
  ["Moonshot", "Kimi K2", "128K"],
];

const WORKFLOWS = [
  {
    icon: MessageSquare,
    title: "Route every chat",
    copy: "Let Reklu Auto pick a model for the job, or pin any provider when you already know what you need.",
  },
  {
    icon: Split,
    title: "Compare answers",
    copy: "Run the same prompt across models and keep the strongest answer without rebuilding context.",
  },
  {
    icon: Wand2,
    title: "Turn work into artifacts",
    copy: "Draft documents, presentations, images, spreadsheets, and code from the same conversation.",
  },
];

const CREATION_TOOLS = [
  { icon: FileText, label: "Documents" },
  { icon: Presentation, label: "Slides" },
  { icon: ImageIcon, label: "Images" },
  { icon: Database, label: "Sheets" },
  { icon: Cpu, label: "Code" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Header />
      <Hero />
      <ModelCloud />
      <Workflows />
      <Creation />
      <Security />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-sm font-semibold tracking-tight">Reklu</span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border bg-card/70 p-1 shadow-sm md:flex">
          {[
            ["Features", "/features"],
            ["Models", "/models"],
            ["Pricing", "/pricing"],
            ["Sign in", "/sign-in"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm" className="rounded-full px-4">
          <Link href="/sign-up">
            Start free <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="relative grid size-8 place-items-center rounded-full bg-foreground text-background shadow-sm">
      <span className="text-xs font-black">R</span>
      <span className="model-rail absolute -bottom-0.5 h-1 w-5 rounded-full" />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-primary" />
            Reklu Auto now routes work across leading AI models
          </div>
          <h1 className="max-w-4xl text-balance text-5xl font-semibold leading-[0.95] tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Deliver better AI work from one connected desk.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Chat with GPT, Claude, Gemini, Grok, DeepSeek, and more. Connect your context,
            run specialist skills, and create useful artifacts without jumping between tools.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl" className="rounded-full">
              <Link href="/sign-up">
                Open your workspace <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline" className="rounded-full bg-card/80">
              <Link href="/features">See how it works</Link>
            </Button>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            {[
              ["12+", "model families"],
              ["BYOK", "provider control"],
              ["Live", "cost tracking"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border bg-card/70 p-3 shadow-sm">
                <div className="text-xl font-semibold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="reklu-shell rounded-[2rem] border p-3 shadow-2xl shadow-foreground/10">
      <div className="overflow-hidden rounded-[1.4rem] border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <Badge variant="outline" className="rounded-full">
            Reklu Auto
          </Badge>
        </div>
        <div className="grid min-h-[520px] lg:grid-cols-[190px_1fr]">
          <aside className="hidden border-r bg-muted/35 p-4 lg:block">
            <div className="mb-4 text-xs font-medium text-muted-foreground">Models</div>
            {["Claude Sonnet", "GPT-4o", "Gemini Pro", "DeepSeek V3"].map((model, i) => (
              <div key={model} className="mb-2 rounded-lg border bg-card p-3 text-sm shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{model}</span>
                  <span className={i === 0 ? "size-2 rounded-full bg-primary" : "size-2 rounded-full bg-border"} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{i === 0 ? "selected" : "available"}</div>
              </div>
            ))}
          </aside>
          <div className="p-4 sm:p-6">
            <div className="mb-4 rounded-xl border bg-muted/35 p-4">
              <div className="text-xs text-muted-foreground">You</div>
              <p className="mt-2 text-sm">
                Build a launch plan for a B2B AI product. Include positioning, launch channels,
                a founder email, and a dashboard I can track weekly.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Selected Claude Sonnet 4.5</div>
                  <div className="text-sm font-medium">Strong writing, planning, and structured output</div>
                </div>
                <Badge className="rounded-full">124ms</Badge>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  "Position around answer visibility, not dashboards.",
                  "Launch through founder-led proof, partner prompts, and benchmark reports.",
                  "Track share of answer, citation quality, and sales-qualified prompt clusters.",
                ].map((line) => (
                  <div key={line} className="flex gap-2 rounded-lg bg-muted/45 p-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Draft doc", "Create deck", "Make tracker"].map((action) => (
                <div key={action} className="rounded-lg border bg-background/70 p-3 text-sm font-medium shadow-sm">
                  {action}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelCloud() {
  return (
    <section className="border-y bg-card/65 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Direct provider access</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              One interface for the model market.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Keep provider choice visible. Reklu shows model, reason, latency, tokens, and cost
            so teams can make better calls.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {MODELS.map(([provider, primary, secondary]) => (
            <div key={provider} className="rounded-xl border bg-background/80 p-4 shadow-sm">
              <div className="model-rail mb-4 h-1.5 rounded-full" />
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{provider}</div>
              <div className="mt-3 text-lg font-semibold">{primary}</div>
              <div className="mt-1 text-sm text-muted-foreground">{secondary}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workflows() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge variant="outline" className="rounded-full">
              Workspace flow
            </Badge>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Move from prompt to production-ready output.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {WORKFLOWS.map(({ icon: Icon, title, copy }) => (
              <Card key={title} className="bg-card/80 shadow-sm">
                <CardContent className="p-5">
                  <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Creation() {
  return (
    <section className="bg-foreground py-24 text-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium text-background/60">Artifacts</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
              Create the thing you came for.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-background/70">
              Reports, decks, images, spreadsheets, code canvases, and reusable skills can all
              start in chat and move into dedicated editing spaces.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-2">
            {CREATION_TOOLS.map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-xl border border-background/15 bg-background/8 p-5">
                <Icon className="size-6 text-background/70" />
                <div className="mt-5 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section className="py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3">
        {[
          [ShieldCheck, "Workspace isolation", "Every conversation and artifact is scoped to your organization."],
          [LockKeyhole, "Encrypted provider keys", "Secrets are encrypted at rest and never exposed to the browser."],
          [Globe2, "Connectors with consent", "Read and write actions stay explicit, reviewable, and permissioned."],
        ].map(([Icon, title, copy]) => {
          const TypedIcon = Icon as typeof ShieldCheck;
          return (
            <Card key={title as string} className="shadow-sm">
              <CardContent className="p-6">
                <TypedIcon className="size-5 text-primary" />
                <h3 className="mt-5 font-semibold">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy as string}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    ["Free", "$0", "Explore core chat and basic models.", ["Personal workspace", "Monthly starter credits", "Conversation history"]],
    ["Pro", "$20", "Use premium models and bring your own keys.", ["All model families", "BYOK", "Model comparison", "Priority queue"]],
    ["Team", "$40", "Centralize model work for a shared workspace.", ["Shared skills", "Team usage tracking", "Admin controls", "Audit trail"]],
  ];
  return (
    <section className="border-y bg-card/65 py-24" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Start small. Scale with usage.</h2>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {tiers.map(([name, price, desc, features], index) => (
            <Card key={name as string} className={index === 1 ? "border-primary shadow-xl" : "shadow-sm"}>
              <CardContent className="p-6">
                {index === 1 && <Badge className="mb-4 rounded-full">Most popular</Badge>}
                <h3 className="text-xl font-semibold">{name as string}</h3>
                <div className="mt-3 text-4xl font-semibold">{price as string}</div>
                <p className="mt-3 text-sm text-muted-foreground">{desc as string}</p>
                <ul className="mt-6 space-y-3 text-sm">
                  {(features as string[]).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-7 w-full rounded-full" variant={index === 1 ? "default" : "outline"}>
                  <Link href="/sign-up">{index === 2 ? "Contact sales" : "Start now"}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    ["Can Reklu use my existing API keys?", "Yes. Bring your own provider keys or use system-managed keys configured by an admin."],
    ["How does Auto choose a model?", "It checks intent, capabilities, cost, speed, and your preference, then shows a short reason."],
    ["Can my team share skills?", "Yes. Skills are versioned workflows that can be installed and reused across a workspace."],
    ["Is Reklu only for chat?", "No. Chat is the front door, but the workspace includes files, artifacts, connectors, usage, and admin tools."],
  ];
  return (
    <section className="py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight">Frequently asked</h2>
          <p className="mt-4 text-muted-foreground">The practical answers teams need before moving model work into one place.</p>
        </div>
        <div className="grid gap-3">
          {faqs.map(([q, a]) => (
            <Card key={q} className="shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card/65 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold">Reklu</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Every leading AI model, connected to the work your team already does.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/features">Features</Link>
          <Link href="/models">Models</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/sign-in">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
