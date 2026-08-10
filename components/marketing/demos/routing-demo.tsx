import { ProviderMark } from "@/components/marketing/provider-mark";
import { ProviderDot } from "@/components/ui/provider-badge";
import { Sparkles } from "lucide-react";

const CANDIDATES = [
  { id: "openai", letter: "O", name: "GPT-4o", y: 34 },
  { id: "anthropic", letter: "A", name: "Claude Sonnet 4.5", y: 108, chosen: true },
  { id: "google", letter: "G", name: "Gemini 2.5 Pro", y: 182 },
];

/**
 * Reklu Auto: one prompt fans out to candidate models, one is selected, and
 * the reason is shown. Pure CSS/SVG — no runtime cost, no rAF dependency.
 */
export function RoutingDemo() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/70 bg-background p-5">
      <div className="mb-4 flex items-start gap-2.5">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
          You
        </span>
        <p className="text-[13px]">
          Summarise this 40-page contract and flag anything unusual.
          <span className="demo-caret ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-primary" />
        </p>
      </div>

      <div className="relative h-[216px]">
        <svg
          viewBox="0 0 360 216"
          className="absolute inset-0 size-full"
          fill="none"
          aria-hidden
        >
          {CANDIDATES.map((c, i) => (
            <path
              key={c.id}
              d={`M56 108 C110 108 110 ${c.y} 164 ${c.y}`}
              stroke={c.chosen ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={c.chosen ? 2 : 1.5}
              className="demo-trace"
              style={{ "--demo-delay": `${0.2 + i * 0.12}s` } as React.CSSProperties}
            />
          ))}
        </svg>

        {/* Auto node */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <span className="relative grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <span className="demo-pulse absolute inset-0 rounded-xl bg-primary/40" />
            <Sparkles className="relative size-5" />
          </span>
          <span className="mt-1.5 block text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Auto
          </span>
        </div>

        {/* Candidate models */}
        {CANDIDATES.map((c, i) => (
          <div
            key={c.id}
            className="demo-line absolute flex items-center gap-2.5"
            style={
              {
                left: 164,
                top: c.y,
                transform: "translateY(-50%)",
                "--demo-delay": `${0.5 + i * 0.12}s`,
              } as React.CSSProperties
            }
          >
            <ProviderMark providerId={c.id} letter={c.letter} size="sm" />
            <div className="min-w-0">
              <div className="whitespace-nowrap text-[12px] font-medium">{c.name}</div>
              {c.chosen ? (
                <div className="text-[10px] font-medium text-primary">Selected</div>
              ) : (
                <div className="text-[10px] text-muted-foreground">Considered</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div
        className="demo-line mt-4 rounded-lg border border-primary/20 bg-primary/[0.06] p-3"
        style={{ "--demo-delay": "1.1s" } as React.CSSProperties}
      >
        <div className="flex items-center gap-1.5 text-[11px]">
          <ProviderDot providerId="anthropic" />
          <span className="font-medium text-primary">Claude Sonnet 4.5</span>
          <span className="text-muted-foreground">— 200K context fits the whole contract</span>
        </div>
      </div>
    </div>
  );
}
