# Environment Variables

> All variables, organized by category. See `.env.example` for the canonical list.

## Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | yes | `development` | `development` / `test` / `production` |
| `NEXT_PUBLIC_APP_URL` | yes | `http://localhost:3000` | Public app URL (used for emails, OAuth callbacks) |
| `NEXT_PUBLIC_APP_NAME` | no | `Reklu` | Public-facing app name |

## Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | yes | `file:./dev.db` | Prisma connection string. Use Postgres in production. |

Production example:
```
DATABASE_URL="postgresql://reklu:password@db.internal:5432/reklu?schema=public"
```

## Authentication

| Variable | Required | Description |
|---|---|---|
| `AUTH_SECRET` | yes | NextAuth secret. Min 16 chars. Generate with `openssl rand -base64 32`. |
| `AUTH_TRUST_HOST` | no | Set to `true` in production behind a reverse proxy. |
| `NEXTAUTH_URL` | no | Public URL of the deployment. |
| `GOOGLE_CLIENT_ID` | no | Google OAuth client ID (optional). |
| `GOOGLE_CLIENT_SECRET` | no | Google OAuth client secret (optional). |

## Encryption

| Variable | Required | Description |
|---|---|---|
| `ENCRYPTION_KEY` | yes | AES-256-GCM key for at-rest secrets. Min 16 chars. Generate with `openssl rand -base64 32`. |

## AI provider keys

Direct provider integrations. Set at least one to enable chat.

| Provider | Variable | Phase |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | 1-3 ✅ |
| Anthropic | `ANTHROPIC_API_KEY` | 1-3 ✅ |
| Google AI | `GOOGLE_AI_API_KEY` | 1-3 ✅ |
| xAI | `XAI_API_KEY` | 4 |
| DeepSeek | `DEEPSEEK_API_KEY` | 4 |
| Mistral | `MISTRAL_API_KEY` | 4 |
| Cohere | `COHERE_API_KEY` | 4 |
| Moonshot Kimi | `MOONSHOT_API_KEY` | 4 |
| Qwen | `QWEN_API_KEY` | 4 |
| Perplexity | `PERPLEXITY_API_KEY` | 4 |
| Groq | `GROQ_API_KEY` | 4 |
| Together | `TOGETHER_API_KEY` | 4 |
| Fireworks | `FIREWORKS_API_KEY` | 4 |

## Object storage (Phase 6)

| Variable | Description |
|---|---|
| `S3_ENDPOINT` | S3-compatible endpoint (e.g. MinIO, R2) |
| `S3_REGION` | Region |
| `S3_BUCKET` | Bucket name |
| `S3_ACCESS_KEY_ID` | Access key |
| `S3_SECRET_ACCESS_KEY` | Secret key |

## Redis (Phase 6+)

| Variable | Description |
|---|---|
| `REDIS_URL` | Connection string (default: `redis://localhost:6379`) |

## Email (Phase 6+)

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend transactional email |
| `EMAIL_FROM` | From address |

## Stripe (Phase 8)

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Server-side secret |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Browser-side key |

## Observability (Phase 10)

| Variable | Description |
|---|---|
| `SENTRY_DSN` | Sentry error tracking |
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` |

## Feature flags

| Variable | Default | Description |
|---|---|---|
| `FEATURE_REKLU_AUTO` | `true` | Reklu Auto model selection |
| `FEATURE_MODEL_COMPARISON` | `true` | Side-by-side model comparison |
| `FEATURE_FILES` | `false` | File upload + RAG (Phase 6) |
| `FEATURE_SKILLS` | `false` | Skill engine (Phase 4) |
| `FEATURE_CONNECTORS` | `false` | Native connectors (Phase 5) |
| `FEATURE_MCP` | `false` | MCP client (Phase 5) |
| `FEATURE_AGENTS` | `false` | Agents (Phase 7) |
| `FEATURE_ARTIFACTS` | `false` | Artifacts canvas (Phase 6) |
| `FEATURE_BILLING` | `false` | Stripe billing UI (Phase 8) |
| `FEATURE_ADMIN` | `false` | Admin dashboard (Phase 8) |

In Phase 1-3, flags are read by convention but most code paths aren't behind them yet. They'll be wired in as the corresponding features ship.

## Local dev minimum

```bash
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<openssl rand -base64 32>"
ENCRYPTION_KEY="<openssl rand -base64 32>"
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

That's enough to run the full Phase 1-3 experience locally.
