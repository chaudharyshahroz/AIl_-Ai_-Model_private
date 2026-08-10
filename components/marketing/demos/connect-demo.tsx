import { Server, Check, Shield, Plug } from "lucide-react";

const TOOLS = [
  { name: "search_issues", server: "linear-mcp" },
  { name: "create_ticket", server: "linear-mcp" },
  { name: "query_table", server: "postgres-mcp" },
];

/**
 * MCP servers and plugins register their tools; every write still waits for
 * an explicit approval. The approval card is the point of the demo.
 */
export function ConnectDemo() {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
          <span className="flex items-center gap-2 text-[12px] font-medium">
            <Server className="size-3.5 text-primary" />
            Connected servers
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-success">
            <span className="relative flex size-1.5">
              <span className="demo-pulse absolute inline-flex size-full rounded-full bg-success" />
              <span className="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
            2 online
          </span>
        </div>

        <div className="divide-y divide-border/70">
          {TOOLS.map((t, i) => (
            <div
              key={t.name}
              className="demo-line flex items-center gap-3 px-4 py-2.5"
              style={{ "--demo-delay": `${0.2 + i * 0.3}s` } as React.CSSProperties}
            >
              <Plug className="size-3.5 shrink-0 text-muted-foreground" />
              <code className="min-w-0 flex-1 truncate font-mono text-[11px]">{t.name}</code>
              <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
                {t.server}
              </span>
              <Check className="size-3.5 shrink-0 text-success" strokeWidth={3} />
            </div>
          ))}
        </div>
      </div>

      {/* Approval gate */}
      <div
        className="demo-line elev-card rounded-xl border border-primary/25 bg-card p-4"
        style={{ "--demo-delay": "1.25s" } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 text-[11px] font-medium text-primary">
          <Shield className="size-3.5" />
          Approval required
        </div>
        <div className="mt-2.5 rounded-lg border border-border/70 bg-background p-3">
          <code className="font-mono text-[11px]">create_ticket</code>
          <p className="mt-1 text-[11px] text-muted-foreground">
            &ldquo;Fix checkout timeout on mobile Safari&rdquo; → Engineering / P1
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex-1 rounded-md bg-primary py-1.5 text-center text-[11px] font-medium text-primary-foreground">
            Approve
          </span>
          <span className="flex-1 rounded-md border border-border py-1.5 text-center text-[11px] font-medium">
            Deny
          </span>
        </div>
      </div>
    </div>
  );
}
