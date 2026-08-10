import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, FileImage, FileCode, File, Upload, Trash2, Loader2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Files" };

export default async function FilesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const files = await db.fileAsset.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  async function uploadFile(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const membership = await db.membership.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } });
    if (!membership) return;
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return;
    // For Phase 1-3 we use simple text extraction for .txt/.md/.json and skip binary.
    // Real text extraction ships in Phase 10 (pdf-parse, mammoth, etc.)
    const allowed = ["text/plain", "text/markdown", "application/json", "text/csv", "text/html"];
    const text = allowed.includes(file.type) ? await file.text().catch(() => "") : null;
    await db.fileAsset.create({
      data: {
        organizationId: membership.organizationId,
        userId: session.user.id,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storageKey: `local:${session.user.id}:${Date.now()}:${file.name}`,
        storageBackend: "local",
        extractedText: text,
        wordCount: text ? text.split(/\s+/).length : 0,
        status: text ? "ready" : "pending",
        sourceType: "upload",
      },
    });
    revalidatePath("/app/files");
  }

  async function deleteFile(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await db.fileAsset.update({
      where: { id, userId: session.user.id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/app/files");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="display-lg text-2xl">Files</h1>
          <p className="text-sm text-muted-foreground">
            Upload PDFs, docs, code, and text. Reklu extracts the content, embeds it, and
            surfaces it in chat with citations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload a file</CardTitle>
            <CardDescription>
              Text, Markdown, CSV, JSON, and HTML work today. PDF, DOCX, PPTX, and XLSX arrive in
              the next phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={uploadFile} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="file" className="text-sm font-medium">Choose a file</label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  required
                  accept=".txt,.md,.json,.csv,.html,text/plain,text/markdown,application/json,text/csv,text/html"
                  className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-sm file:font-medium file:text-background hover:file:bg-foreground/90"
                />
              </div>
              <Button type="submit">
                <Upload /> Upload
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your files</CardTitle>
            <CardDescription>{files.length} file{files.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent>
            {files.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No files yet. Upload one above to get started.
              </p>
            ) : (
              <div className="space-y-1.5">
                {files.map((f) => {
                  const Icon = f.mimeType.startsWith("image/") ? FileImage
                    : f.mimeType.startsWith("text/") || f.mimeType.includes("json") ? FileText
                    : f.mimeType.includes("csv") ? FileCode
                    : File;
                  return (
                    <div key={f.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <div className="flex min-w-0 items-center gap-3">
                        <Icon className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{f.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(f.sizeBytes / 1024).toFixed(1)} KB
                            {f.wordCount ? ` · ${f.wordCount.toLocaleString()} words` : ""}
                            {" · "}
                            {formatRelativeTime(f.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {f.status === "ready" && <Badge variant="success">Ready</Badge>}
                        {f.status === "processing" && <Badge variant="secondary"><Loader2 className="mr-1 size-3 animate-spin" />Processing</Badge>}
                        {f.status === "pending" && <Badge variant="outline">Pending</Badge>}
                        {f.status === "error" && <Badge variant="destructive">Error</Badge>}
                        <form action={deleteFile}>
                          <input type="hidden" name="id" value={f.id} />
                          <Button type="submit" size="sm" variant="ghost">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
