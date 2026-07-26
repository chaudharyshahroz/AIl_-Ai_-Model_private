import { requireAdmin } from "@/lib/admin/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Skills" };

const PLANNED_SKILLS = [
  { category: "Research", items: ["Deep Research", "Web Research", "Source Comparison", "Fact Checker", "Competitor Research", "Market Research", "Academic Research", "Document Research"] },
  { category: "Writing", items: ["Professional Writer", "Email Writer", "Blog Writer", "SEO Writer", "AEO / GEO Writer", "Social Media Writer", "Copywriter", "Proposal Writer", "Report Writer", "Script Writer", "Resume Writer", "Proofreader", "Translator"] },
  { category: "Business", items: ["Business Strategist", "Product Manager", "Startup Analyst", "Marketing Strategist", "Sales Assistant", "Support Assistant", "Meeting Assistant", "Requirements Writer", "Project Planner", "SWOT Analyst"] },
  { category: "Development", items: ["Coding Assistant", "Code Reviewer", "Bug Investigator", "System Design", "API Designer", "Database Designer", "Test Writer", "Documentation Writer", "Security Reviewer", "GitHub Issue Assistant"] },
  { category: "Data", items: ["Data Analyst", "CSV Analyst", "Spreadsheet Builder", "Chart Builder", "SQL Assistant", "KPI Designer", "Forecasting Assistant", "Data Quality Reviewer"] },
  { category: "Creative", items: ["Image Creator", "Brand Designer", "Ad Creative Assistant", "Presentation Designer", "Storyboard Creator", "UI Copywriter"] },
  { category: "File & Office", items: ["Document Creator", "Presentation Creator", "PDF Analyzer", "Spreadsheet Creator", "File Converter", "Meeting Notes Creator"] },
];

export default async function AdminSkillsPage() {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Skills</h1>
        <p className="text-sm text-muted-foreground">
          Phase 4 of the build. Skills are versioned AI workflows — not prompts — that combine
          instructions, model policy, tools, and quality checks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="size-4" /> Coming next
          </CardTitle>
          <CardDescription>
            The full skill engine ships in Phase 4. The catalog below is the planned launch set.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PLANNED_SKILLS.map((cat) => (
            <div key={cat.category}>
              <div className="mb-1.5 text-xs font-medium text-muted-foreground">{cat.category}</div>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((s) => (
                  <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            What you can do today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              <span>Reklu Auto picks the best model for the user's prompt (intent + capability + preference).</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              <span>Use the <Link href="/app/chat" className="text-primary underline-offset-4 hover:underline">chat</Link> with a system prompt prefix to simulate any skill today (e.g. start with "You are a code reviewer…").</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 text-primary" />
              <span>Add skills to the <code className="rounded bg-muted px-1 font-mono text-xs">Skill</code> and <code className="rounded bg-muted px-1 font-mono text-xs">SkillVersion</code> tables (Phase 4 schema) directly via Prisma Studio.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
