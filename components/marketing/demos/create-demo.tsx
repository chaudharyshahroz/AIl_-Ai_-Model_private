import { FileText, Presentation, ImageIcon, Table2, Code2, Download } from "lucide-react";

/** Each slide is a miniature of the artifact type Reklu produces. */
const SLIDES = [
  {
    icon: FileText,
    label: "Document",
    export: "DOCX · PDF",
    body: (
      <div className="space-y-2 p-4">
        <div className="h-2 w-2/5 rounded-full bg-foreground/75" />
        <div className="space-y-1.5 pt-1">
          {[100, 92, 96, 70].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-foreground/15" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-2 w-1/3 rounded-full bg-foreground/60 pt-1" />
        <div className="space-y-1.5">
          {[98, 88, 62].map((w, i) => (
            <div key={i} className="h-1.5 rounded-full bg-foreground/15" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Presentation,
    label: "Presentation",
    export: "PPTX · PDF",
    body: (
      <div className="grid h-full grid-cols-2 gap-2 p-4">
        <div className="col-span-2 space-y-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-3">
          <div className="h-2 w-1/2 rounded-full bg-foreground/70" />
          <div className="h-1.5 w-2/3 rounded-full bg-foreground/25" />
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1.5 rounded-lg border border-border/70 p-2">
            <div className="h-1.5 w-3/4 rounded-full bg-foreground/40" />
            <div className="h-1 w-full rounded-full bg-foreground/15" />
            <div className="h-1 w-5/6 rounded-full bg-foreground/15" />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: ImageIcon,
    label: "Image",
    export: "PNG · SVG",
    body: (
      <div className="grid h-full grid-cols-2 gap-2 p-4">
        <div className="rounded-lg bg-gradient-to-br from-[hsl(var(--provider-xai))]/45 to-[hsl(var(--provider-google))]/35" />
        <div className="rounded-lg bg-gradient-to-tr from-primary/45 to-[hsl(var(--provider-mistral))]/35" />
        <div className="rounded-lg bg-gradient-to-br from-[hsl(var(--provider-openai))]/40 to-[hsl(var(--provider-deepseek))]/35" />
        <div className="rounded-lg bg-gradient-to-tl from-[hsl(var(--provider-anthropic))]/45 to-primary/25" />
      </div>
    ),
  },
  {
    icon: Table2,
    label: "Spreadsheet",
    export: "XLSX · CSV",
    body: (
      <div className="p-4">
        <div className="overflow-hidden rounded-lg border border-border/70">
          <div className="flex bg-muted/60">
            {[36, 24, 20, 20].map((w, i) => (
              <div key={i} className="border-r border-border/70 px-2 py-1.5 last:border-r-0" style={{ width: `${w}%` }}>
                <div className="h-1 rounded-full bg-foreground/35" />
              </div>
            ))}
          </div>
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="flex border-t border-border/70">
              {[36, 24, 20, 20].map((w, i) => (
                <div key={i} className="border-r border-border/70 px-2 py-1.5 last:border-r-0" style={{ width: `${w}%` }}>
                  <div
                    className={`h-1 rounded-full ${i === 3 && r < 2 ? "bg-success/60" : "bg-foreground/15"}`}
                    style={{ width: i === 0 ? "85%" : "60%" }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Code2,
    label: "Code",
    export: "Run · Export",
    body: (
      <div className="space-y-1.5 p-4 font-mono text-[10px]">
        {[
          ["export function", "parseCsv", "(input) {"],
          ["  const rows", " = input.", "split('\\n')"],
          ["  return rows.", "map", "(toRecord)"],
          ["}", "", ""],
        ].map((parts, i) => (
          <div key={i} className="whitespace-nowrap">
            <span className="text-[hsl(var(--provider-xai))]">{parts[0]}</span>
            <span className="text-[hsl(var(--provider-google))]">{parts[1]}</span>
            <span className="text-muted-foreground">{parts[2]}</span>
          </div>
        ))}
      </div>
    ),
  },
];

/** Cycles through the artifact types Reklu can produce from a chat. */
export function CreateDemo() {
  return (
    <div className="relative h-[268px]">
      {SLIDES.map((s, i) => (
        <div
          key={s.label}
          className="demo-cycle absolute inset-0"
          style={{ "--demo-delay": `${i * 2}s` } as React.CSSProperties}
        >
          <div className="elev-lift flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="flex items-center justify-between border-b border-border/70 bg-background/60 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-[12px] font-medium">
                <s.icon className="size-3.5 text-primary" />
                {s.label}
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-border/70 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                <Download className="size-2.5" />
                {s.export}
              </span>
            </div>
            <div className="min-h-0 flex-1">{s.body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
