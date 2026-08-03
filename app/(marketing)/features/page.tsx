import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, Cpu, Database, FileText, Globe, MessageSquare, Shield, Split, Wrench, Zap } from "lucide-react";

export const metadata = { title: "Features" };

const FEATURES = [
  [MessageSquare, "Unified multi-model chat", "Chat with leading providers, switch mid-conversation, or let Reklu Auto route the work."],
  [Cpu, "Reklu Auto", "Intent-aware model selection with a short reason, not hidden magic."],
  [Split, "Model comparison", "Run the same prompt through multiple models and keep the strongest path."],
  [Zap, "Skills", "Versioned workflows with model policy, structured output, and quality checks."],
  [Globe, "Connectors", "Bring workspace context from your apps, with explicit approval for write actions."],
  [Wrench, "MCP client", "Connect trusted tool servers and control approvals per tool."],
  [FileText, "Artifact canvas", "Create documents, decks, images, spreadsheets, and code from chat."],
  [Database, "Knowledge search", "Upload files and retrieve cited context across your workspace."],
  [Shield, "BYOK and audit", "Encrypted keys, usage visibility, and admin-ready controls."],
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen">
      <MarketingHeader />
      <section className="relative px-4 py-20 sm:px-6">
        <div className="absolute inset-0 grid-bg opacity-55" />
        <div className="relative mx-auto max-w-5xl text-center">
          <Badge variant="outline" className="rounded-full bg-card/70">Features</Badge>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
            The AI workspace that keeps context moving.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Reklu combines model routing, reusable skills, connected data, and artifact creation
            into a single operational workspace.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([Icon, title, desc]) => {
            const TypedIcon = Icon as typeof MessageSquare;
            return (
              <Card key={title as string} className="bg-card/85 shadow-sm">
                <CardContent className="p-6">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <TypedIcon className="size-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc as string}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="border-y bg-foreground px-4 py-20 text-background sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight">Ready to route real work?</h2>
            <p className="mt-3 max-w-xl text-background/70">Open a workspace, add a provider, and start with a single chat.</p>
          </div>
          <Button asChild size="xl" className="w-fit rounded-full bg-background text-foreground hover:bg-background/90">
            <Link href="/sign-up">Start free <ArrowRight /></Link>
          </Button>
        </div>
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
