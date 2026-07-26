import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orchestrate, type ChatContext } from "@/lib/ai/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bodySchema = z.object({
  conversationId: z.string().min(1).optional(),
  message: z.string().min(1).max(200_000),
  modelId: z.string().optional(),
  auto: z.boolean().optional(),
  preference: z.enum(["auto", "quality", "balanced", "speed", "cost"]).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().int().min(1).max(100_000).optional(),
  mode: z.enum(["chat", "build"]).optional(),
  attachments: z
    .array(
      z.object({
        type: z.literal("image"),
        url: z.string().url(),
        mimeType: z.string().min(1),
      }),
    )
    .optional(),
  // Title generation happens separately; not part of the chat stream body
});

/**
 * POST /api/chat/stream
 *
 * Body: { conversationId?, message, modelId?, auto?, preference?, ... }
 *
 * Returns: Server-Sent Events stream with `text`, `usage`, `finish`, `error`,
 * and `meta` (model + reason) events. The final event is always `done`.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid body", details: (err as Error).message },
      { status: 400 },
    );
  }

  // Resolve the user's default org
  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  // Create the conversation if needed
  let conversationId = body.conversationId;
  if (!conversationId) {
    const title = body.message.slice(0, 60) || "New chat";
    const conv = await db.conversation.create({
      data: {
        organizationId: membership.organizationId,
        userId: session.user.id,
        title,
        lastMessagePreview: body.message.slice(0, 200),
      },
    });
    conversationId = conv.id;
  }

  const ctx: ChatContext = {
    userId: session.user.id,
    organizationId: membership.organizationId,
    conversationId,
    userMessage: body.message,
    modelId: body.modelId,
    auto: body.auto,
    preference: body.preference,
    temperature: body.temperature,
    maxOutputTokens: body.maxOutputTokens,
    mode: body.mode,
    attachments: body.attachments,
    abortSignal: req.signal,
  };

  let result;
  try {
    result = await orchestrate(ctx);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }

  // Build the SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Meta event first (model + reason)
        controller.enqueue(
          encoder.encode(
            `event: meta\ndata: ${JSON.stringify({
              conversationId,
              assistantMessageId: result.assistantMessageId,
              model: { providerId: result.model.providerId, modelId: result.model.providerModelId, displayName: result.model.displayName },
              reason: result.reason,
            })}\n\n`,
          ),
        );
        for await (const ev of result.stream) {
          controller.enqueue(encoder.encode(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`));
        }
        controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ code: "stream_failed", message: (err as Error).message })}\n\n`,
          ),
        );
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
