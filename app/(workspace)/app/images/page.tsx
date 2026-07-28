import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { generateImage } from "@/lib/ai/image";
import { formatMicros, formatRelativeTime } from "@/lib/utils";
import { Sparkles, Image as ImageIcon, AlertCircle } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata = { title: "Images" };

export default async function ImagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const images = await db.imageGeneration.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  // Check if any image model is enabled
  const imageModel = await db.modelDefinition.findFirst({
    where: {
      isEnabledForUsers: true,
      status: "active",
      providerId: "openai",
    },
  });

  async function generate(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const membership = await db.membership.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } });
    if (!membership) return;
    const prompt = String(formData.get("prompt") ?? "").trim();
    if (!prompt) return;
    const size = String(formData.get("size") ?? "1024x1024") as "1024x1024" | "1024x1792" | "1792x1024";
    const quality = String(formData.get("quality") ?? "standard") as "standard" | "hd";
    try {
      await generateImage({
        prompt,
        size,
        quality,
        userId: session.user.id,
        organizationId: membership.organizationId,
      });
    } catch (err) {
      console.error("Image gen failed:", err);
    }
    revalidatePath("/app/images");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
          <p className="text-sm text-muted-foreground">
            Generate images with DALL-E 3. More providers ship in Phase 6.
          </p>
        </div>

        {!imageModel ? (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <AlertCircle className="mt-0.5 size-4 text-warning" />
              <div>
                <p className="font-medium">No image model enabled</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  An admin needs to enable an OpenAI model in the admin dashboard. We use DALL-E
                  3 for image generation.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generate</CardTitle>
              <CardDescription>Describe what you want. Be specific.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={generate} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Input
                    id="prompt"
                    name="prompt"
                    placeholder="A serene mountain lake at sunset, cinematic, photorealistic"
                    required
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size</Label>
                    <select
                      id="size"
                      name="size"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      defaultValue="1024x1024"
                    >
                      <option value="1024x1024">Square (1024×1024)</option>
                      <option value="1024x1792">Portrait (1024×1792)</option>
                      <option value="1792x1024">Landscape (1792×1024)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <select
                      id="quality"
                      name="quality"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      defaultValue="standard"
                    >
                      <option value="standard">Standard — $4 / image</option>
                      <option value="hd">HD — $8 / image</option>
                    </select>
                  </div>
                </div>
                <Button type="submit">
                  <Sparkles /> Generate
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {images.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Your generations</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <Card key={img.id} className="overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={img.imageUrl}
                      alt={img.prompt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="line-clamp-2 text-xs">{img.prompt}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {img.width}×{img.height} · {formatMicros(img.costMicros)} ·{" "}
                      {formatRelativeTime(img.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
