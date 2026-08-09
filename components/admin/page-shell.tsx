import { cn } from "@/lib/utils";

/**
 * Shared shell for admin pages — every admin page repeated this
 * mx-auto max-w-* + space-y-6 + p-6 + header pattern verbatim.
 */
export function AdminPageShell({
  title,
  subtitle,
  actions,
  maxWidth = "6xl",
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "4xl" | "5xl" | "6xl";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto space-y-6 p-6",
        maxWidth === "4xl" && "max-w-4xl",
        maxWidth === "5xl" && "max-w-5xl",
        maxWidth === "6xl" && "max-w-6xl",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
