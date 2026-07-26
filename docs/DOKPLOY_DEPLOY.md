# Dokploy Deployment Settings

Use these exact settings in the Dokploy UI when creating the application. The defaults in the UI are wrong for a Next.js monorepo-style app and will fail.

## Source

- **Provider**: GitHub
- **Repository**: `chaudharyshahroz/Reklu_-AIl_-Ai_-Model_private`
- **Branch**: `main`
- **Trigger type**: `On Push`

## Build Type

- **Build Type**: `Dockerfile`
- **Docker File**: `Dockerfile`
- **Docker Context Path**: `.`  ← must be a single dot, NOT `./Dockerfile` or `./dockerfile`
- **Port**: `3000`

> ⚠️ The most common mistake: setting "Docker Context Path" to `./Dockerfile`. This tells
> Dokploy to look inside a `Dockerfile/` subdirectory, which doesn't exist. The error you
> see is `/bin/sh: 3: cd: can't cd to /etc/dokploy/.../code/Dockerfile`. Fix: set context
> to a single dot (the repo root).

## Domain

Add **two** domains in the Domains tab:

1. `reklu.app` — public marketing + user app
   - HTTPS: ON
   - HSTS: ON
2. `admin.reklu.app` — admin panel only
   - HTTPS: ON
   - HSTS: ON

The app's `middleware.ts` enforces that `admin.reklu.app` only serves `/admin/*`, `/sign-in`, `/api/auth/*`, `/api/health`, and static assets. Everything else on the admin subdomain 308-redirects to `/admin`.

## Environment Variables

Required:

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Generate with: openssl rand -base64 32
AUTH_SECRET=<random-32-byte-base64>
ENCRYPTION_KEY=<random-32-byte-base64>

# AUTH_TRUST_HOST is auto-set by Dokploy via Traefik detection
AUTH_TRUST_HOST=true

# Database — use the Dokploy internal network
DATABASE_URL=postgresql://reklu:<db-password>@db:5432/reklu

# Public URL (used in emails, OAuth callbacks, share links)
NEXT_PUBLIC_APP_URL=https://reklu.app
```

Optional (admin can also add these via the dashboard later):

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
XAI_API_KEY=...
DEEPSEEK_API_KEY=...
MOONSHOT_API_KEY=...
MISTRAL_API_KEY=...
COHERE_API_KEY=...
PERPLEXITY_API_KEY=...
GROQ_API_KEY=...
TOGETHER_API_KEY=...
FIREWORKS_API_KEY=...
QWEN_API_KEY=...

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Health Check

- **Health Check Path**: `/api/health`

Dokploy pings this every 30s. Returns 200 with `{"ok": true, ...}` when healthy, 503 if DB is unreachable.

## First-Run Setup

After the first successful deploy:

```bash
# SSH into the VPS, then exec into the postgres container
docker exec -it $(docker ps | grep postgres | awk '{print $1}') \
  psql -U reklu -d reklu \
  -c "UPDATE \"User\" SET \"isAdmin\" = true WHERE email = 'your-email@example.com';"
```

Then visit `https://admin.reklu.app`, sign in, and add your AI provider keys at **API Keys**.

## Why does the entrypoint run `prisma db push`?

The `docker-entrypoint.sh` runs `npx prisma db push --accept-data-loss` before starting
Next.js. This means:

- Fresh Postgres → schema is created automatically on first boot
- Schema change pushed to GitHub → next deploy auto-applies the change
- No separate "run migrations" step needed

For production with zero-downtime schema changes, switch to `prisma migrate` + a migration runner. For Phase 1-3, `prisma db push` is fine.

## Troubleshooting

### "The path .../code/Dockerfile does not exist"

Your **Docker Context Path** is set to something that ends in `/Dockerfile`. Change it to **`.`** (single dot).

### Build fails: "Cannot find module 'openai'"

The `node_modules` aren't being copied correctly. The Dockerfile has a multi-stage build — make sure the **Docker Context Path** is `.` (the project root), not `app/` or any subfolder. The build needs access to `package.json`, `pnpm-lock.yaml`, etc.

### Health check fails

Click the app → Logs tab. The most common causes:
- `DATABASE_URL` wrong (Dokploy's `db` service name is correct: `db:5432`)
- `AUTH_SECRET` or `ENCRYPTION_KEY` not set
- Postgres container not running (check the project's services)

### "Application is restarting"

Look at the last 100 lines of the app logs. The most common cause is the Prisma entrypoint failing. Verify the `db` service is up: in Dokploy, go to the project → click `db` → Logs.

### "prisma db push" fails: "relation does not exist"

Your DATABASE_URL points to the wrong database, or the `reklu` user doesn't have permission. Check by exec'ing into the `db` container and running `psql -U reklu -d reklu -c "\dt"`.
