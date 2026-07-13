import { test, expect } from "@playwright/test";

const PROD_URL = "https://reel-forge-ai-psi.vercel.app";

test.describe("Milestone 3 — Live Production Authentication E2E (Cross-Browser)", () => {
  test("1. Anonymous protected-page redirect (/profiles -> /sign-in)", async ({ page }) => {
    const response = await page.goto(`${PROD_URL}/profiles`);
    expect(response).not.toBeNull();
    // After following redirects, the final URL should be /sign-in with redirect_url parameter
    expect(page.url()).toContain("/sign-in");
    expect(page.url()).toContain("redirect_url");
  });

  test("2. Anonymous protected-API 401 response (/api/v2/projects)", async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/v2/projects`);
    expect(response.status()).toBe(401);
    
    const json = await response.json();
    expect(json.error).toContain("Unauthorized");
  });

  test("3. /sign-in page loads cleanly without redirect loop", async ({ page }) => {
    const response = await page.goto(`${PROD_URL}/sign-in`);
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    expect(page.url()).toContain("/sign-in");
  });

  test("4. /sign-up page loads cleanly without redirect loop", async ({ page }) => {
    const response = await page.goto(`${PROD_URL}/sign-up`);
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    expect(page.url()).toContain("/sign-up");
  });
});
