"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SpectrumRule } from "@/components/ui/spectrum-rule";
import { ProviderDot } from "@/components/ui/provider-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { cn, formatMicros, formatTokens } from "@/lib/utils";
import {
  ArrowUp,
  Square,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Copy,
  Check,
  Paperclip,
  MessageSquarePlus,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface ModelOption {
  providerId: string;
  modelId: string;
  displayName: string;
  supportsVision: boolean;
  supportsReasoning: boolean;
  supportsTools: boolean;
  contextWindow: number;
}

interface MessageItem {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  modelId?: string | null;
  modelProviderId?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  costMicros?: number;
  finishReason?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface ChatWorkspaceProps {
  conversationId: string | null;
  initialTitle?: string;
  initialMessages: MessageItem[];
  availableModels: ModelOption[];
  preferredAuto: boolean;
  preferredModelId: string | null;
  anyProviderConfigured: boolean;
}

export function ChatWorkspace({
  conversationId,
  initialTitle,
  initialMessages,
  availableModels,
  preferredAuto,
  preferredModelId,
  anyProviderConfigured,
}: ChatWorkspaceProps) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<MessageItem[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [auto, setAuto] = React.useState(preferredAuto);
  const [modelId, setModelId] = React.useState<string | null>(preferredModelId);
  const [preference, setPreference] = React.useState<"auto" | "quality" | "balanced" | "speed" | "cost">("balanced");
  const [currentConversationId, setCurrentConversationId] = React.useState<string | null>(conversationId);
  const [meta, setMeta] = React.useState<{ model: ModelOption; reason: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, meta]);

  const selectedModel = React.useMemo(() => {
    if (auto) return null;
    return availableModels.find((m) => m.modelId === modelId) ?? availableModels[0] ?? null;
  }, [auto, modelId, availableModels]);

  async function send() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    setError(null);
    setMeta(null);

    const optimisticId = `tmp-${Date.now()}`;
    const userMessage: MessageItem = {
      id: optimisticId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantId = `tmp-assistant-${Date.now()}`;
    const assistantMessage: MessageItem = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMessage, assistantMessage]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: text,
          modelId: auto ? undefined : modelId,
          auto,
          preference,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text();
        let errMsg = `Request failed (${res.status})`;
        try {
          const j = JSON.parse(text);
          errMsg = j.error ?? errMsg;
        } catch {
          errMsg = text.slice(0, 200) || errMsg;
        }
        setError(errMsg);
        // Roll back the optimistic assistant message
        setMessages((m) => m.filter((x) => x.id !== assistantId));
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let pendingText = "";
      let pendingUsage: { inputTokens: number; outputTokens: number; cachedInputTokens?: number; costMicros?: number } | null = null;
      let pendingFinish: { reason: string; latencyMs: number; timeToFirstTokenMs?: number } | null = null;
      let serverMessageId: string | null = null;

      function flushText() {
        if (!pendingText) return;
        setMessages((m) =>
          m.map((x) => (x.id === assistantId ? { ...x, content: x.content + pendingText } : x)),
        );
        pendingText = "";
      }

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
          if (!event) continue;
          if (event === "meta") {
            try {
              const m = JSON.parse(data);
              if (m.conversationId && !currentConversationId) {
                setCurrentConversationId(m.conversationId);
                router.replace(`/app/chat/${m.conversationId}`);
              }
              if (m.assistantMessageId) serverMessageId = m.assistantMessageId;
              setMeta({ model: m.model, reason: m.reason });
            } catch {}
          } else if (event === "text") {
            try {
              const p = JSON.parse(data);
              pendingText += p.delta;
            } catch {}
          } else if (event === "usage") {
            try {
              pendingUsage = JSON.parse(data);
              flushText();
            } catch {}
          } else if (event === "finish") {
            try {
              pendingFinish = JSON.parse(data);
              flushText();
            } catch {}
          } else if (event === "error") {
            try {
              const e = JSON.parse(data);
              setError(e.message);
              flushText();
            } catch {}
          } else if (event === "done") {
            flushText();
          }
        }
      }

      // Final: replace optimistic IDs with server IDs
      flushText();
      if (serverMessageId) {
        setMessages((m) =>
          m.map((x) => {
            if (x.id === userMessage.id) return { ...x, id: serverMessageId! };
            if (x.id === assistantId) {
              return {
                ...x,
                id: serverMessageId!,
                ...(pendingUsage
                  ? {
                      inputTokens: pendingUsage.inputTokens,
                      outputTokens: pendingUsage.outputTokens,
                      costMicros: pendingUsage.costMicros ?? 0,
                    }
                  : {}),
                finishReason: pendingFinish?.reason ?? "stop",
              };
            }
            return x;
          }),
        );
      } else if (pendingUsage) {
        setMessages((m) =>
          m.map((x) =>
            x.id === assistantId
              ? {
                  ...x,
                  inputTokens: pendingUsage!.inputTokens,
                  outputTokens: pendingUsage!.outputTokens,
                  costMicros: pendingUsage!.costMicros ?? 0,
                  finishReason: pendingFinish?.reason ?? "stop",
                }
              : x,
          ),
        );
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message);
      }
      setMessages((m) => m.filter((x) => x.id !== assistantId));
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

  function newChat() {
    router.push("/app/chat");
  }

  // ----- Render ------------------------------------------------------------

  if (!anyProviderConfigured) {
    return <NoProvidersEmpty />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={newChat}>
            <MessageSquarePlus className="size-4" />
            New chat
          </Button>
          <h1 className="hidden text-sm font-medium sm:block">
            {initialTitle ?? "New chat"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {meta && (
            <Badge variant="outline" className="gap-1.5">
              <ProviderDot providerId={meta.model.providerId} />
              {meta.model.displayName}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState
            onPick={(text) => {
              setInput(text);
            }}
          />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </AnimatePresence>
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-1.5 pl-10 text-sm text-muted-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto mb-2 max-w-3xl px-4">
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4" />
            <div className="flex-1">
              <p className="font-medium">Couldn't generate a response</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="border-t bg-background/80 p-4 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border bg-muted/30 shadow-sm transition-colors focus-within:border-foreground/30">
            {isStreaming && (
              <div className="spectrum-rule-animated absolute inset-x-0 top-0 h-[2px]" />
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Message Reklu…"
              rows={1}
              disabled={isStreaming}
              className="min-h-[44px] resize-none border-0 bg-transparent px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ height: "auto", maxHeight: "200px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
              }}
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-2">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" disabled title="Attachments (coming soon)">
                  <Paperclip className="size-4" />
                </Button>
                <ModelSelector
                  auto={auto}
                  setAuto={setAuto}
                  modelId={modelId}
                  setModelId={setModelId}
                  models={availableModels}
                />
                {auto && (
                  <PreferenceSelector preference={preference} setPreference={setPreference} />
                )}
              </div>
              <div className="flex items-center gap-1">
                {isStreaming ? (
                  <Button onClick={stop} variant="default" size="icon" aria-label="Stop">
                    <Square className="size-3.5 fill-current" />
                  </Button>
                ) : (
                  <Button
                    onClick={send}
                    disabled={!input.trim()}
                    size="icon"
                    aria-label="Send"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          {meta && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {meta.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelSelector({
  auto,
  setAuto,
  modelId,
  setModelId,
  models,
}: {
  auto: boolean;
  setAuto: (b: boolean) => void;
  modelId: string | null;
  setModelId: (m: string | null) => void;
  models: ModelOption[];
}) {
  const current = models.find((m) => m.modelId === modelId);
  const label = auto ? "Reklu Auto" : current?.displayName ?? "Select model";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Sparkles className="size-3.5" />
          {label}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuItem
          onSelect={() => {
            setAuto(true);
            setModelId(null);
          }}
        >
          <Sparkles className="text-primary" />
          <div>
            <div className="font-medium">Reklu Auto</div>
            <div className="text-xs text-muted-foreground">
              Pick the best model for each request
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Specific model</DropdownMenuLabel>
        {models.length === 0 ? (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            No models available. Configure a provider.
          </div>
        ) : (
          models.map((m) => (
            <DropdownMenuItem
              key={`${m.providerId}/${m.modelId}`}
              onSelect={() => {
                setAuto(false);
                setModelId(m.modelId);
              }}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <ProviderDot providerId={m.providerId} />
                  {m.displayName}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  {m.supportsReasoning && <Badge variant="outline" className="px-1 py-0">R</Badge>}
                  {m.supportsVision && <Badge variant="outline" className="px-1 py-0">V</Badge>}
                  {m.supportsTools && <Badge variant="outline" className="px-1 py-0">T</Badge>}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PreferenceSelector({
  preference,
  setPreference,
}: {
  preference: "auto" | "quality" | "balanced" | "speed" | "cost";
  setPreference: (p: "auto" | "quality" | "balanced" | "speed" | "cost") => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          {preference === "auto" ? "Auto" : preference}
          <ChevronDown className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Preference</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(v) => setPreference(v as typeof preference)}
        >
          <DropdownMenuRadioItem value="balanced">Balanced</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="quality">Quality</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="speed">Speed</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="cost">Cost</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageBubble({ message }: { message: MessageItem }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = React.useState(false);
  const isEmpty = !message.content && isAssistant;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-background">
          <Sparkles className="size-3.5" />
        </div>
      )}
      <div className={cn("min-w-0 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        {isUser ? (
          <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        ) : (
          <div>
            <div className="prose-chat text-foreground">
              {isEmpty ? (
                <span className="text-muted-foreground">Thinking…</span>
              ) : (
                <Markdown text={message.content} />
              )}
            </div>
            {message.errorCode && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4" />
                <div>
                  <p className="font-medium">Generation failed</p>
                  <p className="text-xs">{message.errorMessage ?? message.errorCode}</p>
                </div>
              </div>
            )}
            <MessageMeta message={message} copied={copied} setCopied={setCopied} />
          </div>
        )}
      </div>
      {isUser && (
        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          U
        </div>
      )}
    </motion.div>
  );
}

function MessageMeta({
  message,
  copied,
  setCopied,
}: {
  message: MessageItem;
  copied: boolean;
  setCopied: (b: boolean) => void;
}) {
  const hasUsage = (message.inputTokens ?? 0) > 0 || (message.outputTokens ?? 0) > 0;
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
      {message.modelId && (
        <span className="inline-flex items-center gap-1.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          {message.modelProviderId && <ProviderDot providerId={message.modelProviderId} />}
          {message.modelId}
        </span>
      )}
      {hasUsage && (
        <>
          <span>{formatTokens(message.inputTokens ?? 0)} in</span>
          <span>·</span>
          <span>{formatTokens(message.outputTokens ?? 0)} out</span>
          <span>·</span>
          <span>{formatMicros(message.costMicros ?? 0)}</span>
        </>
      )}
      {message.content && (
        <button
          className="ml-2 inline-flex items-center gap-1 hover:text-foreground"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(message.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {}
          }}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  const suggestions = [
    "Summarize the key trade-offs between Postgres and SQLite for a small SaaS",
    "Write a one-paragraph product brief for an AI search visibility tool",
    "Help me debug a TypeScript error: 'Type X is not assignable to type Y'",
    "Generate a 6-slide outline for a Q3 go-to-market plan",
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-foreground text-background">
          <Sparkles className="size-6" />
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">How can I help today?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a prompt, or let Reklu Auto pick the best model for you.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-lg border bg-card p-4 text-left text-sm transition-colors hover:bg-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function NoProvidersEmpty() {
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-muted">
        <Sparkles className="size-6 text-primary" />
      </div>
      <h2 className="font-display text-xl font-semibold">Add a provider to start chatting</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Reklu uses your key directly — no proxy, no markup. The key is encrypted at rest and never
        sent to your browser.
      </p>
      <Button asChild className="mt-6" size="lg">
        <Link href="/app/settings/providers">
          <KeyRound /> Add a provider key <ArrowRight />
        </Link>
      </Button>
      <p className="mt-6 text-xs text-muted-foreground">
        Or set one in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">.env</code>:
      </p>
      <pre className="mt-2 w-full overflow-x-auto rounded-md border bg-muted/40 p-3 text-left text-xs">
{`OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...`}
      </pre>
      <p className="mt-3 text-xs text-muted-foreground">
        Get a key from{" "}
        <a className="underline" href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">
          OpenAI
        </a>
        ,{" "}
        <a className="underline" href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
          Anthropic
        </a>
        , or{" "}
        <a className="underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
          Google AI Studio
        </a>
        . Free tiers available.
      </p>
    </div>
  );
}

/** Chat markdown rendering: GFM (tables, strikethrough) + syntax-highlighted code blocks. */
function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        pre: (props) => <CodeBlock {...props} />,
        code: ({ className, children, ...rest }) => {
          const isBlock = /language-/.test(className ?? "");
          if (isBlock) {
            return (
              <code className={cn("font-mono", className)} {...rest}>
                {children}
              </code>
            );
          }
          return <code {...rest}>{children}</code>;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function CodeBlock(props: React.ComponentPropsWithoutRef<"pre">) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);
  const child = React.isValidElement<{ className?: string }>(props.children) ? props.children : null;
  const match = /language-(\w+)/.exec(child?.props.className ?? "");
  const lang = match?.[1] ?? "text";

  async function copy() {
    const text = preRef.current?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="font-mono">{lang}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 hover:text-foreground">
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={preRef} className="overflow-x-auto bg-muted/20 p-3 text-sm">
        {props.children}
      </pre>
    </div>
  );
}
