import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Code, Presentation, Database, Image as ImageIcon, Plus, File } from "lucide-react";
import { formatRelativeTime, truncate } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const metadata = { title: "Artifacts" };

const ARTIFACT_KINDS = [
  { id: "document", name: "Document", icon: FileText, description: "Long-form text, reports, briefs", placeholder: "A product launch brief for the new analytics dashboard" },
  { id: "code", name: "Code", icon: Code, description: "Self-contained code artifacts", placeholder: "A React form component with validation" },
];

export default async function ArtifactsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const artifacts = await db.artifact.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  async function createArtifact(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const membership = await db.membership.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } });
    if (!membership) return;
    const kind = String(formData.get("kind") ?? "document");
    const title = String(formData.get("title") ?? "Untitled").trim() || "Untitled";
    const content = String(formData.get("content") ?? "");
    await db.artifact.create({
      data: {
        organizationId: membership.organizationId,
        userId: session.user.id,
        kind,
        title,
        content,
        metadata: JSON.stringify({ prompt: content }),
      },
    });
    revalidatePath("/app/artifacts");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="display-lg text-2xl">Artifacts</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and export documents, code, and more. Each artifact has version
            history.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ARTIFACT_KINDS.map((k) => (
            <Card key={k.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="grid size-10 place-items-center rounded-lg bg-muted">
                    <k.icon className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle className="text-base">{k.name}</CardTitle>
                <CardDescription>{k.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createArtifact} className="space-y-2">
                  <input type="hidden" name="kind" value={k.id} />
                  <input
                    name="title"
                    placeholder="Title"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  />
                  <textarea
                    name="content"
                    placeholder={k.placeholder}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    <Plus /> Create
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>

        {artifacts.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">Your artifacts</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {artifacts.map((a) => {
                const Icon = a.kind === "code" ? Code : a.kind === "presentation" ? Presentation : a.kind === "image" ? ImageIcon : a.kind === "spreadsheet" ? Database : FileText;
                return (
                  <Link key={a.id} href={`/app/artifacts/${a.id}`}>
                    <Card className="h-full transition-colors hover:border-foreground/30">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Icon className="size-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-[10px]">{a.kind}</Badge>
                        </div>
                        <CardTitle className="text-base">{truncate(a.title, 40)}</CardTitle>
                        {a.content && (
                          <CardDescription className="line-clamp-2">{a.content}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Updated {formatRelativeTime(a.updatedAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
