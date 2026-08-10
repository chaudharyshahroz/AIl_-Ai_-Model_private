import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { AnnouncementBar } from "@/components/marketing/announcement-bar";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { ScrollReveal, Reveal } from "@/components/marketing/reveal";
import {
  MessageSquare,
  Zap,
  Globe,
  Shield,
  Cpu,
  Wrench,
  FileText,
  Database,
  Layers,
  Hammer,
  Wand2,
  Plug,
  Presentation,
  ImageIcon,
  Table2,
  Code2,
  Search,
  ArrowRight,
} from "lucide-react";

export const metadata = { title: "Features" };

const GROUPS = [
  {
    eyebrow: "Chat",
    icon: MessageSquare,
    title: "Every model, one conversation",
    items: [
      {
        icon: MessageSquare,
        title: "Unified multi-model chat",
        desc: "GPT, Claude, Gemini, Grok, DeepSeek, Mistral and more. Switch mid-conversation without losing context.",
      },
      {
        icon: Cpu,
        title: "Reklu Auto",
        desc: "Routes each message on intent, required capabilities, and your quality/speed/cost preference — and always explains the pick.",
      },
      {
        icon: Layers,
        title: "Side-by-side comparison",
        desc: "Run the same prompt against two to four models in synchronised columns and judge the output yourself.",
      },
      {
        icon: Search,
        title: "Search and branching",
        desc: "Full-text search across every conversation, with branching so you can explore an alternative without losing the thread.",
      },
    ],
  },
  {
    eyebrow: "Build",
    icon: Hammer,
    title: "From a sentence to a running app",
    items: [
      {
        icon: Hammer,
        title: "Website builder",
        desc: "Landing pages, marketing sites, and dashboards generated as real code with a live preview that updates as it streams.",
      },
      {
        icon: Code2,
        title: "Mobile app screens",
        desc: "Describe a flow and get mobile-ready screens, previewed in a device frame alongside the web layout.",
      },
      {
        icon: Wrench,
        title: "Iterate by conversation",
        desc: "Say what to change instead of editing code. Reklu rewrites and re-renders in place.",
      },
      {
        icon: FileText,
        title: "Export anywhere",
        desc: "Download a self-contained file you can host immediately, or take the source into your own repo.",
      },
    ],
  },
  {
    eyebrow: "Create",
    icon: Wand2,
    title: "Real files, not chat transcripts",
    items: [
      {
        icon: FileText,
        title: "Documents and reports",
        desc: "Structured long-form writing with headings, tables, and citations. Exports to DOCX and PDF.",
      },
      {
        icon: Presentation,
        title: "Presentations",
        desc: "Real slide layouts with speaker notes, not a bulleted outline. Exports to PPTX.",
      },
      {
        icon: ImageIcon,
        title: "Images and diagrams",
        desc: "Generate and edit visuals, or produce clean vector diagrams. Exports to PNG and SVG.",
      },
      {
        icon: Table2,
        title: "Spreadsheets",
        desc: "Working formulas, charts, and forecasts from raw data. Exports to XLSX and CSV.",
      },
    ],
  },
  {
    eyebrow: "Connect",
    icon: Plug,
    title: "Skills, MCP, and your own tools",
    items: [
      {
        icon: Zap,
        title: "Skills",
        desc: "Versioned workflows combining instructions, model policy, tools, output format, and quality checks. Testable, not just saved prompts.",
      },
      {
        icon: Plug,
        title: "MCP client",
        desc: "Connect any Model Context Protocol server over streamable HTTP or SSE, with one-off or recurring approvals per tool.",
      },
      {
        icon: Globe,
        title: "Native connectors",
        desc: "Google Drive, Gmail, Calendar, Slack, Notion, GitHub, Linear, Jira, HubSpot and more — read context, write with explicit approval.",
      },
      {
        icon: Database,
        title: "Knowledge and RAG",
        desc: "Upload PDFs, DOCX, code, and transcripts. Semantic plus keyword search with citations and access control.",
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <MarketingHeader />

      <section className="relative -mt-16 overflow-hidden pt-16">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Reveal>
            <SectionEyebrow icon={Layers} label="Features" center />
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="display-xl text-balance text-[clamp(2.4rem,5.5vw,3.75rem)]">
              Everything you need in one workspace
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Four surfaces — chat, build, create, connect — sharing one set of models, one
              context, and one bill.
            </p>
          </Reveal>
        </div>
      </section>

      {GROUPS.map((group, gi) => (
        <section key={group.eyebrow} className="border-t border-border/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal className="mb-10 max-w-2xl">
              <SectionEyebrow icon={group.icon} label={group.eyebrow} />
              <h2 className="display-lg text-[clamp(1.75rem,3.2vw,2.35rem)]">{group.title}</h2>
            </ScrollReveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.items.map((f, i) => (
                <ScrollReveal key={f.title} delay={Math.min(i * 0.06, 0.2)}>
                  <div className="elev-card-hover h-full rounded-2xl border border-border/70 bg-card p-6">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10">
                      <f.icon className="size-5 text-primary" />
                    </span>
                    <h3 className="display-md mt-4 text-lg">{f.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
          {gi === GROUPS.length - 1 && null}
        </section>
      ))}

      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <SectionEyebrow icon={Shield} label="Built in" center />
            <h2 className="display-lg text-[clamp(1.75rem,3.2vw,2.35rem)]">
              BYOK, encryption, and a full audit trail
            </h2>
            <p className="mt-4 text-[17px] text-muted-foreground">
              Bring your own provider key, encrypted at rest with AES-256-GCM. Every tool call
              and every write is recorded.
            </p>
            <Button asChild size="xl" className="mt-8">
              <Link href="/sign-up">
                Start using Reklu <ArrowRight />
              </Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
