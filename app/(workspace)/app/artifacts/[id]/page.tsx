import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { revalidatePath } from "next/cache";
import { Save, FileText, Code, Download, History } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { id } = await params;
  const artifact = await db.artifact.findUnique({
    where: { id, userId: session.user.id },
    include: { versions: { orderBy: { version: "desc" }, take: 10 } },
  });
  if (!artifact || artifact.deletedAt) notFound();

  async function save(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const content = String(formData.get("content") ?? "");
    const newVersion = artifact!.currentVersion + 1;
    await db.$transaction([
      db.artifactVersion.create({
        data: {
          artifactId: artifact!.id,
          version: artifact!.currentVersion,
          content: artifact!.content,
          metadata: artifact!.metadata,
          createdById: session.user.id,
        },
      }),
      db.artifact.update({
        where: { id: artifact!.id },
        data: { content, currentVersion: newVersion, updatedAt: new Date() },
      }),
    ]);
    revalidatePath(`/app/artifacts/${artifact!.id}`);
  }

  const Icon = artifact.kind === "code" ? Code : FileText;
  const filename = `${artifact.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${artifact.kind === "code" ? "txt" : "md"}`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="size-5 text-muted-foreground" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{artifact.title}</h1>
              <p className="text-xs text-muted-foreground">
                v{artifact.currentVersion} · updated {formatRelativeTime(artifact.updatedAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <form>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(artifact.content)}`}
                download={filename}
                className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm hover:bg-accent"
              >
                <Download className="size-3.5" /> Export
              </a>
            </form>
          </div>
        </div>

        <form action={save} className="space-y-3">
          <Textarea
            name="content"
            defaultValue={artifact.content}
            rows={20}
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button type="submit">
              <Save /> Save (v{artifact.currentVersion + 1})
            </Button>
          </div>
        </form>

        {artifact.versions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="size-4" /> Version history
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {artifact.versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div>
                      <span className="font-mono">v{v.version}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {formatRelativeTime(v.createdAt)}
                      </span>
                    </div>
                    <span className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                      {v.content.slice(0, 80)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
