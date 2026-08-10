"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquarePlus,
  Search,
  Settings,
  LogOut,
  KeyRound,
  Code2,
  ShieldCheck,
  Wrench,
  Plug,
  FileText,
  Server,
  Image as ImageIcon,
  PanelLeft,
} from "lucide-react";

const PRIMARY = [
  { href: "/app/chat", label: "New chat", icon: MessageSquarePlus },
  { href: "/app/build", label: "Build", icon: Code2 },
];

const SECONDARY = [
  { href: "/app/skills", label: "Skills", icon: Wrench },
  { href: "/app/connectors", label: "Connectors", icon: Plug },
  { href: "/app/mcp", label: "MCP", icon: Server },
  { href: "/app/files", label: "Files", icon: FileText },
  { href: "/app/images", label: "Images", icon: ImageIcon },
  { href: "/app/artifacts", label: "Artifacts", icon: FileText },
  { href: "/app/search", label: "Search", icon: Search },
];

/** Toggles the .context-panel's collapsed state via a DOM class + localStorage — no
 * React state involved, so there's no server/client width mismatch to hydrate around. */
function togglePanel() {
  const collapsed = document.documentElement.classList.toggle("panel-collapsed");
  try {
    localStorage.setItem("reklu-panel-collapsed", collapsed ? "1" : "0");
  } catch {}
}

function RailButton({
  href,
  label,
  icon: Icon,
  active,
  variant = "ghost",
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  variant?: "ghost" | "primary";
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "relative flex size-10 items-center justify-center rounded-lg transition-colors",
            variant === "primary"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {active && variant !== "primary" && (
            <span className="spectrum-edge absolute left-0 top-1 bottom-1 rounded-full" />
          )}
          <Icon className="size-[18px]" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function NavRail({
  user,
  organization,
  signOutAction,
}: {
  user: { name: string | null; email: string | null; image: string | null; isAdmin: boolean };
  organization: { name: string };
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="nav-rail flex h-full w-16 shrink-0 flex-col items-center border-r bg-background">
      <div className="flex h-14 w-full items-center justify-center border-b">
        <Link href="/" className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
          <span className="font-mono text-xs font-bold">R</span>
        </Link>
      </div>

      <div className="flex w-full flex-col items-center gap-1 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={togglePanel}
              aria-label="Toggle chat list"
              className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PanelLeft className="size-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Toggle chat list</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex w-full flex-col items-center gap-1 px-3">
        {PRIMARY.map((item) => (
          <RailButton
            key={item.href}
            {...item}
            variant={item.label === "New chat" ? "primary" : "ghost"}
            active={pathname === item.href}
          />
        ))}
      </div>

      <div className="my-3 h-px w-8 bg-border" />

      <div className="flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-3">
        {SECONDARY.map((item) => (
          <RailButton
            key={item.href}
            {...item}
            active={pathname === item.href || pathname?.startsWith(item.href + "/")}
          />
        ))}
      </div>

      <div className="flex w-full flex-col items-center gap-1 border-t py-3">
        {user.isAdmin && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/admin"
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ShieldCheck className="size-[18px]" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Admin</TooltipContent>
          </Tooltip>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-1 rounded-full transition-opacity hover:opacity-80" aria-label="Account menu">
              <Avatar className="size-8">
                {user.image && <AvatarImage src={user.image} alt={user.name ?? user.email ?? ""} />}
                <AvatarFallback className="text-xs">
                  {(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56">
            <DropdownMenuLabel>
              <div className="font-normal">
                <div className="truncate text-sm">{user.name ?? user.email}</div>
                <div className="truncate text-xs text-muted-foreground">{organization.name}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings/profile">
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings/providers">
                <KeyRound /> Providers
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOutAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full">
                  <LogOut /> Sign out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
