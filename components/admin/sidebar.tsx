"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  Cpu,
  Wrench,
  Activity,
  Heart,
  ScrollText,
  Settings,
  Database,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/providers", label: "API Keys", icon: KeyRound },
  { href: "/admin/models", label: "Models", icon: Cpu },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/usage", label: "Usage", icon: Activity },
  { href: "/admin/health", label: "System health", icon: Heart },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
];

export function AdminSidebar({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-full flex-col border-r bg-amber-500/[0.02]">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="grid size-7 place-items-center rounded-lg bg-amber-500 text-white">
          <ShieldIcon />
        </div>
        <div>
          <div className="text-sm font-semibold">Reklu Admin</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">v0.2</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-amber-500/10 font-medium text-amber-700 dark:text-amber-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="rounded-md bg-muted/50 p-2.5 text-xs">
          <div className="font-medium">{adminName}</div>
          <div className="truncate text-muted-foreground">{adminEmail}</div>
        </div>
      </div>
    </aside>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
