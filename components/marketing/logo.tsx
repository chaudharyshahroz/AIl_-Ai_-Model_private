import Link from "next/link";
import { SpectrumRule } from "@/components/ui/spectrum-rule";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`grid size-7 place-items-center rounded-md bg-foreground text-background ${className ?? ""}`}>
      <span className="font-display text-xs font-bold tracking-tight">R</span>
    </div>
  );
}

/** Logo + wordmark + the signature spectrum rule underneath. The one brand lockup. */
export function Wordmark({ href = "/", ruleWidth = "w-8" }: { href?: string; ruleWidth?: string }) {
  return (
    <Link href={href} className="group flex flex-col gap-1.5">
      <span className="flex items-center gap-2">
        <Logo />
        <span className="font-display text-[15px] font-semibold tracking-tight">Reklu</span>
      </span>
      <SpectrumRule className={`${ruleWidth} transition-[width] duration-300 group-hover:w-14`} />
    </Link>
  );
}
