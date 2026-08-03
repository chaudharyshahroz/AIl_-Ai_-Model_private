"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Activity, Moon, Sun } from "lucide-react";

export function TopBar({ user }: { user: { name: string | null; email: string | null } }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm sm:flex sm:items-center sm:gap-2">
          <Activity className="size-3.5 text-primary" />
          Workspace ready
        </div>
        <div className="text-sm">
          <div className="font-medium text-foreground">Chat</div>
          <div className="text-xs text-muted-foreground">Route, compare, and create with models</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
