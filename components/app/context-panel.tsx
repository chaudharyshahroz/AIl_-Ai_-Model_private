"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, formatRelativeTime } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationListItem {
  id: string;
  title: string;
  isPinned: boolean;
  lastMessageAt: string;
  lastMessagePreview: string | null;
}

/** The rail's collapsible second track — conversation history. */
export function ContextPanel({ conversations }: { conversations: ConversationListItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-semibold">Chats</span>
      </div>
      <ScrollArea className="flex-1 scrollbar-thin">
        <div className="space-y-0.5 p-2">
          {conversations.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No chats yet. Start a new one from the rail.
            </p>
          ) : (
            conversations.slice(0, 50).map((c) => {
              const active = pathname === `/app/chat/${c.id}`;
              return (
                <Link
                  key={c.id}
                  href={`/app/chat/${c.id}`}
                  className={cn(
                    "relative block rounded px-2.5 py-2 text-sm transition-colors",
                    active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                  )}
                >
                  {active && <span className="spectrum-edge absolute left-0 top-1.5 bottom-1.5 rounded-full" />}
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
  );
}
