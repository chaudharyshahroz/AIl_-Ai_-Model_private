import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpectrumRule } from "@/components/ui/spectrum-rule";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { MessageSquare, Zap, Globe, Shield, Cpu, Wrench, FileText, Database, Layers } from "lucide-react";

export const metadata = { title: "Features" };

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Unified multi-model chat",
    desc: "Chat with GPT, Claude, Gemini, and other leading models. Switch mid-conversation, compare side by side, or let Reklu Auto pick.",
  },
  {
    icon: Cpu,
    title: "Reklu Auto",
    desc: "Intent + capability + preference based model selection. Always shows a short, transparent explanation of why a model was chosen.",
  },
  {
    icon: Zap,
    title: "Skills",
    desc: "Versioned AI workflows that combine instructions, model policy, tools, and quality checks. Not a prompt library — a workflow engine.",
  },
  {
    icon: Globe,
    title: "Connectors",
    desc: "Native OAuth integrations with Google, Microsoft, Slack, Notion, GitHub, Linear, Jira, HubSpot, and more. Read context, write with explicit approval.",
  },
  {
    icon: Wrench,
    title: "MCP client",
    desc: "Connect to any Model Context Protocol server. Streamable HTTP and SSE transports. Recurring or one-off approvals for every tool call.",
  },
  {
    icon: FileText,
    title: "Artifact canvas",
    desc: "Generate documents, presentations, images, spreadsheets, and code. Edit in a side-by-side canvas. Export to DOCX, PPTX, XLSX, PDF.",
  },
  {
    icon: Database,
    title: "Knowledge and RAG",
    desc: "Upload PDFs, DOCX, code, audio transcripts. Semantic + keyword search, citations, and access control.",
  },
  {
    icon: Shield,
    title: "BYOK, encryption, audit",
    desc: "Bring your own provider key. Encrypted at rest with envelope encryption. Full audit log of every tool call, every write.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="mx-auto mb-4 flex w-fit items-center gap-2 text-primary">
          <Layers className="size-3.5" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Features</span>
        </div>
        <h1 className="text-balance display-lg text-4xl sm:text-5xl">
          Everything you need in one workspace
        </h1>
        <SpectrumRule className="mx-auto mt-6 w-16" />
        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
          Reklu is a premium, chat-first AI workspace. The features below are all designed to stay
          out of your way until you need them.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-6">
                <f.icon className="size-5 text-primary" />
                <h3 className="mt-3 font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="border-t py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionEyebrow icon={Zap} label="Get started" center />
          <h2 className="display-lg text-3xl">Try it now</h2>
          <p className="mt-3 text-muted-foreground">Open Reklu, start a chat, and see for yourself.</p>
          <Button asChild size="xl" className="mt-6">
            <Link href="/sign-up">Start using Reklu</Link>
          </Button>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}
