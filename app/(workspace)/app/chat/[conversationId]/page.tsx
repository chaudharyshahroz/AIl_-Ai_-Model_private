import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatWorkspace } from "@/components/app/chat-workspace";
import { listConfiguredProviders } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { conversationId } = await params;

  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { ordinal: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          modelId: true,
          modelProviderId: true,
          inputTokens: true,
          outputTokens: true,
          costMicros: true,
          finishReason: true,
          errorCode: true,
          errorMessage: true,
          createdAt: true,
        },
      },
    },
  });
  if (!conv || conv.deletedAt || conv.userId !== session.user.id) notFound();

  const systemCredProviderIds = (
    await db.providerCredential.findMany({
      where: { scope: "system", revokedAt: null, isValid: true },
      select: { providerId: true },
    })
  ).map((c) => c.providerId);
  const configured = new Set<string>([...listConfiguredProviders(), ...systemCredProviderIds]);

  const enabled = await db.modelDefinition.findMany({
    where: { isEnabledForUsers: true, status: "active" },
    orderBy: [{ providerId: "asc" }, { displayName: "asc" }],
  });
  const available = enabled
    .filter((m) => configured.has(m.providerId))
    .map((m) => ({
      providerId: m.providerId,
      modelId: m.providerModelId,
      displayName: m.displayName,
      supportsVision: m.supportsVision,
      supportsReasoning: m.supportsReasoning,
      supportsTools: m.supportsTools,
      contextWindow: m.contextWindow,
    }));

  return (
    <ChatWorkspace
      conversationId={conv.id}
      initialTitle={conv.title}
      initialMessages={conv.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system" | "tool",
        content: m.content,
        modelId: m.modelId,
        modelProviderId: m.modelProviderId,
        inputTokens: m.inputTokens,
        outputTokens: m.outputTokens,
        costMicros: m.costMicros,
        finishReason: m.finishReason,
        errorCode: m.errorCode,
        errorMessage: m.errorMessage,
        createdAt: m.createdAt.toISOString(),
      }))}
      availableModels={available}
      preferredAuto={session.user.preferredAuto ?? true}
      preferredModelId={conv.defaultModelId ?? session.user.preferredModelId ?? null}
      anyProviderConfigured={configured.size > 0}
    />
  );
}
