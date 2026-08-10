import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionEyebrow } from "@/components/marketing/section-eyebrow";
import { ScrollReveal } from "@/components/marketing/reveal";

/**
 * Alternating copy/demo section. `flip` puts the demo on the left so a run of
 * these doesn't read as one repeated block.
 */
export function FeatureSection({
  eyebrow,
  icon,
  title,
  body,
  bullets,
  demo,
  flip = false,
  className,
}: {
  eyebrow: string;
  icon: LucideIcon;
  title: React.ReactNode;
  body: string;
  bullets: string[];
  demo: React.ReactNode;
  flip?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-border/60 py-20 sm:py-24", className)}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal className={cn(flip && "lg:order-2")}>
            <SectionEyebrow icon={icon} label={eyebrow} />
            <h2 className="display-lg text-[clamp(1.85rem,3.4vw,2.5rem)]">{title}</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{body}</p>
            <ul className="mt-7 space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-primary/12">
                    <Check className="size-2.5 text-primary" strokeWidth={3.5} />
                  </span>
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className={cn(flip && "lg:order-1")}>
            {demo}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
