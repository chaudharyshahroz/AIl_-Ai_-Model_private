# Reklu Rebuild Audit

**Date:** 2026-07-26
**Project:** Reklu v0.2 — "Every leading AI model. One connected workspace."
**Scope of this session:** Phase 1-3 (foundation + working multi-model chat)

---

## 1. Starting state

The new build lives in a previously empty folder (`/Users/chaudharyshahroz/Documents/Reklu Ai model Chat`). Three other Reklu iterations exist on this machine:

| Folder | State | Verdict |
|---|---|---|
| `Reklu AI Business Workspace` | Old "Business OS" Next.js 14 app, prisma + auth, ~30 source files | **Archived separately, NOT carried forward** |
| `Reklu AI Compny Empoly` | Variant of the above | Not touched |
| `Reklu AI SAAS ALL MODLES` | Largest existing build, Next.js 14 + Prisma + BullMQ workers | **Archived separately, NOT carried forward** |
| `Reklu Ai model Chat` | Empty at session start | **New home for v0.2** |

**Decision (per user):** Build fresh in the empty folder. The old "Business OS" is the product being explicitly retired. No code, no users, no billing history carried over. This is intentional.

## 2. What was preserved

Nothing from the old codebase is reused. The new build:

- Uses a **new** `prisma/schema.prisma` designed for the new product model (AI-chat-first, not business-OS).
- Uses **NextAuth v5** (the old projects used v4 or hand-rolled auth).
- Uses **Next.js 15 + React 19 RC** for the App Router and the new `params: Promise<{...}>` shape.
- Uses **direct provider SDKs** (`openai`, `@anthropic-ai/sdk`, `@google/generative-ai`) — **not** OpenRouter, per spec rule #2.
- Uses **shadcn-style** primitives (Radix + Tailwind), not the old custom component library.

## 3. What was removed

The old Reklu product's "Business OS" framing is gone. Specifically:

- No "Business Planner", "Founder Mode", "Strategic Command Center" pages.
- No "AI Model Hub" as a product module.
- No business-planning workflows, prompts, or sample businesses.
- No old onboarding flow.
- No country-specific positioning (the new product is global).
- No old API endpoints.
- No old database tables.

## 4. Database migration risks

None — the new build is a clean slate. The old databases are not migrated because (a) the user opted for a fresh build and (b) the schema is fundamentally different (chat-first vs. business-OS).

## 5. Required environment variables

See `.env.example`. The minimum for a running app:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<32-byte base64>"
ENCRYPTION_KEY="<32-byte base64>"
```

Plus at least one of:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

If no provider key is set, the chat UI shows a clear "no providers configured" state — **no fake responses**.

## 6. Deployment impact

- Old deployments: untouched. They continue to run on whatever they were running on.
- New deployment: this folder is the new canonical home. Deploy via Dokploy using the Dockerfile + docker-compose.yml in this repo.

## 7. Future migration path

When the new Reklu is live, point the old DNS records at it. Old user accounts can be migrated later via a one-time import script (not part of Phase 1-3).

---

## Appendix A — What is in this session's deliverable

### In scope (Phase 1-3)
- Monorepo-ready folder structure (single Next.js app, liftable into a monorepo)
- Prisma schema covering all foundation models (User, Org, Membership, Project, Conversation, Message, MessagePart, ModelProvider, ModelDefinition, ProviderCredential, PricingRule, UsageEvent, CreditLedgerEntry, Subscription, AuditLog, Notification, ApiKey)
- NextAuth v5 with credentials + Google OAuth
- Organization + membership model
- Design system: tokens, shadcn-style components, light + dark
- Provider adapters for OpenAI, Anthropic, Google Gemini (streaming, normalized)
- Model registry with admin-controlled enable/disable
- Streaming chat endpoint (SSE)
- Conversation persistence, sidebar, model selector
- Reklu Auto (intent + capability-based model selection, with transparent "why this model" explanation)
- Usage tracking per message + per conversation
- Marketing site: home, /features, /pricing, /models, /sign-in, /sign-up
- Settings stub: /app/settings/profile

### Out of scope (deferred to later phases)
- Skills (Phase 4)
- Connectors + MCP (Phase 5)
- Artifacts (Phase 6)
- Agents + multi-step runs (Phase 7)
- Stripe billing UI (Phase 8)
- Admin dashboard (Phase 8)
- Test suite (Phase 10) — basic unit + e2e tests will be added in a follow-up session

The unused-phase routes are **not** included in the navigation. The spec rule "Every visible button must work" applies to everything that IS in the sidebar.
