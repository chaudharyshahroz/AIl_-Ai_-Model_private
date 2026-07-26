# Deploying Reklu to Hostinger VPS with Dokploy

This guide walks you through deploying Reklu to a Hostinger VPS using Dokploy — the easiest way to ship a production Next.js app with a managed Postgres database.

## What you'll need

1. **Hostinger VPS** (KVM 2 or higher, 4GB+ RAM recommended)
2. **Dokploy** installed on the VPS ([docs.dokploy.com](https://docs.dokploy.com))
3. **A domain** pointed at the VPS (optional but recommended for HTTPS)
4. **AI provider keys** — at least one of OpenAI, Anthropic, or Google AI

## One-time VPS setup

SSH into your VPS and run:

```bash
# Install Dokploy
curl -sSL https://dokploy.com/install.sh | sh
```

Once Dokploy is up (default port 3000 on the VPS — **different from your app's port**), open `http://<vps-ip>:3000`, finish the setup wizard, and create a project called `reklu`.

## Push your code to GitHub

1. Create a new GitHub repo (e.g. `reklu`).
2. Push this codebase:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:<you>/reklu.git
   git push -u origin main
   ```

## Connect GitHub to Dokploy

In the Dokploy UI:

1. Go to **Settings → Git Providers** and link your GitHub account.
2. Go to your `reklu` project → **Create Service → Application**.
3. Source: **GitHub**, select the `reklu` repo, branch `main`.
4. Build:
   - **Build method**: Docker
   - **Dockerfile path**: `./Dockerfile`
   - **Port**: `3000`
   - **Health check path**: `/api/health`
5. Save and trigger the first deploy.

## Set environment variables in Dokploy

In the application's **Environment** tab, set these (use Dokploy's "secret" toggle for sensitive values):

```bash
# Required
NODE_ENV=production
AUTH_SECRET=<openssl rand -base64 32>
ENCRYPTION_KEY=<openssl rand -base64 32>
DATABASE_URL=postgresql://reklu:CHANGE_ME@db:5432/reklu

# Public URL
NEXT_PUBLIC_APP_URL=https://reklu.yourdomain.com

# AI providers (admin can also add these via the dashboard after deploy)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Optional — Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> Tip: the `DATABASE_URL` uses the internal Docker network name (`db`). If you provision Postgres separately on the VPS, use the actual connection string.

## Provision Postgres

In the same Dokploy project, add a Postgres service:

1. **Create Service → Database → PostgreSQL 16**.
2. Service name: `db`.
3. Database name: `reklu`. User: `reklu`. Password: generate a strong one.
4. Dokploy exposes the connection string as `postgresql://reklu:<password>@db:5432/reklu` on the internal network.

The Reklu Docker image's entrypoint runs `prisma db push` on every start, so the schema is always in sync. No separate migration step is required for Phase 1-3.

## Auto-deploy on push (CI/CD)

This repo includes `.github/workflows/deploy.yml` that:

1. Builds the Docker image on every push to `main`.
2. Optionally pushes it to a Docker registry (set `DOCKER_REGISTRY` secret).
3. POSTs to a Dokploy webhook (set `DOKPLOY_WEBHOOK_URL` secret) to trigger a redeploy.

**Dokploy webhook setup**: in your Dokploy project → Webhooks → create a webhook, copy the URL, and add it to GitHub as a secret called `DOKPLOY_WEBHOOK_URL`.

## Reverse proxy + HTTPS

Dokploy handles Traefik for you. To add HTTPS:

1. In the application's **Domains** tab, add `reklu.yourdomain.com`.
2. Enable **Let's Encrypt** (one click).
3. Dokploy provisions a cert and auto-renews it.

## First-run setup

After the first successful deploy:

1. Visit `https://reklu.yourdomain.com/sign-up` and create your account.
2. Promote yourself to admin:
   ```bash
   # SSH into the VPS
   docker exec -it reklu-db psql -U reklu -d reklu \
     -c "UPDATE \"User\" SET \"isAdmin\" = true WHERE email = 'you@example.com';"
   ```
   (The `User` table is double-quoted because Postgres lowercases unquoted identifiers.)
3. Sign in to the admin dashboard at `https://reklu.yourdomain.com/admin` and add your AI provider keys under **API Keys**.
4. Open `https://reklu.yourdomain.com/app/chat` and start chatting.

## Backups

Add a Dokploy **Backup** schedule for the Postgres service:

- Frequency: daily
- Retention: 30 days
- Destination: S3-compatible storage (Backblaze B2, DO Spaces, etc.)

## Health check

Dokploy pings `GET /api/health` every 30 seconds. Returns:
- `200 OK` with `{"ok": true, ...}` when the app and database are healthy
- `503 Service Unavailable` if the database is unreachable

## Troubleshooting

### "Build failed: prisma generate error"

Make sure the build has `DATABASE_URL` set. Prisma client generation needs the URL even at build time. The image includes a fallback.

### "App starts but chat returns 401 / 500"

Check the application logs in Dokploy. The most common cause is `ENCRYPTION_KEY` not matching the value used to encrypt any existing credentials. Set a fresh one and re-add keys via the admin dashboard.

### "Migration error: relation does not exist"

The `docker-entrypoint.sh` runs `prisma db push` before starting Next.js. If you change `prisma/schema.prisma`, redeploy — the entrypoint will sync the new schema automatically.

### "Out of memory"

A 4GB VPS is the minimum. If you see OOM kills, upgrade to 8GB or add swap.

## Architecture on Dokploy

```
Internet
  │
  ▼
Traefik (HTTPS, auto-renewed Let's Encrypt cert)
  │
  ▼
reklu-app  (Docker container, port 3000, this repo's image)
  │     │
  │     │ DATABASE_URL
  │     ▼
  │   reklu-db  (Postgres 16, port 5432, persistent volume)
  │
  └─ Health check: GET /api/health every 30s
```

That's the whole production stack. No Redis needed for Phase 1-3. Add it in Phase 6+ when you enable background jobs.

## Environment variables reference

See [`.env.example`](../.env.example) and [`docs/ENVIRONMENT_VARIABLES.md`](./ENVIRONMENT_VARIABLES.md) for the full list.
