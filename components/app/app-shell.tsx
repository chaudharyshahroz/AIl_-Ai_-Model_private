import { NavRail } from "@/components/app/nav-rail";
import { ContextPanel } from "@/components/app/context-panel";

interface ConversationListItem {
  id: string;
  title: string;
  isPinned: boolean;
  lastMessageAt: string;
  lastMessagePreview: string | null;
}

/**
 * Two-rail dock shell: a fixed icon rail (global nav) + a collapsible context
 * panel (conversation history) + the main content column. The panel's
 * collapsed/expanded width is driven by a CSS class toggled directly on
 * <html> (see NavRail's togglePanel + the pre-paint script in app/layout.tsx)
 * rather than React state, so there's no server/client markup to hydrate
 * around and no flash on load.
 */
export function AppShell({
  user,
  organization,
  conversations,
  signOutAction,
  children,
}: {
  user: { name: string | null; email: string | null; image: string | null; isAdmin: boolean };
  organization: { name: string };
  conversations: ConversationListItem[];
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <NavRail user={user} organization={organization} signOutAction={signOutAction} />
      <div className="context-panel h-full shrink-0 border-r">
        <ContextPanel conversations={conversations} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
