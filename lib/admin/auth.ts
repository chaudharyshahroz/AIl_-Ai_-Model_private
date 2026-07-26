import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Admin access guard.
 * Use from server components, server actions, and route handlers in /admin.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?callbackUrl=/admin");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, isAdmin: true, isSuspended: true, deletedAt: true, name: true, email: true, image: true },
  });
  if (!user || user.deletedAt || user.isSuspended || !user.isAdmin) {
    redirect("/app/chat?denied=admin");
  }
  return user;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const u = await db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  return !!u?.isAdmin;
}
