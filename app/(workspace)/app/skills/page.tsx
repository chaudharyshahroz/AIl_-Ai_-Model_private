import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspacePageShell } from "@/components/app/page-shell";
import {
  Sparkles,
  ArrowRight,
  Wrench,
  Star,
  Microscope,
  PenLine,
  Code2,
  BarChart3,
  Briefcase,
  Palette,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skills" };

/** Lucide icons rather than emoji — emoji render inconsistently across
 *  platforms and read as placeholder next to the rest of the icon set. */
const CATEGORIES = [
  { id: "all", name: "All", icon: Sparkles },
  { id: "research", name: "Research", icon: Microscope },
  { id: "writing", name: "Writing", icon: PenLine },
  { id: "dev", name: "Development", icon: Code2 },
  { id: "data", name: "Data", icon: BarChart3 },
  { id: "business", name: "Business", icon: Briefcase },
  { id: "creative", name: "Creative", icon: Palette },
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
    <WorkspacePageShell
      title="Skills"
      icon={Wrench}
      subtitle="Versioned AI workflows. Each skill combines instructions, model policy, and quality checks — more than prompts."
    >
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = (c.id === "all" && !filterCategory) || c.id === filterCategory;
          return (
            <Link
              key={c.id}
              href={c.id === "all" ? "/app/skills" : `/app/skills?category=${c.id}`}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <c.icon className="size-3.5" />
              {c.name}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border py-14 text-center">
              <span className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-muted">
                <Wrench className="size-5 text-muted-foreground" />
              </span>
              <p className="text-sm font-medium">No skills in this category yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another category, or browse all skills.
              </p>
            </div>
          ) : (
            skills.map((s) => {
              const installed = installedSet.has(s.id);
              const avgRating = s.ratingCount > 0 ? s.ratingSum / s.ratingCount : 0;
              return (
                <Link key={s.id} href={`/app/skills/${s.slug}`} className="group block">
                  <Card className="elev-card-hover flex h-full flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-lg">
                          {s.icon}
                        </span>
                        {installed && (
                          <Badge variant="success" className="text-[10px]">Installed</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{s.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center justify-between border-t border-border/70 pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span>{s._count.runs} runs</span>
                          {s.ratingCount > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="size-3 fill-current text-warning" /> {avgRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
      </div>
    </WorkspacePageShell>
  );
}
