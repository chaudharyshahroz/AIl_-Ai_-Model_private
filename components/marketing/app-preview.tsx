import { ProviderDot } from "@/components/ui/provider-badge";
import {
  Sparkles,
  MessageSquarePlus,
  Code2,
  Wrench,
  Plug,
  Search,
  ArrowUp,
  Check,
} from "lucide-react";

const RAIL = [MessageSquarePlus, Code2, Wrench, Plug, Search];

/**
 * A faithful, static mockup of the real workspace — the hero's proof shot.
 * Rendered as markup rather than a screenshot so it stays theme-aware and crisp.
 */
export function AppPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Ambient glow under the frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 bottom-0 h-40 rounded-full opacity-25 blur-[70px]"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="elev-float relative overflow-hidden rounded-2xl border border-border/70 bg-card">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border/70 bg-background/60 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          </div>
          <div className="mx-auto rounded-md bg-muted px-3 py-1 font-mono text-[11px] text-muted-foreground">
            reklu.app/app/chat
          </div>
        </div>

        <div className="flex h-[420px]">
          {/* Icon rail */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-1.5 border-r border-border/70 bg-background/40 py-4 sm:flex">
            <span className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
              <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
                <path
                  d="M5 6h7.5a3.5 3.5 0 0 1 0 7H5m0 0h5.5L19 19M5 6v13"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="my-1.5 h-px w-6 bg-border" />
            {RAIL.map((Icon, i) => (
              <span
                key={i}
                className={`grid size-9 place-items-center rounded-lg ${
                  i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground/60"
                }`}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>

          {/* Conversation list */}
          <div className="hidden w-52 shrink-0 flex-col border-r border-border/70 bg-background/25 lg:flex">
            <div className="border-b border-border/70 px-4 py-3 text-xs font-semibold">Chats</div>
            <div className="space-y-1 p-2">
              {["Q3 GTM plan draft", "CSV parser in TS", "Competitor teardown"].map((t, i) => (
                <div
                  key={t}
                  className={`rounded-lg px-2.5 py-2 text-xs ${
                    i === 0 ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Conversation */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <span className="text-xs font-medium">Q3 GTM plan draft</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium">
                <ProviderDot providerId="anthropic" />
                Claude Sonnet 4.5
              </span>
            </div>

            <div className="flex-1 space-y-5 overflow-hidden p-5">
              <div className="flex justify-end">
                <div className="max-w-[78%] rounded-xl rounded-tr-sm bg-muted px-4 py-2.5 text-[13px]">
                  Draft a Q3 GTM plan for a tool that tracks brand visibility across ChatGPT,
                  Claude, and Perplexity.
                </div>
              </div>

              <div className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-background">
                  <Sparkles className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded-full bg-primary/12 px-2 py-0.5 font-medium text-primary">
                      Reklu Auto
                    </span>
                    <span className="text-muted-foreground">
                      picked Claude Sonnet 4.5 — strongest at long-form strategy
                    </span>
                  </div>
                  <ol className="space-y-1.5 text-[13px] leading-relaxed">
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
                  </ol>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">
                      <Check className="size-3" /> 1.2s
                    </span>
                    <span>2,148 tokens</span>
                    <span>·</span>
                    <span className="font-mono">$0.013</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-border/70 p-4">
              <div className="elev-card flex items-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-3">
                <span className="flex-1 text-[13px] text-muted-foreground">Message Reklu…</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-2 py-1 text-[11px] font-medium">
                  <Sparkles className="size-3 text-primary" />
                  Auto
                </span>
                <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <ArrowUp className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
