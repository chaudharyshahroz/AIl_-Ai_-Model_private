"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

/**
 * Mobile navigation is driven by a class on <html>, matching how the desktop
 * panel collapse already works — no context or state to thread through the
 * server-rendered shell.
 */
export function openMobileNav() {
  document.documentElement.classList.add("mobile-nav-open");
}

export function closeMobileNav() {
  document.documentElement.classList.remove("mobile-nav-open");
}

/** Hamburger shown only below the `md` breakpoint. */
export function MobileNavButton() {
  return (
    <button
      onClick={openMobileNav}
      aria-label="Open navigation"
      className="-ml-1 grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
    >
      <Menu className="size-5" />
    </button>
  );
}

/**
 * Dimmed backdrop behind the drawer. Also closes the drawer on route change,
 * so tapping a nav item doesn't leave it hanging open over the new page.
 */
export function MobileNavScrim() {
  const pathname = usePathname();

  React.useEffect(() => {
    closeMobileNav();
  }, [pathname]);

  // Escape should close it too.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMobileNav();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      onClick={closeMobileNav}
      aria-hidden
      className="mobile-scrim fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
    />
  );
}
