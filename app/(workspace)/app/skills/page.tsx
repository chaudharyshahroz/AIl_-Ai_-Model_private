import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Wrench, Star } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skills" };

const CATEGORIES = [
  { id: "all", name: "All", icon: Sparkles },
  { id: "research", name: "Research", icon: "🔬" },
  { id: "writing", name: "Writing", icon: "✍️" },
  { id: "dev", name: "Development", icon: "💻" },
  { id: "data", name: "Data", icon: "📊" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "creative", name: "Creative", icon: "🎨" },
];

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { category } = await searchParams;
  const filterCategory = category && category !== "all" ? category : null;

  const skills = await db.skill.findMany({
    where: {
      status: "active",
      ...(filterCategory ? { category: filterCategory } : {}),
    },
    orderBy: { usageCount: "desc" },
    include: {
      _count: { select: { runs: true } },
    },
  });

  const installations = await db.skillInstallation.findMany({
    where: { userId: session.user.id },
    select: { skillId: true },
  });
  const installedSet = new Set(installations.map((i) => i.skillId));

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
          <p className="text-sm text-muted-foreground">
            Versioned AI workflows. Each skill combines instructions, model policy, and quality
            checks. More than prompts.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const active = (c.id === "all" && !filterCategory) || c.id === filterCategory;
            const isString = typeof c.icon === "string";
            return (
              <Link
                key={c.id}
                href={c.id === "all" ? "/app/skills" : `/app/skills?category=${c.id}`}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {isString ? <span>{c.icon as string}</span> : (() => { const Icon = c.icon as React.ComponentType<{className?: string}>; return <Icon className="size-3" />; })()}
                {c.name}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
              No skills in this category yet.
            </p>
          ) : (
            skills.map((s) => {
              const installed = installedSet.has(s.id);
              const avgRating = s.ratingCount > 0 ? s.ratingSum / s.ratingCount : 0;
              return (
                <Link
                  key={s.id}
                  href={`/app/skills/${s.slug}`}
                  className="group block"
                >
                  <Card className="h-full transition-colors group-hover:border-foreground/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-2xl">{s.icon}</div>
                        {installed && (
                          <Badge variant="success" className="text-[10px]">Installed</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{s.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span>{s._count.runs} runs</span>
                          {s.ratingCount > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="size-3 fill-current text-warning" /> {avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
