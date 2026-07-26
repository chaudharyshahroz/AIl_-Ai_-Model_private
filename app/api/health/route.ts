import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Liveness + readiness check.
 * Used by Docker HEALTHCHECK, Dokploy, and uptime monitors.
 */
export async function GET() {
  const started = Date.now();
  let dbOk = false;
  let dbLatencyMs = 0;
  try {
    const t0 = Date.now();
    await db.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  const ok = dbOk;
  return NextResponse.json(
    {
      ok,
      status: ok ? "healthy" : "degraded",
      version: process.env.npm_package_version ?? "0.2.0",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: {
        database: { ok: dbOk, latencyMs: dbLatencyMs },
      },
      responseTimeMs: Date.now() - started,
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
