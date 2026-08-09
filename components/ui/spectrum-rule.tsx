import { cn } from "@/lib/utils";

/**
 * Reklu's signature mark — a thin gradient line cycling through provider
 * hues. Use once per view (a wordmark underline, an active-tab indicator, a
 * composer's streaming edge). Never tile it as decoration.
 */
export function SpectrumRule({
  animated = false,
  className,
}: {
  animated?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(animated ? "spectrum-rule-animated h-[2px] rounded-full" : "spectrum-rule", className)}
    />
  );
}
