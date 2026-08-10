"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/features", label: "Features" },
  { href: "/models", label: "Models" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * Below `md` the nav links are hidden, which would otherwise leave phones with
 * no way to reach them. This is the escape hatch.
 */
export function MobileMenu() {
  const [open, setOpen] = React.useState(false);

  // Don't let the page scroll behind the open sheet.
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="elev-float absolute inset-x-3 top-3 rounded-2xl border border-border/70 bg-card p-3">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="font-display text-[15px] font-semibold tracking-tight">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-[15px] font-medium transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-3">
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link href="/sign-in" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild size="lg" className="w-full">
                <Link href="/sign-up" onClick={() => setOpen(false)}>
                  Start free <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
