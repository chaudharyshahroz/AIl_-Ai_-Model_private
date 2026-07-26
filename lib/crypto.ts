import crypto from "node:crypto";

/**
 * AES-256-GCM encryption for at-rest secrets (provider keys, connector tokens, etc.).
 * Uses ENCRYPTION_KEY from env. The key is expected to be a base64-encoded 32-byte value.
 *
 * Format: base64(iv || authTag || ciphertext)
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits, recommended for GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    throw new Error("ENCRYPTION_KEY is not set or too short");
  }
  // Accept either a base64 string or a raw string of >=32 chars
  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length >= 32) return buf.subarray(0, 32);
  } catch {
    // fall through
  }
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(payload: string): string {
  const key = getKey();
  const buf = Buffer.from(payload, "base64");
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload");
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const enc = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/**
 * Mask a secret for display. e.g. maskKey("sk-1234567890abcdef") === "sk-1••••cdef"
 */
export function maskKey(key: string, visibleStart = 4, visibleEnd = 4): string {
  if (key.length <= visibleStart + visibleEnd) return "•".repeat(key.length);
  return key.slice(0, visibleStart) + "•".repeat(8) + key.slice(-visibleEnd);
}

/**
 * Generate a cryptographically random token.
 */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

/**
 * Hash a token for storage (so we can verify it later without storing the raw value).
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
