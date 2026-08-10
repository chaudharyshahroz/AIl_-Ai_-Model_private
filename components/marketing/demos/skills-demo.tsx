import { Check, Loader2, Search, FileSearch, PenLine, ShieldCheck } from "lucide-react";
import { ProviderDot } from "@/components/ui/provider-badge";

const STEPS = [
  { icon: Search, label: "Search 40 sources", meta: "web + your files", done: true },
  { icon: FileSearch, label: "Extract and rank claims", meta: "126 passages", done: true },
  { icon: PenLine, label: "Draft with citations", meta: "running", running: true },
  { icon: ShieldCheck, label: "Quality check", meta: "queued" },
];

/** A skill mid-run: a real multi-step workflow, not a saved prompt. */
export function SkillsDemo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
        <div>
          <div className="text-[13px] font-semibold">Deep Research</div>
          <div className="text-[11px] text-muted-foreground">Skill · v2.1</div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-[10px] font-medium">
          <ProviderDot providerId="perplexity" />
          Model policy: research
        </span>
      </div>

      <div className="space-y-1 p-3">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className="demo-line flex items-center gap-3 rounded-lg px-2.5 py-2"
            style={{ "--demo-delay": `${0.2 + i * 0.35}s` } as React.CSSProperties}
          >
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-md ${
                s.done
                  ? "bg-success/12 text-success"
                  : s.running
                    ? "bg-primary/12 text-primary"
                    : "bg-muted text-muted-foreground/60"
              }`}
            >
              {s.done ? (
                <Check className="size-3.5" strokeWidth={3} />
              ) : s.running ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <s.icon className="size-3.5" />
              )}
            </span>
            <span className="min-w-0 flex-1 text-[12px] font-medium">{s.label}</span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{s.meta}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border/70 bg-muted/25 px-4 py-2.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>4 steps · 2 tools · 1 quality gate</span>
          <span className="font-mono">$0.041</span>
        </div>
      </div>
    </div>
  );
}
