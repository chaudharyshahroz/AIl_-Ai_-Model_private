import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  projectId: z.string().optional(),
  modelId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const archived = url.searchParams.get("archived") === "true";
  const conversations = await db.conversation.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      isArchived: archived,
    },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      isPinned: true,
      isArchived: true,
      lastMessageAt: true,
      lastMessagePreview: true,
      defaultModelId: true,
    },
  });
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = createSchema.parse(await req.json());
  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }
  const conv = await db.conversation.create({
    data: {
      organizationId: membership.organizationId,
      userId: session.user.id,
      title: data.title ?? "New chat",
      projectId: data.projectId,
      defaultModelId: data.modelId,
    },
  });
  return NextResponse.json({ conversation: conv });
}
