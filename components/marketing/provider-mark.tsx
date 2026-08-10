import { cn } from "@/lib/utils";
import { providerColor } from "@/lib/provider-colors";

/**
 * A provider lettermark chip. Deliberately a typographic mark in the
 * provider's spectrum color rather than a reproduction of their logo —
 * keeps the visual system ours and avoids shipping third-party brand assets.
 */
export function ProviderMark({
  providerId,
  letter,
  size = "md",
  className,
}: {
  providerId: string;
  letter: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: "size-8 text-[13px] rounded-[9px]",
    md: "size-11 text-base rounded-[13px]",
    lg: "size-14 text-lg rounded-[16px]",
  }[size];

  return (
    <span
      aria-hidden
      className={cn(
        "elev-lift grid shrink-0 place-items-center border border-black/5 bg-card font-display font-semibold",
        dims,
        className,
      )}
      style={{ color: providerColor(providerId) }}
    >
      {letter}
    </span>
  );
}
