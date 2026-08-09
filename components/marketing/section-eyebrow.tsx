import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small label + icon used above a section heading. Replaces the pill-badge eyebrow pattern. */
export function SectionEyebrow({
  icon: Icon,
  label,
  center = false,
}: {
  icon: LucideIcon;
  label: string;
  center?: boolean;
}) {
  return (
    <div className={cn("mb-4 flex items-center gap-2 text-primary", center && "justify-center")}>
      <Icon className="size-3.5" />
      <span className="text-xs font-semibold uppercase tracking-[0.14em]">{label}</span>
    </div>
  );
}
