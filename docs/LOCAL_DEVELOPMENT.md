# Local Development

## Prerequisites

- **Node.js 20+** (we use Node 20.20.2 in development)
- **pnpm 10+** (`npm install -g pnpm` if you don't have it)
- A POSIX shell (macOS, Linux, or WSL)

## Setup

```bash
# 1. Clone or enter the project directory
cd "/path/to/Reklu Ai model Chat"

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set at least one provider key:
#   OPENAI_API_KEY=sk-...
#   ANTHROPIC_API_KEY=sk-ant-...
#   GOOGLE_AI_API_KEY=...
# Also generate AUTH_SECRET and ENCRYPTION_KEY:
#   openssl rand -base64 32

# 4. Initialize the database
pnpm prisma:push
pnpm prisma:seed

# 5. Start the dev server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Demo login

The seed script provisions:

- **Email:** `demo@reklu.app`
- **Password:** `demopassword`

Plus a personal workspace, a sample conversation, and the full provider catalog (OpenAI, Anthropic, Google).

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the Next.js dev server (HMR) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Next.js lint |
| `pnpm format` | Prettier across the repo |
| `pnpm prisma:push` | Push schema to dev DB |
| `pnpm prisma:migrate` | Create a migration |
| `pnpm prisma:seed` | Run the seed script |
| `pnpm prisma:studio` | Prisma Studio (browse DB) |
| `pnpm test` | Vitest (Phase 10) |
| `pnpm test:e2e` | Playwright (Phase 10) |

## Common dev tasks

### Add a new AI provider

1. Create `lib/ai/<provider>.ts` implementing `AIProviderAdapter`.
2. Register it in `lib/ai/registry.ts` (`adapters` map).
3. Add the env key lookup in `lib/env.ts` (`getProviderEnvKey`).
4. Add pricing in `lib/ai/pricing.ts`.
5. Add a `ModelProvider` row in `prisma/seed.ts`.
6. Add a `ModelDefinition` row per supported model.
7. Run `pnpm prisma:push && pnpm prisma:seed`.

### Reset the database

```bash
rm prisma/dev.db
pnpm prisma:push
pnpm prisma:seed
```

### Inspect the database

```bash
pnpm prisma:studio
```

### Check TypeScript

```bash
pnpm typecheck
```

## File locations

- **Source code** — `app/`, `components/`, `lib/`
- **Database** — `prisma/dev.db` (SQLite, gitignored)
- **Generated Prisma client** — `node_modules/.prisma/client`
- **Build output** — `.next/`
- **Environment** — `.env`

## Troubleshooting

### "Prisma client not generated"

```bash
pnpm prisma:generate
```

### "AUTH_SECRET is required"

Make sure `.env` exists and has a 16+ char `AUTH_SECRET`.

### "No AI provider configured"

Set at least one of `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_AI_API_KEY` in `.env` and restart the dev server.

### Port 3000 is in use

Next.js will pick the next free port (3001, 3002, ...) and print it to the terminal.

### Streaming chat hangs

- Check the browser DevTools Network tab for the `/api/chat/stream` response.
- Check the dev server terminal for provider errors.
- Make sure the model in the registry is enabled (`isEnabledForUsers = true`).
- Verify the API key is valid (`pnpm prisma:studio` → `ProviderCredential` or env var).

## Tips

- The chat workspace is at `/app/chat`. After signing in you'll land there.
- Use the **Reklu Auto** model selector to let the system pick the best model for your request.
- The usage page (`/app/usage`) shows real-time token + cost tracking.
- Provider keys are env-var only for Phase 1-3. The BYOK UI ships in Phase 8 (along with the Settings → Providers page).
