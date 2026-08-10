import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small accent label above a section heading. */
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
    <div className={cn("mb-4 flex", center && "justify-center")}>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
        <Icon className="size-3" />
        {label}
      </span>
    </div>
  );
}
