import { Monitor, Smartphone, Code2, Play } from "lucide-react";

const CODE = [
  { indent: 0, tokens: [["<", "p"], ["section", "t"], [' className="hero"', "a"], [">", "p"]] },
  { indent: 1, tokens: [["<", "p"], ["h1", "t"], [">", "p"], ["Roast Club", "s"], ["</", "p"], ["h1", "t"], [">", "p"]] },
  { indent: 1, tokens: [["<", "p"], ["p", "t"], [">", "p"], ["Fresh beans, monthly.", "s"], ["</", "p"], ["p", "t"], [">", "p"]] },
  { indent: 1, tokens: [["<", "p"], ["Button", "c"], [">", "p"], ["Subscribe", "s"], ["</", "p"], ["Button", "c"], [">", "p"]] },
  { indent: 0, tokens: [["</", "p"], ["section", "t"], [">", "p"]] },
  { indent: 0, tokens: [["<", "p"], ["Grid", "c"], [" items={plans}", "a"], [" />", "p"]] },
];

const TOKEN_COLOR: Record<string, string> = {
  p: "text-muted-foreground/70",
  t: "text-[hsl(var(--provider-xai))]",
  c: "text-[hsl(var(--provider-google))]",
  s: "text-[hsl(var(--success))]",
  a: "text-[hsl(var(--provider-mistral))]",
};

/**
 * The Build surface: a prompt becomes a running app. Left pane streams code,
 * right pane assembles the rendered result in a device frame.
 */
export function BuildDemo() {
  return (
    <div className="elev-float overflow-hidden rounded-2xl border border-border/70 bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-background/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-medium">
          <Code2 className="size-3.5 text-primary" />
          Build
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-card p-0.5">
          <span className="flex items-center gap-1.5 rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background">
            <Monitor className="size-3" /> Web
          </span>
          <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground">
            <Smartphone className="size-3" /> Mobile
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Code pane */}
        <div className="border-b border-border/70 bg-background/40 p-4 md:border-b-0 md:border-r">
          <div className="mb-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-[11px]">
            <span className="text-muted-foreground">Prompt · </span>
            Build a landing page for a coffee subscription
          </div>
          <div className="space-y-1 font-mono text-[10.5px] leading-relaxed">
            {CODE.map((line, i) => (
              <div
                key={i}
                className="demo-line whitespace-nowrap"
                style={
                  {
                    paddingLeft: line.indent * 12,
                    "--demo-delay": `${0.15 + i * 0.22}s`,
                  } as React.CSSProperties
                }
              >
                {line.tokens.map(([text, kind], j) => (
                  <span key={j} className={TOKEN_COLOR[kind]}>
                    {text}
                  </span>
                ))}
              </div>
            ))}
            <div
              className="demo-line flex items-center gap-1.5 pt-1 text-[10px] text-success"
              style={{ "--demo-delay": "1.6s" } as React.CSSProperties}
            >
              <Play className="size-2.5 fill-current" /> Live preview updated
            </div>
          </div>
        </div>

        {/* Preview pane */}
        <div className="relative bg-muted/25 p-5">
          <div className="elev-lift mx-auto max-w-[300px] overflow-hidden rounded-xl border border-border/70 bg-card">
            <div className="flex items-center gap-1 border-b border-border/70 bg-background/70 px-2.5 py-1.5">
              <span className="size-1.5 rounded-full bg-muted-foreground/25" />
              <span className="size-1.5 rounded-full bg-muted-foreground/25" />
              <span className="size-1.5 rounded-full bg-muted-foreground/25" />
            </div>

            <div className="space-y-3 p-4">
              {/* Hero block */}
              <div
                className="demo-build space-y-2 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 p-3.5"
                style={{ "--demo-delay": "0.5s" } as React.CSSProperties}
              >
                <div className="h-2.5 w-24 rounded-full bg-foreground/80" />
                <div className="h-1.5 w-32 rounded-full bg-foreground/25" />
                <div className="mt-2.5 h-5 w-20 rounded-md bg-primary" />
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="demo-build space-y-1.5 rounded-lg border border-border/70 bg-background p-2"
                    style={{ "--demo-delay": `${0.9 + i * 0.14}s` } as React.CSSProperties}
                  >
                    <div className="h-6 rounded bg-muted" />
                    <div className="h-1 w-full rounded-full bg-foreground/20" />
                    <div className="h-1 w-2/3 rounded-full bg-foreground/12" />
                  </div>
                ))}
              </div>

              {/* Footer strip */}
              <div
                className="demo-build flex items-center justify-between rounded-lg border border-border/70 bg-background px-2.5 py-2"
                style={{ "--demo-delay": "1.35s" } as React.CSSProperties}
              >
                <div className="h-1.5 w-14 rounded-full bg-foreground/20" />
                <div className="h-3.5 w-10 rounded bg-foreground/80" />
              </div>
            </div>
          </div>

          {/* Floating mobile frame */}
          <div
            className="demo-float elev-float absolute -bottom-1 right-3 hidden w-20 overflow-hidden rounded-[14px] border-[3px] border-foreground bg-card lg:block"
            style={{ "--demo-delay": "0.6s" } as React.CSSProperties}
          >
            <div className="mx-auto my-1 h-0.5 w-6 rounded-full bg-foreground/30" />
            <div className="space-y-1.5 p-2">
              <div
                className="demo-build h-8 rounded bg-gradient-to-br from-primary/25 to-primary/10"
                style={{ "--demo-delay": "1.5s" } as React.CSSProperties}
              />
              <div
                className="demo-build h-1 w-full rounded-full bg-foreground/20"
                style={{ "--demo-delay": "1.65s" } as React.CSSProperties}
              />
              <div
                className="demo-build h-1 w-3/4 rounded-full bg-foreground/12"
                style={{ "--demo-delay": "1.75s" } as React.CSSProperties}
              />
              <div
                className="demo-build h-3 w-full rounded bg-primary"
                style={{ "--demo-delay": "1.85s" } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
