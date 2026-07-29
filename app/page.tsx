import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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
  Mic,
  MessageSquare,
  Globe,
} from "lucide-react";

export const dynamic = "force-dynamic";

const MODELS = [
  { name: "GPT-4o", provider: "OpenAI" },
  { name: "Claude Sonnet 4.5", provider: "Anthropic" },
  { name: "Gemini 2.5 Pro", provider: "Google" },
  { name: "Grok 2", provider: "xAI" },
  { name: "DeepSeek V3", provider: "DeepSeek" },
  { name: "Kimi K2 128K", provider: "Moonshot" },
  { name: "Mistral Large 2", provider: "Mistral" },
  { name: "Command R+", provider: "Cohere" },
  { name: "Sonar Large", provider: "Perplexity" },
  { name: "Llama 3.3 70B", provider: "Groq" },
  { name: "Qwen Max", provider: "Alibaba" },
  { name: "o3-mini", provider: "OpenAI" },
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
  const session = await auth();
  if (session?.user?.id) redirect("/app/chat");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Models />
      <UnifiedChat />
      <Skills />
      <Create />
      <Connect />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold">Reklu</span>
        </Link>
        <nav className="hidden gap-6 md:flex">
          <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="/models" className="text-sm text-muted-foreground hover:text-foreground">
            Models
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">
              Get started <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
      <span className="text-xs font-bold tracking-tight">R</span>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 sm:pt-28 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-6 gap-1.5">
            <Sparkles className="size-3" /> Now with Reklu Auto
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Every leading AI model.{" "}
            <span className="text-muted-foreground">One connected workspace.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Chat with GPT, Claude, Gemini, Grok, and other leading models. Connect your apps and
            data, use specialized AI skills, and create documents, presentations, images,
            spreadsheets, code, and more — all from one intelligent chat interface.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/sign-up">
                Start using Reklu <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/features">Explore the workspace</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card. Free tier available. BYOK supported.
          </p>
        </div>

        {/* Demo card */}
        <div className="mx-auto mt-16 max-w-4xl">
          <DemoCard />
        </div>
      </div>
    </section>
  );
}

function DemoCard() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
      <div className="flex items-center gap-1.5 border-b bg-muted/30 px-4 py-2.5">
        <div className="size-2.5 rounded-full bg-red-500/80" />
        <div className="size-2.5 rounded-full bg-yellow-500/80" />
        <div className="size-2.5 rounded-full bg-green-500/80" />
        <div className="ml-3 text-xs text-muted-foreground">reklu.app/app/chat</div>
      </div>
      <div className="grid gap-px bg-border md:grid-cols-2">
        <div className="space-y-4 bg-card p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            <span>You</span>
          </div>
          <p className="text-sm">
            Help me draft a Q3 go-to-market plan for a developer tool that helps AI startups
            monitor their brand visibility across ChatGPT, Claude, and Perplexity.
          </p>
        </div>
        <div className="space-y-3 bg-muted/20 p-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
              Reklu Auto
            </span>
            <span>· Claude Sonnet 4.5</span>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">Selected for strong writing quality and reasoning.</span>{" "}
            Here's a draft you can adapt:
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex gap-2">
              <span className="text-muted-foreground">1.</span>
              <span>Define your ICP: AI-native teams shipping to technical buyers</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">2.</span>
              <span>Anchor on three visibility plays: prompt monitoring, citation velocity, share-of-answer</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground">3.</span>
              <span>Run a 30-day pulse across 50 priority prompts before and after each launch</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
    <section className="border-t bg-muted/20 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-muted-foreground">Trusted model providers</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            All the leading models, in one place
          </h2>
          <p className="mt-3 text-muted-foreground">
            We connect directly to each provider — no middleman, no markup on top of list price.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MODELS.map((m) => (
            <Card key={m.name} className="border-border/50 bg-background">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{m.provider}</div>
                <div className="mt-1 text-sm font-medium">{m.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function UnifiedChat() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-4 gap-1.5">
              <MessageSquare className="size-3" /> Unified chat
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
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
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">GPT-4o</div>
                <div className="mt-1">Sure, here's a function that reads a CSV in TypeScript…</div>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <div className="text-xs text-muted-foreground">Switched to Claude Sonnet 4.5</div>
                <div className="mt-1">
                  I can do that, plus a type-safe parser. Want me to add error handling for
                  malformed rows?
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">You</div>
                <div className="mt-1">Yes, and add tests please.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section className="border-t bg-muted/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Zap className="size-3" /> Skills
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            More than prompts. Complete AI workflows.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Each Reklu skill combines instructions, model policy, tools, output format, and
            quality checks. Not a prompt library — a workflow engine.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </div>
    </section>
  );
}

function Create() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Sparkles className="size-3" /> Create
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Create real artifacts, not just text
          </h2>
          <p className="mt-3 text-muted-foreground">
            Generate, edit, and export. From chat or from a dedicated creation page.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CREATORS.map(({ icon: Icon, name, desc }) => (
            <Card key={name}>
              <CardContent className="p-5">
                <Icon className="size-5 text-muted-foreground" />
                <h3 className="mt-3 font-medium">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Connect() {
  return (
    <section className="border-t bg-muted/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-4 gap-1.5">
              <Globe className="size-3" /> Connect
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
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
                <div
                  key={c}
                  className="rounded-md border bg-background px-3 py-2 text-muted-foreground"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="size-3" /> Permission requested
              </div>
              <div className="rounded-lg border bg-background p-4">
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
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      desc: "Try every model with monthly credits",
      features: ["Limited monthly credits", "Basic models", "Personal workspace"],
      cta: "Start free",
    },
    {
      name: "Pro",
      price: "$20",
      desc: "Premium models, more credits, BYOK",
      features: ["All models", "Larger credit allowance", "Model comparison", "BYOK", "Priority queue"],
      cta: "Upgrade",
      featured: true,
    },
    {
      name: "Team",
      price: "$40",
      desc: "Shared workspace, central billing",
      features: ["Everything in Pro", "Shared skills & connectors", "Team credits", "Audit logs"],
      cta: "Contact sales",
    },
  ];
  return (
    <section className="py-24" id="pricing">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-muted-foreground">Pay for what you use. Cancel any time.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {tiers.map((t) => (
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
                <Button
                  asChild
                  className="mt-6 w-full"
                  variant={t.featured ? "default" : "outline"}
                >
                  <Link href="/sign-up">{t.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Enterprise plans available with SSO, SCIM, and private deployment.
        </div>
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
    <section className="border-t bg-muted/20 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked</h2>
        <div className="mt-10 space-y-3">
          {items.map((it) => (
            <Card key={it.q}>
              <CardContent className="p-6">
                <h3 className="font-medium">{it.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{it.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
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
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="font-semibold">Reklu</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Every leading AI model. One connected workspace.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">Product</h4>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/features">Features</Link>
              </li>
              <li>
                <Link href="/models">Models</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">Company</h4>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/docs">Docs</Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">Legal</h4>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/security">Security</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Reklu. All rights reserved.</p>
          <p>reklu.app</p>
        </div>
      </div>
    </footer>
  );
}
