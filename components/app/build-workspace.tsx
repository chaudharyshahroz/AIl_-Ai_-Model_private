"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, truncate } from "@/lib/utils";
import {
  ArrowUp,
  Square,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Code2,
  Eye,
  Download,
  RotateCcw,
  KeyRound,
  MessageSquarePlus,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface ModelOption {
  providerId: string;
  modelId: string;
  displayName: string;
  supportsVision: boolean;
  supportsReasoning: boolean;
  supportsTools: boolean;
  contextWindow: number;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  html?: string;
}

export function BuildWorkspace({
  availableModels,
  anyProviderConfigured,
  recentConversations,
}: {
  availableModels: ModelOption[];
  anyProviderConfigured: boolean;
  recentConversations: Array<{ id: string; title: string; lastMessageAt: string; lastMessagePreview: string | null }>;
}) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [modelId, setModelId] = React.useState<string | null>(availableModels[0]?.modelId ?? null);
  const [error, setError] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"preview" | "code">("preview");
  const [previewKey, setPreviewKey] = React.useState(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const currentHtml = React.useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].html) return messages[i].html!;
    }
    return null;
  }, [messages]);

  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedModel = availableModels.find((m) => m.modelId === modelId);

  async function send() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);

    // Optimistic assistant message that fills in as it streams
    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages((m) => [...m, assistantMsg]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: text,
          modelId,
          auto: false,
          mode: "build",
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const t = await res.text();
        let errMsg = `Request failed (${res.status})`;
        try { errMsg = JSON.parse(t).error ?? errMsg; } catch {}
        setError(errMsg);
        setMessages((m) => m.slice(0, -1));
        setIsStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const raw = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const lines = raw.split("\n");
          let event = "";
          let data = "";
          for (const ln of lines) {
            if (ln.startsWith("event: ")) event = ln.slice(7).trim();
            else if (ln.startsWith("data: ")) data += ln.slice(6);
          }
          if (event === "meta") {
            try {
              const m = JSON.parse(data);
              if (m.conversationId && !conversationId) {
                setConversationId(m.conversationId);
                router.replace(`/app/build?c=${m.conversationId}`);
              }
            } catch {}
          } else if (event === "text") {
            try {
              const p = JSON.parse(data);
              accumulated += p.delta;
              setMessages((m) => {
                const next = [...m];
                next[next.length - 1] = { ...next[next.length - 1], content: accumulated };
                return next;
              });
            } catch {}
          } else if (event === "error") {
            try {
              const e = JSON.parse(data);
              setError(e.message);
            } catch {}
          }
        }
      }
      // Extract the HTML artifact from the accumulated text
      const html = extractHtml(accumulated);
      if (html) {
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { ...next[next.length - 1], html };
          return next;
        });
        setPreviewKey((k) => k + 1);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
      setMessages((m) => m.slice(0, -1));
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function downloadHtml() {
    if (!currentHtml) return;
    const blob = new Blob([currentHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = `reklu-build-${Date.now()}.html`;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!anyProviderConfigured) {
    return (
      <div className="grid h-full place-items-center">
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-muted">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Add a provider to start building</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Build uses your admin-configured provider keys. An admin needs to add at least one in
            the admin dashboard.
          </p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/app/settings/providers">
              <KeyRound /> Open providers <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-[1fr_1fr] overflow-hidden">
      {/* Left: chat */}
      <div className="flex h-full flex-col border-r">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-muted-foreground" />
            <h1 className="text-sm font-medium">Build</h1>
            {selectedModel && (
              <Badge variant="outline" className="text-[10px]">{selectedModel.displayName}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([]);
              setConversationId(null);
              setError(null);
            }}
          >
            <MessageSquarePlus className="size-4" /> New
          </Button>
        </div>

        <div ref={chatScrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="mx-auto max-w-md px-6 py-12 text-center">
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-foreground text-background">
                <Code2 className="size-6" />
              </div>
              <h2 className="text-xl font-semibold">What do you want to build?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Describe a website, landing page, or app screen. Reklu generates a complete,
                self-contained HTML file you can preview, iterate on, and export.
              </p>
              <div className="mt-6 space-y-1.5 text-left">
                {[
                  "A portfolio site for a wedding photographer",
                  "A pricing page for a SaaS product with monthly/yearly toggle",
                  "A dashboard for tracking personal expenses",
                  "A landing page for an AI writing tool",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="block w-full rounded-lg border bg-card p-3 text-left text-sm transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4 p-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      m.role === "user" ? "bg-muted" : "bg-card border",
                    )}
                  >
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <>
                        {m.html && (
                          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-success">
                            <Sparkles className="size-3" /> Built · {m.html.length.toLocaleString()} chars
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-muted-foreground">
                          {m.content || (m.html ? "Preview ready →" : isStreaming ? "Building…" : "")}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">
            <AlertCircle className="mr-1.5 inline size-3.5" /> {error}
          </div>
        )}

        <div className="border-t bg-background/80 p-3 backdrop-blur">
          <div className="rounded-2xl border bg-muted/30 shadow-sm">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder='Try: "Build a pricing page for an AI tool"'
              rows={1}
              disabled={isStreaming}
              className="min-h-[40px] resize-none border-0 bg-transparent px-3 py-2 focus-visible:ring-0"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
              }}
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <ModelSelector
                modelId={modelId}
                setModelId={setModelId}
                models={availableModels}
              />
              <div className="flex items-center gap-1">
                {isStreaming && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" /> Building
                  </span>
                )}
                {isStreaming ? (
                  <Button onClick={stop} variant="default" size="icon" aria-label="Stop">
                    <Square className="size-3 fill-current" />
                  </Button>
                ) : (
                  <Button onClick={send} disabled={!input.trim()} size="icon" aria-label="Send">
                    <ArrowUp className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: preview / code */}
      <div className="flex h-full flex-col bg-muted/20">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5 text-xs">
            <button
              onClick={() => setView("preview")}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1",
                view === "preview" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye className="size-3" /> Preview
            </button>
            <button
              onClick={() => setView("code")}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1",
                view === "code" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Code2 className="size-3" /> Code
            </button>
          </div>
          <div className="flex items-center gap-1">
            {currentHtml && (
              <>
                <Button size="sm" variant="ghost" onClick={() => setPreviewKey((k) => k + 1)} title="Refresh preview">
                  <RotateCcw className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadHtml} title="Download HTML">
                  <Download className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {currentHtml ? (
            view === "preview" ? (
              <iframe
                ref={iframeRef}
                key={previewKey}
                srcDoc={currentHtml}
                className="h-full w-full bg-white"
                title="Build preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            ) : (
              <pre className="h-full overflow-auto bg-zinc-950 p-4 font-mono text-xs text-zinc-100">
                <code>{currentHtml}</code>
              </pre>
            )
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div className="max-w-xs px-4">
                <Eye className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Your preview will appear here. Start with a prompt on the left.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelSelector({
  modelId,
  setModelId,
  models,
}: {
  modelId: string | null;
  setModelId: (m: string | null) => void;
  models: ModelOption[];
}) {
  const current = models.find((m) => m.modelId === modelId);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          <Sparkles className="size-3" />
          {current?.displayName ?? "Select model"}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {models.map((m) => (
          <DropdownMenuItem
            key={`${m.providerId}/${m.modelId}`}
            onSelect={() => setModelId(m.modelId)}
          >
            {m.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function extractHtml(text: string): string | null {
  const fence = /```(?:html|HTML)?\s*\n([\s\S]*?)```/.exec(text);
  if (fence) return fence[1].trim();
  const htmlStart = text.search(/<!doctype html|<html[\s>]/i);
  if (htmlStart >= 0) {
    const end = text.lastIndexOf("</html>");
    if (end > 0) return text.slice(htmlStart, end + 7).trim();
    return text.slice(htmlStart).trim();
  }
  return null;
}
