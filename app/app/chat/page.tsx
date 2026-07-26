import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatWorkspace } from "@/components/app/chat-workspace";
import { getProviderEnvKey, listConfiguredProviders } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function NewChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  // What providers does this deployment have configured?
  // (admin-managed system keys + system env vars)
  const systemCredProviderIds = (
    await db.providerCredential.findMany({
      where: { scope: "system", revokedAt: null, isValid: true },
      select: { providerId: true },
    })
  ).map((c) => c.providerId);
  const configured = new Set<string>([...listConfiguredProviders(), ...systemCredProviderIds]);

  // Available models for the selector
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
      conversationId={null}
      initialMessages={[]}
      availableModels={available}
      preferredAuto={session.user.preferredAuto ?? true}
      preferredModelId={session.user.preferredModelId ?? null}
      anyProviderConfigured={configured.size > 0}
    />
  );
}
