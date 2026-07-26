import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowLeft, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { listConfiguredProviders } from "@/lib/env";
import { runSkill } from "@/lib/skills/engine";
import { formatLatency, formatMicros, formatTokens } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SkillDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ input?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { slug } = await params;
  const { input: presetInput } = await searchParams;

  const skill = await db.skill.findUnique({
    where: { slug },
    include: {
      versions: { where: { isCurrent: true }, take: 1 },
      _count: { select: { runs: true } },
    },
  });
  if (!skill) notFound();
  const version = skill.versions[0];
  if (!version) notFound();

  const installation = await db.skillInstallation.findUnique({
    where: { skillId_userId: { skillId: skill.id, userId: session.user.id } },
  });
  const examples = JSON.parse(version.examples) as Array<{ title: string; input: string }>;
  const sysCredProviderIds = (await db.providerCredential.findMany({ where: { scope: "system", revokedAt: null, isValid: true }, select: { providerId: true } })).map((c) => c.providerId);
  const anyProvider = listConfiguredProviders().length > 0 || sysCredProviderIds.length > 0;

  // Run history
  const recentRuns = await db.skillRun.findMany({
    where: { userId: session.user.id, skillId: skill.id },
    orderBy: { startedAt: "desc" },
    take: 5,
  });

  async function toggleInstall() {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    if (installation) {
      await db.skillInstallation.delete({
        where: { skillId_userId: { skillId: skill!.id, userId: session.user.id } },
      });
    } else {
      await db.skillInstallation.create({
        data: { skillId: skill!.id, userId: session.user.id, enabled: true },
      });
    }
    revalidatePath(`/app/skills/${slug}`);
  }

  async function runFromForm(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const membership = await db.membership.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } });
    if (!membership) return;
    const input = String(formData.get("input") ?? "");
    if (!input.trim()) return;
    try {
      await runSkill({
        skillSlug: slug,
        userId: session.user.id,
        organizationId: membership.organizationId,
        input,
      });
    } catch (err) {
      console.error("Skill run failed:", err);
    }
    revalidatePath(`/app/skills/${slug}`);
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <Link href="/app/skills" className="text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 inline size-3" /> All skills
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{skill.icon}</div>
                <div>
                  <CardTitle className="text-2xl">{skill.name}</CardTitle>
                  <CardDescription className="mt-1.5">{skill.description}</CardDescription>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{skill.category}</Badge>
                    <span>· v{version.version}</span>
                    <span>· {skill._count.runs} runs</span>
                  </div>
                </div>
              </div>
              <form action={toggleInstall}>
                <Button type="submit" variant={installation ? "outline" : "default"} size="sm">
                  {installation ? (
                    <>
                      <CheckCircle2 /> Installed
                    </>
                  ) : (
                    <>
                      <Sparkles /> Install
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardHeader>
        </Card>

        {!anyProvider && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4 text-sm">
              <p className="font-medium">No AI provider configured</p>
              <p className="mt-1 text-xs text-muted-foreground">
                An admin needs to add a provider key in the admin dashboard before you can run skills.
              </p>
            </CardContent>
          </Card>
        )}

        {examples.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Example inputs</CardTitle>
              <CardDescription>Click one to load it into the runner below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {examples.map((ex, i) => (
                <Link
                  key={i}
                  href={`/app/skills/${slug}?input=${encodeURIComponent(ex.input)}`}
                  className="block rounded-md border bg-card p-3 text-sm transition-colors hover:bg-accent"
                >
                  <div className="font-medium">{ex.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ex.input}</div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Run this skill</CardTitle>
            <CardDescription>Enter your input and Reklu will run the workflow.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={runFromForm} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="input">Input</Label>
                <Textarea
                  id="input"
                  name="input"
                  defaultValue={presetInput ?? ""}
                  placeholder={`Example: ${examples[0]?.input ?? "What should the skill do?"}`}
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" disabled={!anyProvider}>
                <Play /> Run skill
              </Button>
            </form>
          </CardContent>
        </Card>

        {recentRuns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {recentRuns.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      {r.status === "ok" && <CheckCircle2 className="size-3.5 text-success" />}
                      {r.status === "error" && <XCircle className="size-3.5 text-destructive" />}
                      {r.status === "running" && <Loader2 className="size-3.5 animate-spin" />}
                      <span className="truncate text-xs">
                        {(JSON.parse(r.input) as { input?: string }).input?.slice(0, 60) ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {r.durationMs && <span>{formatLatency(r.durationMs)}</span>}
                      {r.inputTokens > 0 && <span>{formatTokens(r.inputTokens + r.outputTokens)} tok</span>}
                      {r.costMicros > 0 && <span>{formatMicros(r.costMicros)}</span>}
                    </div>
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
