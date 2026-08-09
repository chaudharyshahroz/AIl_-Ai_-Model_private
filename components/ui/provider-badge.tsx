import { cn } from "@/lib/utils";
import { providerColor } from "@/lib/provider-colors";

/** A small colored dot identifying a provider — the atomic unit of the spectrum system. */
export function ProviderDot({ providerId, className }: { providerId: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 shrink-0 rounded-full", className)}
      style={{ background: providerColor(providerId) }}
    />
  );
}

/** Dot + label chip for naming a provider (model selector, message meta, admin lists). */
export function ProviderBadge({
  providerId,
  label,
  className,
}: {
  providerId: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium text-foreground",
        className,
      )}
    >
      <ProviderDot providerId={providerId} />
      {label}
    </span>
  );
}
