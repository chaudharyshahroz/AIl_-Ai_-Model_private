import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/app/sidebar";
import { TopBar } from "@/components/app/topbar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  // Provision personal org if missing
  let membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!membership) {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) redirect("/sign-in");
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
    membership = (await db.membership.findFirst({
      where: { userId: user.id, organizationId: org.id },
      include: { organization: true },
    }))!;
  }

  // Recent conversations for the sidebar
  const conversations = await db.conversation.findMany({
    where: { userId: session.user.id, deletedAt: null, isArchived: false },
    orderBy: [{ isPinned: "desc" }, { lastMessageAt: "desc" }],
    take: 50,
    select: {
      id: true,
      title: true,
      isPinned: true,
      lastMessageAt: true,
      lastMessagePreview: true,
    },
  });

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <div className="grid h-screen grid-cols-[280px_1fr] bg-background">
      <Sidebar
        user={{
          id: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
          isAdmin: session.user.isAdmin ?? false,
        }}
        organization={{
          id: membership!.organization.id,
          name: membership!.organization.name,
          slug: membership!.organization.slug,
        }}
        conversations={conversations.map((c) => ({
          ...c,
          lastMessageAt: c.lastMessageAt.toISOString(),
        }))}
        signOutAction={signOutAction}
      />
      <div className="flex h-full flex-col overflow-hidden">
        <TopBar user={{ name: session.user.name ?? null, email: session.user.email ?? null }} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
