import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query
    ? await db.conversation.findMany({
        where: {
          userId: session.user.id,
          deletedAt: null,
          OR: [
            { title: { contains: query } },
            { lastMessagePreview: { contains: query } },
            { messages: { some: { content: { contains: query } } } },
          ],
        },
        orderBy: { lastMessageAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          lastMessageAt: true,
          lastMessagePreview: true,
        },
      })
    : [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <h1 className="display-lg text-2xl">Search</h1>
          <p className="text-sm text-muted-foreground">Find past conversations and messages.</p>
        </div>
        <form className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search your chats…"
            className="pl-9"
            autoFocus
          />
        </form>
        {!query ? (
          <p className="text-sm text-muted-foreground">Type a query above to search your conversations.</p>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No results for <span className="text-foreground">"{query}"</span>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/app/chat/${r.id}`}
                className="block rounded-md border bg-card px-3 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="text-sm font-medium">{r.title}</div>
                {r.lastMessagePreview && (
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{r.lastMessagePreview}</div>
                )}
                <div className="mt-0.5 text-[10px] text-muted-foreground">{formatRelativeTime(r.lastMessageAt)}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
