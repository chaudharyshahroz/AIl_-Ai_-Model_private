import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="grid h-screen grid-cols-[240px_1fr] bg-background">
      <AdminSidebar adminName={user.name ?? user.email ?? "Admin"} adminEmail={user.email} />
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex h-14 items-center gap-3 border-b bg-amber-500/5 px-6">
          <ShieldCheck className="size-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Admin mode
          </span>
          <span className="text-xs text-muted-foreground">
            You can manage users, providers, models, and system settings.
          </span>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/app/chat"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back to app
            </Link>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
