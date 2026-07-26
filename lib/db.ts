import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 * In dev, reuses a single client across HMR reloads to avoid leaking connections.
 * In production, creates a fresh client.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export type DB = typeof db;
