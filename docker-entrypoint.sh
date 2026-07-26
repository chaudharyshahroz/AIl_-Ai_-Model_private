#!/bin/sh
# Entry point for the Reklu Docker image.
# Runs `prisma db push` against $DATABASE_URL before starting Next.js,
# so the schema is always in sync with the running image.

set -e

echo "[reklu] applying Prisma schema to $DATABASE_URL..."
npx prisma db push --skip-generate --accept-data-loss

echo "[reklu] starting Next.js on $HOSTNAME:$PORT..."
exec "$@"
