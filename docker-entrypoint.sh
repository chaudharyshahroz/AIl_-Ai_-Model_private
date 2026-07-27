#!/bin/sh
# Entry point for the Reklu Docker image.
# Runs `prisma db push` against $DATABASE_URL before starting Next.js,
# so the schema is always in sync with the running image.

set -e

# Dokploy / Docker Swarm sometimes injects HOSTNAME=0.0.0.0 as the container
# hostname. Next.js reads process.env.HOSTNAME to build redirect URLs (auth
# callbacks, OAuth, error pages), and using 0.0.0.0 there causes an infinite
# redirect loop behind a reverse proxy. Unset it so Next.js falls back to the
# actual Host header from the incoming request.
unset HOSTNAME

echo "[reklu] applying Prisma schema to $DATABASE_URL..."
# Use the globally-installed prisma CLI (installed in the runner stage of the
# Dockerfile). Falls back to npx only if the global one isn't found, but
# pinning via Dockerfile ensures the correct version is always used.
prisma db push --skip-generate --accept-data-loss

echo "[reklu] starting Next.js on 0.0.0.0:$PORT..."
exec "$@"
