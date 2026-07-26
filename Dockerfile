# ============================================================================
# Reklu — Production Dockerfile for Dokploy / Hostinger VPS
# ----------------------------------------------------------------------------
# Multi-stage build:
#   1. deps     — install dependencies
#   2. builder  — generate Prisma client, build Next.js
#   3. runner   — minimal runtime image with standalone Next.js output
# ============================================================================

# ---- 1. deps ----
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# Install OS deps for Prisma
RUN apk add --no-cache openssl

# Copy lockfile + package.json first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

# ---- 2. builder ----
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm prisma:generate

# Build Next.js (uses Next's standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- 3. runner ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 reklu

# Copy built artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=reklu:nodejs /app/.next/standalone ./
COPY --from=builder --chown=reklu:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=reklu:nodejs /app/prisma ./prisma

# Copy entrypoint
COPY --chown=reklu:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER reklu

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
