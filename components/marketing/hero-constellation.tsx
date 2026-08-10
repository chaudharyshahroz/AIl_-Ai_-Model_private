import { ProviderMark } from "@/components/marketing/provider-mark";

interface MarkPos {
  id: string;
  letter: string;
  top: string;
  left?: string;
  right?: string;
}

const MARKS: MarkPos[] = [
  { id: "openai", letter: "O", top: "4%", left: "0%" },
  { id: "anthropic", letter: "A", top: "40%", left: "7%" },
  { id: "deepseek", letter: "D", top: "76%", left: "1%" },
  { id: "google", letter: "G", top: "4%", right: "0%" },
  { id: "xai", letter: "X", top: "40%", right: "7%" },
  { id: "mistral", letter: "M", top: "76%", right: "1%" },
];

/** Rails converge from the outer marks toward the headline, stopping short of
 *  the text block (roughly x 400–800) so they never read as a frame. */
const PATHS = [
  "M62 40 H200 C285 40 300 130 322 185 C333 213 350 230 386 230",
  "M132 230 H386",
  "M62 420 H200 C285 420 300 330 322 275 C333 247 350 230 386 230",
  "M1138 40 H1000 C915 40 900 130 878 185 C867 213 850 230 814 230",
  "M1068 230 H814",
  "M1138 420 H1000 C915 420 900 330 878 275 C867 247 850 230 814 230",
];

/**
 * Decorative rails feeding provider marks into the headline — the visual
 * argument for the product: many models converging into one answer.
 * Hidden below lg, where it would crowd the type.
 */
export function HeroConstellation() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1200 460"
        fill="none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="rail-l" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0" />
            <stop offset="40%" stopColor="hsl(var(--border))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="rail-r" x1="1" x2="0">
            <stop offset="0%" stopColor="hsl(var(--border))" stopOpacity="0" />
            <stop offset="40%" stopColor="hsl(var(--border))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {PATHS.map((d, i) => (
          <path
            key={d}
            d={d}
            stroke={i < 3 ? "url(#rail-l)" : "url(#rail-r)"}
            strokeWidth="1.5"
            fill="none"
            className="rail-draw"
            style={{ animationDelay: `${0.4 + i * 0.07}s` }}
          />
        ))}
      </svg>

      {MARKS.map((p, i) => (
        <div
          key={p.id + p.top}
          className="reveal-up absolute"
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            animationDelay: `${0.5 + i * 0.07}s`,
          }}
        >
          <ProviderMark providerId={p.id} letter={p.letter} size="md" />
        </div>
      ))}
    </div>
  );
}
