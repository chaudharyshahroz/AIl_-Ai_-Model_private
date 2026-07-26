import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt, maskKey, generateToken, hashToken } from "@/lib/crypto";

beforeAll(() => {
  // Set a real key for tests
  process.env.ENCRYPTION_KEY = "test-key-please-do-not-use-in-prod-32b";
});

describe("crypto", () => {
  it("encrypts and decrypts round-trip", () => {
    const plain = "sk-1234567890abcdef";
    const enc = encrypt(plain);
    expect(enc).not.toBe(plain);
    expect(enc.length).toBeGreaterThan(0);
    expect(decrypt(enc)).toBe(plain);
  });

  it("produces different ciphertexts for the same plaintext (random IV)", () => {
    const plain = "hello";
    const a = encrypt(plain);
    const b = encrypt(plain);
    expect(a).not.toBe(b);
    expect(decrypt(a)).toBe(plain);
    expect(decrypt(b)).toBe(plain);
  });

  it("maskKey hides the middle of a secret", () => {
    expect(maskKey("sk-1234567890abcdef")).toMatch(/^sk-1.*cdef$/);
  });

  it("generateToken returns a non-empty URL-safe string", () => {
    const t = generateToken();
    expect(t.length).toBeGreaterThan(20);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("hashToken is deterministic", () => {
    expect(hashToken("foo")).toBe(hashToken("foo"));
    expect(hashToken("foo")).not.toBe(hashToken("bar"));
  });
});
