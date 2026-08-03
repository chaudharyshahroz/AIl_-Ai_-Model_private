"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronsUpDown,
  Sparkles,
  KeyRound,
  Code2,
  ShieldCheck,
  Wrench,
  Plug,
  FileText,
  Server,
  Image as ImageIcon,
} from "lucide-react";

interface ConversationListItem {
  id: string;
  title: string;
  isPinned: boolean;
  lastMessageAt: string;
  lastMessagePreview: string | null;
}

const PRIMARY = [
  { href: "/app/chat", label: "New chat", icon: MessageSquarePlus, exact: false },
  { href: "/app/build", label: "Build", icon: Code2, exact: false },
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

export function Sidebar({
  user,
  organization,
  conversations,
  signOutAction,
}: {
  user: { id: string; name: string | null; email: string | null; image: string | null; isAdmin: boolean };
  organization: { id: string; name: string; slug: string };
  conversations: ConversationListItem[];
  signOutAction: () => Promise<void>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r bg-muted/10">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
          <span className="text-xs font-bold">R</span>
        </div>
        <span className="font-semibold">Reklu</span>
      </div>

      <div className="space-y-1 p-3">
        {PRIMARY.map((item) => {
          const active = pathname === item.href;
          return (
            <Button
              key={item.href}
              asChild
              variant={item.label === "New chat" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
              size="sm"
            >
              <Link href={item.href}>
                <item.icon />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="px-4 pb-1 pt-1 text-xs font-medium text-muted-foreground">Workspace</div>
        <div className="px-3 pb-1.5 space-y-0.5">
          {SECONDARY.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="px-4 pb-2 pt-2 text-xs font-medium text-muted-foreground">Chats</div>
        <ScrollArea className="h-[calc(100%-15rem)] scrollbar-thin">
          <div className="space-y-0.5 px-2 pb-4">
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No chats yet. Start a new one above.
              </p>
            ) : (
              conversations.slice(0, 30).map((c) => {
                const active = pathname === `/app/chat/${c.id}`;
                return (
                  <Link
                    key={c.id}
                    href={`/app/chat/${c.id}`}
                    className={cn(
                      "block rounded-md px-2.5 py-2 text-sm transition-colors",
                      active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                    )}
                  >
                    <div className="truncate font-medium">{c.title}</div>
                    {c.lastMessagePreview && (
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {c.lastMessagePreview}
                      </div>
                    )}
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatRelativeTime(c.lastMessageAt)}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-muted">
              <Avatar className="size-7">
                {user.image && <AvatarImage src={user.image} alt={user.name ?? user.email ?? ""} />}
                <AvatarFallback>{(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user.name ?? user.email}</div>
                <div className="truncate text-xs text-muted-foreground">{organization.name}</div>
              </div>
              <ChevronsUpDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>
              <div className="font-normal">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="truncate">{user.email}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <ShieldCheck /> Admin
                </Link>
              </DropdownMenuItem>
            )}
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
