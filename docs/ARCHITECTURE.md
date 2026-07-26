# Reklu Architecture

> Internal architecture reference. Updated as the build progresses.

## Top-level

Reklu is a single Next.js 15 + React 19 app today. The folder structure is **monorepo-ready** so the future split into `apps/web`, `apps/api`, `apps/worker`, and `packages/*` is mechanical, not architectural.

```
reklu/
├── app/             # Next.js App Router
├── components/      # UI components
├── lib/             # Domain code (ai/, auth/, db.ts, env.ts, ...)
├── prisma/          # Schema + seed
├── docs/            # Architecture, migration, deployment
└── public/          # Static assets
```

## Phases

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ | Audit, safety archive, foundation |
| 2 | ✅ | Platform: DB, auth, orgs, storage, redis, design system |
| 3 | ✅ | Multi-model chat: providers, registry, streaming, Auto, usage |
| 4 | ⏳ | Skills: skill engine, prompt compiler, evaluation, library |
| 5 | ⏳ | Connectors + MCP: SDK, OAuth, approval system, MCP bridge |
| 6 | ⏳ | Artifacts: document, presentation, image, spreadsheet, code canvas |
| 7 | ⏳ | Agents + projects: bounded execution, shared context, team workspaces |
| 8 | ⏳ | Billing + admin: Stripe, credit ledger, BYOK, admin dashboard |
| 9 | ⏳ | Marketing + onboarding: feature pages, docs site, onboarding flow |
| 10 | ⏳ | Testing + deployment: unit/integration/e2e/security tests, Docker, Dokploy |

## Database

Prisma 5 + SQLite for dev, Postgres for production. Provider is configured via `DATABASE_URL`.

### Schema overview

**Auth & identity** — `User`, `Account`, `Session`, `VerificationToken`, `ApiKey`

**Organizations** — `Organization`, `Membership`, `Invitation`

**Projects** — `Project` (Phase 7; schema present, UI minimal in Phase 1-3)

**Conversations & messages** — `Conversation`, `ConversationBranch` (via `parentId` on Conversation), `Message`, `MessagePart`

**AI providers & models** — `ModelProvider`, `ModelDefinition`, `ProviderCredential`, `PricingRule`

**Usage & billing** — `UsageEvent`, `CreditLedgerEntry`, `Subscription`

**Audit & notifications** — `AuditLog`, `Notification`

**Phase 4+ models** (defined later, not in Phase 1-3): `Skill`, `SkillVersion`, `Agent`, `AgentRun`, `ConnectorAccount`, `MCPServer`, `FileAsset`, `FileChunk`, `EmbeddingRecord`, `Artifact`, etc.

### Soft delete

Critical entities (User, Organization, Conversation, Project) have a `deletedAt` column. Queries filter on `deletedAt: null` by default.

### Tenant isolation

Every query that touches user-owned data goes through `requireOrganization()` and filters by `organizationId`. Cross-org access is enforced at the application layer in Phase 1-3; the Postgres-RLS plan is documented for Phase 10.

## AI provider layer

`lib/ai/types.ts` defines the unified contract. Every adapter normalizes its SDK into:

- `UnifiedGenerationRequest` — messages, system, sampling, tools, abort
- `UnifiedResponse` — text, tool calls, usage, cost, finish reason
- `UnifiedStreamEvent` — `start | text | reasoning | tool_call | usage | finish | error`

Adapters for Phase 1-3: **OpenAI**, **Anthropic**, **Google Gemini**. All direct SDKs, no OpenRouter.

Adding a new provider (Phase 4+): xAI Grok, DeepSeek, Mistral, Cohere, Moonshot Kimi, Qwen, Perplexity, Groq, Together, Fireworks — each is a 100-300 line file in `lib/ai/`.

## Model registry

`ModelDefinition` rows are the source of truth for what users can see and use. Admin-controlled:

- `isEnabledForUsers` — show/hide in selectors
- `status` — active / deprecated / disabled
- `qualityScore`, `speedScore`, `costScore` — signals for Reklu Auto
- `recommendedFor` — JSON array of intent tags

Phase 4 plan: implement `sync` job per provider that calls `listModels()` on a schedule, creates `ModelDefinition` rows for new models in `pending` status, and alerts admins. Auto is **off by default** — new models must be reviewed and enabled before they're shown to users.

## Reklu Auto

`lib/ai/auto.ts`:

1. `detectIntent()` — keyword + structure analysis on the user's message
2. `scoreModel()` — intent fit + capability match + preference signal
3. `explainChoice()` — short, user-facing text

The user always sees the explanation. Internal weights and proprietary reasoning are not exposed.

## Chat streaming

`POST /api/chat/stream` (Server-Sent Events):

1. Validate session, body.
2. Resolve org membership.
3. Create conversation if needed.
4. Persist user message.
5. Run `orchestrate(ctx)` which resolves model, creates assistant message row, returns async iterable of `UnifiedStreamEvent`.
6. Stream events to the client: `meta` (model + reason), `text` (deltas), `usage` (token counts), `finish` (reason + latency), `error` (code + message), `done` (final).
7. The orchestrator's `persistStream` wrapper updates the assistant message row throttled (every 500ms during stream) and definitively after the stream ends. It also writes a `UsageEvent` row for billing.

The chat UI (`components/app/chat-workspace.tsx`) handles the SSE stream with the `fetch().body.getReader()` API. Optimistic assistant message; server ID replaces the optimistic ID on `meta` event.

## Auth

NextAuth v5 (beta) with:

- JWT session strategy (Edge-safe for middleware)
- Prisma adapter (DB lookups for user/org/membership)
- Credentials provider (email + bcrypt password)
- Google OAuth (when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set)
- Custom `Session` type with `id`, `isAdmin`, `preferredModelId`, `preferredAuto`
- `signOut` is a server action called from the sidebar

## Design system

`tailwind.config.ts` + `app/globals.css` define semantic tokens (background, foreground, primary, accent, etc.) for both light and dark mode.

`components/ui/*` are shadcn-style primitives (button, input, textarea, label, card, badge, avatar, dropdown-menu, tooltip, separator, scroll-area). All built on Radix UI + Tailwind + `cn()` (clsx + tailwind-merge).

## Encryption

`lib/crypto.ts` — AES-256-GCM with `ENCRYPTION_KEY`. Used to encrypt at-rest secrets (provider API keys, connector tokens, MCP tokens — Phase 5+). Format: `base64(iv || authTag || ciphertext)`.

## Observability

Phase 1-3 has:

- Structured `console.error` in adapters and orchestrator
- Prisma query logs in dev
- Per-request latency tracked on the assistant message row
- `timeToFirstTokenMs` for streaming
- `costMicros` per request, per conversation, per organization

Phase 10 plan: OpenTelemetry traces + Sentry error tracking + a `/admin/health` dashboard.

## Security posture

- HTTP headers (`next.config.ts`)
- Bcrypt password hashing
- Encrypted secrets
- Workspace isolation in every API route
- No API keys exposed to the browser
- Rate limiting and CSP — Phase 10 hardening
- Prompt-injection awareness documented; future work is in the prompt compiler (Phase 4)

See [`docs/REKLU_REBUILD_AUDIT.md`](./REKLU_REBUILD_AUDIT.md) for the rebuild audit.
