"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MobileNavButton } from "@/components/app/mobile-nav";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * Slim app header: the rail owns navigation on desktop, so this is the mobile
 * drawer trigger plus the theme toggle. Page identity comes from inline
 * content headers rather than a breadcrumb.
 */
export function TopBar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <MobileNavButton />
      <div className="ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
