# Reklu

> **Every leading AI model. One connected workspace.**

Reklu is a chat-first AI workspace. Chat with GPT, Claude, Gemini, and other leading models. Connect your apps and data, use specialized AI skills, and create documents, presentations, images, spreadsheets, and code — all from one intelligent chat interface.

This repository contains the **Phase 1-3 build** of Reklu:

- ✅ Phase 1: Foundation (monorepo-ready folder structure, audit, design system)
- ✅ Phase 2: Platform (Prisma, auth, organizations, encryption, observability hooks)
- ✅ Phase 3: Multi-model chat (direct provider integrations, streaming, Reklu Auto, usage tracking)
- ⏳ Phases 4-10: Skills, connectors, MCP, artifacts, agents, billing, admin, marketing follow-ups, tests

## Quick start

### 1. Install

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set at least one provider key in `.env`:

```bash
# Required for chat
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

Other required values (defaults are pre-filled in `.env.example`):

- `DATABASE_URL` — defaults to `file:./dev.db` (SQLite)
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `ENCRYPTION_KEY` — generate with `openssl rand -base64 32`

### 3. Initialize the database

```bash
pnpm prisma:push
pnpm prisma:seed
```

The seed creates a demo user (`demo@reklu.app` / `demopassword`), the canonical provider catalog, and a sample conversation.

### 4. Run

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Architecture

```
reklu/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing site
│   │   ├── page.tsx              #   (/)
│   │   ├── features/page.tsx
│   │   ├── models/page.tsx
│   │   └── pricing/page.tsx
│   ├── app/                      # Authenticated app
│   │   ├── layout.tsx            #   Sidebar + topbar
│   │   ├── chat/                 #   Multi-model chat
│   │   ├── search/               #   Conversation search
│   │   ├── usage/                #   Usage & cost tracking
│   │   └── settings/profile/
│   ├── api/                      # Route handlers
│   │   ├── auth/[...nextauth]/
│   │   ├── chat/stream/          #   SSE streaming endpoint
│   │   └── conversations/
│   ├── sign-in/, sign-up/
│   ├── layout.tsx                # Root layout (theme, fonts, toaster)
│   └── globals.css               # Design tokens
├── components/
│   ├── ui/                       # shadcn-style primitives
│   ├── app/                      # App-shell components (sidebar, topbar, chat)
│   └── theme-provider.tsx
├── lib/
│   ├── ai/                       # AI provider layer
│   │   ├── types.ts              #   Unified adapter interface
│   │   ├── openai.ts             #   OpenAI adapter (direct SDK)
│   │   ├── anthropic.ts          #   Anthropic adapter (direct SDK)
│   │   ├── google.ts             #   Google Gemini adapter (direct SDK)
│   │   ├── pricing.ts            #   Default pricing table
│   │   ├── registry.ts           #   Provider registry / credential resolver
│   │   ├── auto.ts               #   Reklu Auto model selection
│   │   └── orchestrator.ts       #   Chat orchestration + persistence
│   ├── auth/                     # NextAuth v5 config + helpers
│   ├── db.ts                     # Prisma client singleton
│   ├── env.ts                    # Environment variable validation
│   ├── crypto.ts                 # AES-256-GCM at-rest encryption
│   └── utils.ts                  # Formatters + cn() helper
├── prisma/
│   ├── schema.prisma             # 25+ models
│   └── seed.ts                   # Provider catalog + demo user
├── docs/                         # Architecture, deployment, migration
├── .env.example
└── package.json
```

## How the AI layer works

```
        ┌──────────────┐
        │  Chat UI     │
        └──────┬───────┘
               │ POST /api/chat/stream (SSE)
               ▼
        ┌──────────────┐
        │ Orchestrator │  ← resolves model, persists user msg, builds request
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  Auto (lib)  │  ← detects intent, picks model, generates reason
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  Registry    │  ← resolves provider + credential (system or BYOK)
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │  Adapter     │  ← OpenAI / Anthropic / Google (direct SDK)
        └──────┬───────┘
               │ stream(...)
               ▼
        ┌──────────────┐
        │ SSE response │  ← text deltas, usage, finish, error
        └──────────────┘
```

Each adapter implements a common interface:

```ts
interface AIProviderAdapter {
  readonly providerId: string;
  listModels(credential): Promise<ModelDescriptor[]>;
  getModel(credential, modelId): Promise<ModelDescriptor | null>;
  generate(credential, request): Promise<UnifiedResponse>;
  stream(credential, request): AsyncIterable<UnifiedStreamEvent>;
  validateCredential(credential): Promise<CredentialStatus>;
  countTokens?(credential, request): Promise<TokenEstimate>;
}
```

Adding a new provider is a 4-step process:

1. Implement `AIProviderAdapter` in `lib/ai/<provider>.ts`
2. Register it in `lib/ai/registry.ts`
3. Add the env key lookup in `lib/env.ts`
4. Add pricing in `lib/ai/pricing.ts`
5. Run `pnpm prisma:push` to add the provider row

## Reklu Auto

Reklu Auto analyzes the request, the conversation history, and your preference (quality / balanced / speed / cost), then picks the best model from the configured catalog. The user always sees a short, transparent explanation — e.g.:

> Selected Claude Sonnet 4.5 for strong coding performance, quality preference.

Auto scoring is in `lib/ai/auto.ts`. Internal weights and proprietary reasoning are never exposed.

## Pricing & cost tracking

- Token counts come from the provider's `usage` event.
- Per-model pricing lives in `lib/ai/pricing.ts` (default list prices).
- `PricingRule` rows in the DB can add admin-controlled markup.
- Every chat writes a `UsageEvent` row and increments denormalized totals on the conversation.
- The usage page (`/app/usage`) shows 30-day totals, per-model breakdown, and a daily cost chart.

## Security

- Provider API keys are encrypted at rest with AES-256-GCM (`lib/crypto.ts`).
- The `ENCRYPTION_KEY` env var is required.
- HTTP headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict `Referrer-Policy`.
- NextAuth v5 with JWT sessions (Edge-safe) + database adapter for user lookups.
- Password hashes use bcrypt (10 rounds).
- Workspace isolation enforced in `requireOrganization` and every API route.

## Scripts

```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm typecheck        # tsc --noEmit
pnpm lint             # Next.js lint
pnpm format           # Prettier
pnpm prisma:push      # Push schema to dev DB
pnpm prisma:seed      # Seed provider catalog + demo user
pnpm prisma:studio    # Prisma Studio
pnpm test             # Vitest (coming)
pnpm test:e2e         # Playwright (coming)
```

## Environment variables

See [`.env.example`](./.env.example) for the complete list, grouped by:

- Application
- Database
- Authentication
- Encryption
- Object storage (Phase 6)
- Redis (Phase 6)
- Email (Phase 6+)
- Stripe (Phase 8)
- AI provider keys
- Observability
- Feature flags

## Deployment

The app builds to a standard Next.js production bundle. Recommended deployment:

- **Dokploy** on a single VPS with managed Postgres + Redis.
- Or Vercel + Neon Postgres + Upstash Redis.

Container support is pending in this Phase 1-3 build — see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) (TODO) for the production Dockerfile + docker-compose that ships with the Phase 10 work.

## What's NOT in this build (deferred to later phases)

- Skills (Phase 4)
- Connectors + MCP (Phase 5)
- Artifacts: documents, presentations, images, spreadsheets, code canvas (Phase 6)
- Agents + multi-step runs (Phase 7)
- Stripe billing + admin dashboard (Phase 8)
- Tests: unit, integration, e2e, security (Phase 10)
- Docker / Dokploy production config (Phase 10)

Each phase builds on the foundation in this repo. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the planned structure of those phases.

## License

Proprietary. © Reklu.
