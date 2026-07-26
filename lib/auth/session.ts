import { auth } from "./index";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Server-side helpers for getting the current user, org, and membership.
 * Use these from server components, server actions, and API routes.
 */

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id, deletedAt: null, isSuspended: false },
    include: {
      memberships: {
        include: { organization: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function getDefaultOrganization(userId: string) {
  const membership = await db.membership.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) return null;
  return membership.organization;
}

export async function requireOrganization() {
  const user = await requireUser();
  const org = await getDefaultOrganization(user.id);
  if (!org) {
    // Auto-create a personal org for new users
    const slugBase = (user.email?.split("@")[0] ?? "user")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .slice(0, 24) || "user";
    let slug = slugBase;
    let n = 0;
    while (await db.organization.findUnique({ where: { slug } })) {
      n += 1;
      slug = `${slugBase}-${n}`;
    }
    const org = await db.organization.create({
      data: {
        name: `${user.name ?? user.email ?? "Personal"} workspace`,
        slug,
        ownerId: user.id,
        memberships: { create: { userId: user.id, role: "owner" } },
      },
    });
    return org;
  }
  return org;
}
