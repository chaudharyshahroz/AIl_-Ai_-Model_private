import Link from "next/link";
import { cn } from "@/lib/utils";
import { SpectrumRule } from "@/components/ui/spectrum-rule";

/** The Reklu mark — converging strokes, echoing "many models, one answer". */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "elev-lift grid size-9 shrink-0 place-items-center rounded-[11px] bg-foreground text-background",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[18px]" aria-hidden>
        <path
          d="M5 6h7.5a3.5 3.5 0 0 1 0 7H5m0 0h5.5L19 19M5 6v13"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Logo + wordmark + spectrum rule — the full brand lockup. */
export function Wordmark({ href = "/", ruleWidth = "w-9" }: { href?: string; ruleWidth?: string }) {
  return (
    <Link href={href} className="group flex w-fit flex-col gap-2">
      <span className="flex items-center gap-2.5">
        <Logo />
        <span className="font-display text-[17px] font-semibold tracking-tight">Reklu</span>
      </span>
      <SpectrumRule className={`${ruleWidth} transition-[width] duration-300 group-hover:w-16`} />
    </Link>
  );
}
