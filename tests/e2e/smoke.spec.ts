import { test, expect } from "@playwright/test";

/**
 * E2E smoke test.
 * Run with: pnpm test:e2e
 * Requires the dev server running on the configured baseURL.
 *
 * Add more flows here as features stabilize.
 */

test.describe("smoke", () => {
  test("home page loads with hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Every leading AI model");
  });

  test("sign-in page renders the demo card", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByText("demo@reklu.app")).toBeVisible();
  });

  test("pricing page shows three tiers", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
    await expect(page.getByText("Team")).toBeVisible();
  });

  test("features page loads", async ({ page }) => {
    await page.goto("/features");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("models page lists known models", async ({ page }) => {
    await page.goto("/models");
    // Allow either known model from the seed
    await expect(page.getByText(/GPT-4o|Gemini|Claude/).first()).toBeVisible();
  });

  test("unauthed /app/chat redirects to sign-in", async ({ page }) => {
    await page.goto("/app/chat");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("health endpoint returns ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
