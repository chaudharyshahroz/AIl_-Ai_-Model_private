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
  PanelLeft,
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

function toggleAdminSidebar() {
  const collapsed = document.documentElement.classList.toggle("admin-sidebar-collapsed");
  try {
    localStorage.setItem("reklu-admin-sidebar-collapsed", collapsed ? "1" : "0");
  } catch {}
}

export function AdminSidebar({ adminName, adminEmail }: { adminName: string; adminEmail: string }) {
  const pathname = usePathname();
  return (
    <aside className="admin-sidebar flex h-full shrink-0 flex-col overflow-hidden border-r bg-admin/[0.03]">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="grid size-7 shrink-0 place-items-center rounded bg-admin text-admin-foreground">
          <ShieldIcon />
        </div>
        <div className="nav-label min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">Reklu Admin</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">v0.2</div>
        </div>
        <button
          onClick={toggleAdminSidebar}
          aria-label="Toggle sidebar"
          className="nav-label shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <PanelLeft className="size-4" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm transition-colors",
                active
                  ? "bg-admin/10 font-medium text-admin"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {active && <span className="spectrum-edge absolute left-0 top-1 bottom-1 rounded-full" />}
              <item.icon className="size-4 shrink-0" />
              <span className="nav-label truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="nav-label border-t p-3">
        <div className="truncate rounded bg-muted/50 p-2.5 text-xs">
          <div className="truncate font-medium">{adminName}</div>
          <div className="truncate text-muted-foreground">{adminEmail}</div>
        </div>
      </div>
      <button
        onClick={toggleAdminSidebar}
        aria-label="Expand sidebar"
        className="collapsed-only hidden items-center justify-center border-t py-3 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <PanelLeft className="size-4" />
      </button>
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
