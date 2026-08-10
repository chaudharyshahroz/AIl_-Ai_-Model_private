import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared shell for workspace pages — every one of them repeated the same
 * scroll container + max-width + header block. Mirrors AdminPageShell.
 */
export function WorkspacePageShell({
  title,
  subtitle,
  icon: Icon,
  actions,
  maxWidth = "5xl",
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  maxWidth?: "3xl" | "4xl" | "5xl" | "6xl";
  children: React.ReactNode;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div
        className={cn(
          "mx-auto space-y-6 px-4 py-6 sm:px-6 sm:py-8",
          maxWidth === "3xl" && "max-w-3xl",
          maxWidth === "4xl" && "max-w-4xl",
          maxWidth === "5xl" && "max-w-5xl",
          maxWidth === "6xl" && "max-w-6xl",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                <Icon className="size-5 text-primary" />
              </span>
            )}
            <div>
              <h1 className="display-lg text-2xl">{title}</h1>
              {subtitle && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}
