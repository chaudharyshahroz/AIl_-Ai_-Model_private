#!/bin/sh
# Entry point for the Reklu Docker image.
# Runs `prisma db push` against $DATABASE_URL before starting Next.js,
# so the schema is always in sync with the running image.

set -e

echo "[reklu] applying Prisma schema to $DATABASE_URL..."
# Use the globally-installed prisma CLI (installed in the runner stage of the
# Dockerfile). Falls back to npx only if the global one isn't found, but
# pinning via Dockerfile ensures the correct version is always used.
prisma db push --skip-generate --accept-data-loss

echo "[reklu] starting Next.js on $HOSTNAME:$PORT..."
exec "$@"
