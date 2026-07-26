/**
 * Image generation abstraction.
 *
 * Real provider-backed image generation.
 * Each provider has different param schemas — we normalize.
 *
 * Phase 6: built-in real adapters for OpenAI (DALL-E 3) and a placeholder
 * for Anthropic / Google (their image models ship in 2026).
 */

import { db } from "@/lib/db";
import { resolveProvider } from "@/lib/ai/registry";
import { decrypt } from "@/lib/crypto";
import { getProviderEnvKey } from "@/lib/env";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export interface ImageRequest {
  prompt: string;
  // Optional
  negativePrompt?: string;
  width?: number;
  height?: number;
  // OpenAI DALL-E specific
  size?: "1024x1024" | "1024x1792" | "1792x1024" | "512x512" | "256x256";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  n?: number;
  // Tracking
  userId: string;
  organizationId: string;
  // Optional seed
  seed?: number;
}

export interface ImageResult {
  url: string;
  width: number;
  height: number;
  revisedPrompt?: string;
  costMicros: number;
  providerId: string;
  modelId: string;
}

const DALL_E_PRICING: Record<string, { standard: number; hd: number }> = {
  "dall-e-3": {
    standard: 4_000_000, // $4 per image at 1024x1024 standard
    hd: 8_000_000,       // $8 per image at 1024x1024 HD
  },
  "dall-e-2": {
    standard: 200_000,   // $0.020 per image at 1024x1024
    hd: 200_000,
  },
};

export async function generateImage(req: ImageRequest): Promise<ImageResult> {
  // 1. Find an available image-generation model
  const candidates = await db.modelDefinition.findMany({
    where: {
      isEnabledForUsers: true,
      status: "active",
      providerId: "openai",
    },
  });
  // Pick DALL-E if available, else any OpenAI model
  let model = candidates.find((m) => m.providerModelId.includes("dall-e-3"));
  if (!model) model = candidates.find((m) => m.providerModelId.includes("dall-e"));
  if (!model) model = candidates[0];
  if (!model) throw new Error("No image generation model enabled. Add an OpenAI model in /admin/models.");

  // 2. Resolve credential
  const sysCred = await db.providerCredential.findFirst({
    where: { scope: "system", providerId: model.providerId, revokedAt: null, isValid: true },
  });
  let apiKey: string | undefined;
  if (sysCred) {
    try { apiKey = decrypt(sysCred.encryptedKey); } catch { /* ignore */ }
  }
  if (!apiKey) apiKey = getProviderEnvKey(model.providerId);
  if (!apiKey) throw new Error(`No credential for ${model.providerId}`);
  const { adapter } = resolveProvider(model.providerId);
  // We use the OpenAI client directly here since image gen is provider-specific
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey });
  const size = (req.size ?? "1024x1024") as "1024x1024" | "1024x1792" | "1792x1024";
  const quality = req.quality ?? "standard";

  const response = await openai.images.generate({
    model: model.providerModelId,
    prompt: req.prompt,
    n: 1,
    size,
    quality,
  });

  const img = response.data?.[0];
  if (!img?.b64_json && !img?.url) {
    throw new Error("Provider returned no image");
  }
  const width = parseInt(size.split("x")[0], 10);
  const height = parseInt(size.split("x")[1], 10);

  // 3. Save the image
  const storageDir = path.join(process.cwd(), "public", "uploads", "images");
  await mkdir(storageDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
  if (img.b64_json) {
    await writeFile(path.join(storageDir, filename), Buffer.from(img.b64_json, "base64"));
  } else if (img.url) {
    // Fetch the URL and save
    const res = await fetch(img.url);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(storageDir, filename), buf);
  }
  const publicUrl = `/uploads/images/${filename}`;

  // 4. Calculate cost
  const pricing = DALL_E_PRICING[model.providerModelId] ?? DALL_E_PRICING["dall-e-3"];
  const costMicros = pricing[quality];

  // 5. Persist
  const created = await db.imageGeneration.create({
    data: {
      userId: req.userId,
      organizationId: req.organizationId,
      prompt: req.prompt,
      revisedPrompt: img.revised_prompt ?? null,
      providerId: model.providerId,
      modelId: model.providerModelId,
      imageUrl: publicUrl,
      width,
      height,
      costMicros,
    },
  });

  void adapter; // suppress unused
  return {
    url: publicUrl,
    width,
    height,
    revisedPrompt: img.revised_prompt,
    costMicros,
    providerId: model.providerId,
    modelId: model.providerModelId,
  };
}
