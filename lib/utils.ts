import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with Tailwind merge to dedupe conflicting utilities.
 * Standard shadcn-style helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number of micro-cents (1/1,000,000 of a cent) into a USD string.
 * e.g. formatMicros(1_500_000) === "$0.015"
 */
export function formatMicros(micros: number): string {
  const dollars = micros / 1_000_000 / 100;
  if (dollars === 0) return "$0.00";
  if (Math.abs(dollars) < 0.01) return `$${dollars.toFixed(4)}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format a token count with thousands separators.
 * e.g. formatTokens(12345) === "12,345"
 */
export function formatTokens(tokens: number): string {
  return new Intl.NumberFormat("en-US").format(tokens);
}

/**
 * Format milliseconds as a human-readable latency.
 * e.g. formatLatency(850) === "850ms", formatLatency(2400) === "2.4s"
 */
export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Truncate a string to a maximum length with an ellipsis.
 */
export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Format a relative time string (e.g. "2 minutes ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Generate a short random ID for client-side optimistic updates.
 * Not cryptographically secure — do NOT use for auth.
 */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10);
}
