"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Fade + rise on mount, for above-the-fold content.
 *
 * Uses a CSS animation rather than a rAF-driven library on purpose: CSS
 * animations are time-based, so if the page is opened in a background tab the
 * animation has already elapsed by the time it's viewed. A rAF-driven
 * animation is paused there and would leave the hero stuck invisible until
 * the tab gets focus.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("reveal-up", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Fade + rise once when scrolled into view, for below-the-fold sections.
 * IntersectionObserver flips a class; the transition itself is CSS, so the
 * content is never left invisible if animation frames aren't running.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (or already past it) — just show it.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "-60px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", shown && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
