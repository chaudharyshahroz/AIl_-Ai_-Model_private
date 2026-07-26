import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server, CheckCircle2, XCircle, Loader2, Shield, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "MCP" };

export default async function MCPPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const servers = await db.mCPServer.findMany({
    where: { userId: session.user.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });

  async function addServer(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const membership = await db.membership.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "asc" } });
    if (!membership) return;
    const name = String(formData.get("name") ?? "").trim();
    const url = String(formData.get("url") ?? "").trim();
    const transport = String(formData.get("transport") ?? "http") as "http" | "sse";
    if (!name || !url) return;
    await db.mCPServer.create({
      data: {
        userId: session.user.id,
        organizationId: membership.organizationId,
        name,
        url,
        transport,
        authType: "none",
        trustLevel: "community",
        status: "pending",
      },
    });
    revalidatePath("/app/mcp");
  }

  async function testServer(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    const server = await db.mCPServer.findUnique({ where: { id, userId: session.user.id } });
    if (!server) return;
    try {
      // Try to list capabilities via JSON-RPC initialize handshake
      const res = await fetch(server.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "Reklu", version: "0.2.0" },
          },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = res.headers.get("content-type") ?? "";
      let capabilities: unknown = null;
      if (ct.includes("text/event-stream")) {
        const text = await res.text();
        const dataLine = text.split("\n").find((l) => l.startsWith("data: "));
        if (dataLine) capabilities = JSON.parse(dataLine.slice(6));
      } else {
        capabilities = await res.json();
      }
      await db.mCPServer.update({
        where: { id },
        data: {
          status: "connected",
          lastConnectedAt: new Date(),
          lastError: null,
          capabilities: JSON.stringify(capabilities),
        },
      });
    } catch (err) {
      await db.mCPServer.update({
        where: { id },
        data: { status: "error", lastError: (err as Error).message, lastConnectedAt: new Date() },
      });
    }
    revalidatePath("/app/mcp");
  }

  async function removeServer(formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    await db.mCPServer.update({ where: { id, userId: session.user.id }, data: { revokedAt: new Date() } });
    revalidatePath("/app/mcp");
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">MCP servers</h1>
          <p className="text-sm text-muted-foreground">
            Connect Model Context Protocol servers to give Reklu access to your tools. Every tool
            call is approved by you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a server</CardTitle>
            <CardDescription>
              HTTP and SSE transports. For local stdio servers, run the{" "}
              <a href="/docs/mcp-bridge" className="text-primary underline-offset-4 hover:underline">Reklu bridge</a>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addServer} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mcp-name">Name</Label>
                  <Input id="mcp-name" name="name" placeholder="e.g. Internal Tools" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mcp-transport">Transport</Label>
                  <select
                    id="mcp-transport"
                    name="transport"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    defaultValue="http"
                  >
                    <option value="http">HTTP</option>
                    <option value="sse">SSE</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mcp-url">Server URL</Label>
                <Input
                  id="mcp-url"
                  name="url"
                  type="url"
                  placeholder="https://mcp.example.com/sse"
                  required
                />
              </div>
              <Button type="submit">
                <Server /> Add server
              </Button>
            </form>
          </CardContent>
        </Card>

        {servers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No MCP servers connected yet. Add one above.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {servers.map((s) => {
              const caps = s.capabilities && s.capabilities !== "{}" ? (() => {
                try { return JSON.parse(s.capabilities); } catch { return null; }
              })() : null;
              return (
                <Card key={s.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{s.name}</CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">{s.url}</CardDescription>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Badge variant="outline">{s.transport}</Badge>
                          {s.status === "connected" && <Badge variant="success"><CheckCircle2 className="mr-1 size-3" />Connected</Badge>}
                          {s.status === "error" && <Badge variant="destructive"><XCircle className="mr-1 size-3" />Error</Badge>}
                          {s.status === "pending" && <Badge variant="secondary"><Loader2 className="mr-1 size-3 animate-spin" />Pending</Badge>}
                          <span className="text-muted-foreground">
                            {s.lastConnectedAt ? `last tested ${formatRelativeTime(s.lastConnectedAt)}` : "never tested"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <form action={testServer}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" size="sm" variant="outline">Test</Button>
                        </form>
                        <form action={removeServer}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button type="submit" size="sm" variant="ghost">
                            <Trash2 className="size-3.5" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  </CardHeader>
                  {s.lastError && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-destructive">{s.lastError}</p>
                    </CardContent>
                  )}
                  {caps?.result?.capabilities && (
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground">
                        Capabilities:{" "}
                        {Object.keys(caps.result.capabilities).join(", ") || "none declared"}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="size-4" /> How tool calls are approved
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>By default, every MCP tool call requires your approval.</p>
            <p>You can pre-approve read-only tools or specific tools per server. Approval policies
            are per-user, per-server, per-tool. Production deployments can set organization-wide
            policies from the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
