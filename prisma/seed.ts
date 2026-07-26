/* eslint-disable no-console */
/**
 * Seed script.
 * Run with: pnpm prisma:seed
 *
 * Creates the canonical provider/model catalog (admin-controlled registry),
 * a demo user, and a sample conversation. Safe to run multiple times — uses
 * `upsert` everywhere.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PROVIDER_PRICING } from "../lib/ai/pricing";
import { OPENAI_COMPAT_PROVIDERS } from "../lib/ai/providers";
import type { ModelCapabilities, Modality } from "../lib/ai/types";

const db = new PrismaClient();

const PROVIDERS = [
  { id: "openai", displayName: "OpenAI", websiteUrl: "https://openai.com", apiBaseUrl: "https://api.openai.com/v1" },
  { id: "anthropic", displayName: "Anthropic", websiteUrl: "https://anthropic.com", apiBaseUrl: "https://api.anthropic.com" },
  { id: "google", displayName: "Google AI", websiteUrl: "https://ai.google.dev", apiBaseUrl: "https://generativelanguage.googleapis.com" },
] as const;

type CatalogEntry = {
  providerModelId: string;
  displayName: string;
  family: string;
  capabilities: ModelCapabilities;
  recommendedFor: string[];
  qualityScore: number;
  speedScore: number;
  costScore: number;
};

const CATALOG: Record<string, CatalogEntry[]> = {
  openai: [
    {
      providerModelId: "gpt-4o",
      displayName: "GPT-4o",
      family: "gpt-4o",
      capabilities: {
        contextWindow: 128_000, maxOutputTokens: 16_384,
        inputModalities: ["text", "image"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: true, supportsAudio: false,
        supportsReasoning: false, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: false,
      },
      recommendedFor: ["chat", "tools", "vision"], qualityScore: 90, speedScore: 70, costScore: 60,
    },
    {
      providerModelId: "gpt-4o-mini",
      displayName: "GPT-4o mini",
      family: "gpt-4o",
      capabilities: {
        contextWindow: 128_000, maxOutputTokens: 16_384,
        inputModalities: ["text", "image"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: true, supportsAudio: false,
        supportsReasoning: false, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: false,
      },
      recommendedFor: ["chat", "tools"], qualityScore: 75, speedScore: 90, costScore: 95,
    },
    {
      providerModelId: "o3-mini",
      displayName: "o3-mini",
      family: "o3",
      capabilities: {
        contextWindow: 200_000, maxOutputTokens: 100_000,
        inputModalities: ["text"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: false, supportsAudio: false,
        supportsReasoning: true, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: false,
      },
      recommendedFor: ["reasoning", "code"], qualityScore: 92, speedScore: 60, costScore: 70,
    },
  ],
  anthropic: [
    {
      providerModelId: "claude-sonnet-4-5",
      displayName: "Claude Sonnet 4.5",
      family: "claude-4",
      capabilities: {
        contextWindow: 200_000, maxOutputTokens: 8_192,
        inputModalities: ["text", "image", "pdf"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: true, supportsAudio: false,
        supportsReasoning: true, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: false,
      },
      recommendedFor: ["chat", "code", "reasoning", "writing", "tools"], qualityScore: 95, speedScore: 70, costScore: 70,
    },
    {
      providerModelId: "claude-3-5-sonnet-20241022",
      displayName: "Claude 3.5 Sonnet",
      family: "claude-3.5",
      capabilities: {
        contextWindow: 200_000, maxOutputTokens: 8_192,
        inputModalities: ["text", "image", "pdf"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: true, supportsAudio: false,
        supportsReasoning: false, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: false,
      },
      recommendedFor: ["chat", "code", "writing", "tools"], qualityScore: 88, speedScore: 75, costScore: 65,
    },
    {
      providerModelId: "claude-3-5-haiku-20241022",
      displayName: "Claude 3.5 Haiku",
      family: "claude-3.5",
      capabilities: {
        contextWindow: 200_000, maxOutputTokens: 8_192,
        inputModalities: ["text"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: false, supportsAudio: false,
        supportsReasoning: false, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: false,
      },
      recommendedFor: ["chat"], qualityScore: 70, speedScore: 95, costScore: 95,
    },
  ],
  google: [
    {
      providerModelId: "gemini-2.5-pro",
      displayName: "Gemini 2.5 Pro",
      family: "gemini-2.5",
      capabilities: {
        contextWindow: 2_000_000, maxOutputTokens: 64_000,
        inputModalities: ["text", "image", "audio", "video", "pdf"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: true, supportsAudio: true,
        supportsReasoning: true, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: true,
      },
      recommendedFor: ["long_context", "reasoning", "vision", "research", "tools"], qualityScore: 92, speedScore: 60, costScore: 65,
    },
    {
      providerModelId: "gemini-2.5-flash",
      displayName: "Gemini 2.5 Flash",
      family: "gemini-2.5",
      capabilities: {
        contextWindow: 1_000_000, maxOutputTokens: 64_000,
        inputModalities: ["text", "image", "audio", "video", "pdf"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: true, supportsAudio: true,
        supportsReasoning: true, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: true,
      },
      recommendedFor: ["long_context", "chat", "tools", "research"], qualityScore: 82, speedScore: 90, costScore: 90,
    },
    {
      providerModelId: "gemini-2.0-flash",
      displayName: "Gemini 2.0 Flash",
      family: "gemini-2.0",
      capabilities: {
        contextWindow: 1_000_000, maxOutputTokens: 8_192,
        inputModalities: ["text", "image", "audio", "video", "pdf"] as Modality[], outputModalities: ["text"] as Modality[],
        supportsTools: true, supportsVision: true, supportsAudio: true,
        supportsReasoning: false, supportsStreaming: true, supportsStructuredOutput: true, supportsWebSearch: true,
      },
      recommendedFor: ["chat", "tools", "vision"], qualityScore: 75, speedScore: 95, costScore: 95,
    },
  ],
};

async function main() {
  console.log("→ Seeding provider registry…");
  for (const p of PROVIDERS) {
    await db.modelProvider.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        displayName: p.displayName,
        websiteUrl: p.websiteUrl,
        apiBaseUrl: p.apiBaseUrl,
        isEnabled: true,
        syncStatus: "ok",
        lastSyncedAt: new Date(),
      },
      update: { displayName: p.displayName },
    });

    for (const m of CATALOG[p.id] ?? []) {
      const pricing = PROVIDER_PRICING[p.id]?.[m.providerModelId] ?? { input: 0, output: 0 };
      await db.modelDefinition.upsert({
        where: { providerId_providerModelId: { providerId: p.id, providerModelId: m.providerModelId } },
        create: {
          providerId: p.id,
          providerModelId: m.providerModelId,
          displayName: m.displayName,
          family: m.family,
          contextWindow: m.capabilities.contextWindow,
          maxOutputTokens: m.capabilities.maxOutputTokens,
          inputModalities: JSON.stringify(m.capabilities.inputModalities),
          outputModalities: JSON.stringify(m.capabilities.outputModalities),
          supportsTools: m.capabilities.supportsTools,
          supportsVision: m.capabilities.supportsVision,
          supportsAudio: m.capabilities.supportsAudio,
          supportsReasoning: m.capabilities.supportsReasoning,
          supportsStreaming: m.capabilities.supportsStreaming,
          supportsStructuredOutput: m.capabilities.supportsStructuredOutput,
          supportsWebSearch: m.capabilities.supportsWebSearch,
          priceInputMicrosPer1M: pricing.input,
          priceOutputMicrosPer1M: pricing.output,
          qualityScore: m.qualityScore,
          speedScore: m.speedScore,
          costScore: m.costScore,
          recommendedFor: JSON.stringify(m.recommendedFor),
          status: "active",
          isEnabledForUsers: true,
        },
        update: {
          displayName: m.displayName,
        },
      });
    }
  }

  console.log("→ Seeding demo user…");
  const email = "demo@reklu.app";
  const password = "demopassword";
  const passwordHash = await bcrypt.hash(password, 10);
  let demo = await db.user.findUnique({ where: { email }, include: { memberships: true } });
  if (!demo) {
    const user = await db.user.create({
      data: { email, name: "Demo User", passwordHash, preferredAuto: true, isAdmin: true },
    });
    const org = await db.organization.create({
      data: { name: "Demo workspace", slug: "demo", ownerId: user.id },
    });
    await db.membership.create({
      data: { userId: user.id, organizationId: org.id, role: "owner" },
    });
    demo = await db.user.findUnique({
      where: { id: user.id },
      include: { memberships: true },
    });
  } else {
    demo = await db.user.update({
      where: { id: demo.id },
      data: { passwordHash, name: "Demo User", isAdmin: true },
      include: { memberships: true },
    });
  }
  if (!demo) throw new Error("Failed to provision demo user");
  const orgId = demo.memberships[0]?.organizationId;
  if (!orgId) throw new Error("Failed to provision demo organization");

  console.log("→ Seeding built-in skills…");
  const { BUILT_IN_SKILLS } = await import("../lib/skills/built-in");
  for (const s of BUILT_IN_SKILLS) {
    const skill = await db.skill.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        name: s.name,
        description: s.description,
        category: s.category,
        icon: s.icon,
        status: "active",
        visibility: "public",
        creatorId: demo.id,
      },
      update: { name: s.name, description: s.description, icon: s.icon },
    });
    await db.skillVersion.upsert({
      where: { skillId_version: { skillId: skill.id, version: "1.0.0" } },
      create: {
        skillId: skill.id,
        version: "1.0.0",
        intentRules: JSON.stringify(s.intentRules),
        allowedModels: JSON.stringify(s.allowedModels ?? []),
        systemPrompt: s.systemPrompt,
        examples: JSON.stringify(s.examples),
        inputSchema: JSON.stringify(s.inputExample),
        outputSchema: JSON.stringify({ type: "object" }),
        isCurrent: true,
        changelog: s.changelog ?? "Initial release",
        createdById: demo.id,
      },
      update: { systemPrompt: s.systemPrompt, isCurrent: true },
    });
    // Auto-install for the demo user
    await db.skillInstallation.upsert({
      where: { skillId_userId: { skillId: skill.id, userId: demo.id } },
      create: { skillId: skill.id, userId: demo.id, enabled: true },
      update: {},
    });
  }

  console.log("→ Seeding connector definitions…");
  const CONNECTORS = [
    { id: "google-drive", name: "Google Drive", category: "storage", authType: "oauth2", description: "Read and write files in your Google Drive." },
    { id: "github", name: "GitHub", category: "code", authType: "oauth2", description: "Read issues, PRs, and repo files from GitHub." },
    { id: "slack", name: "Slack", category: "communication", authType: "oauth2", description: "Read channels and send messages (with approval)." },
    { id: "notion", name: "Notion", category: "productivity", authType: "oauth2", description: "Read and write pages and databases in Notion." },
  ];
  for (const c of CONNECTORS) {
    await db.connectorDefinition.upsert({
      where: { id: c.id },
      create: { id: c.id, name: c.name, description: c.description, category: c.category, authType: c.authType, isEnabled: true },
      update: { name: c.name, description: c.description },
    });
  }

  console.log("→ Seeding sample conversation…");
  const existing = await db.conversation.findFirst({
    where: { userId: demo.id, title: "Welcome to Reklu" },
  });
  if (!existing) {
    const conv = await db.conversation.create({
      data: {
        organizationId: orgId,
        userId: demo.id,
        title: "Welcome to Reklu",
        defaultModelId: "claude-sonnet-4-5",
      },
    });
    await db.message.create({
      data: {
        conversationId: conv.id,
        role: "user",
        ordinal: 0,
        content: "Hi! What can I do here?",
      },
    });
    await db.message.create({
      data: {
        conversationId: conv.id,
        role: "assistant",
        ordinal: 1,
        content:
          "Welcome to Reklu. You can chat with leading AI models, switch models mid-conversation, " +
          "let Reklu Auto pick the best model for your request, upload files, and create documents, " +
          "presentations, images, and more. Try asking me to write something, summarize a document, " +
          "or debug some code.",
        modelProviderId: "anthropic",
        modelId: "claude-sonnet-4-5",
        finishReason: "stop",
      },
    });
  }

  console.log(`✓ Seed complete. Demo login: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
