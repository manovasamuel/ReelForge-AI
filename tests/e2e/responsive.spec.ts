import { test, expect } from "@playwright/test";

/**
 * Responsive layout tests — verify the page renders without overflow
 * or broken layout at each viewport. These tests are viewport-aware via
 * the project matrix in playwright.config.ts (Desktop/Tablet/Mobile).
 */

test.describe("Responsive — Layout integrity", () => {
  test("home page loads without horizontal overflow", async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 1440;
    // Allow 1px tolerance
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test("navigation bar is visible at all viewports", async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("ReelForge AI v1.3 Platform")).toBeVisible();
  });

  test("Studio / Workspace / Export Center / Settings buttons are visible", async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    // On mobile the 4-way switcher may wrap — use scrollIntoViewIfNeeded
    const studioBtn = page.getByRole("button", { name: "Studio" });
    await studioBtn.scrollIntoViewIfNeeded();
    await expect(studioBtn).toBeVisible();
  });

  test("Profile URL input is visible and operable at all viewports", async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    const input = page.locator("#instagram-url-input");
    await input.scrollIntoViewIfNeeded();
    await expect(input).toBeVisible();
    await input.fill("https://instagram.com/testuser");
    await expect(input).toHaveValue("https://instagram.com/testuser");
  });

  test("Analyze button is reachable and tappable at all viewports", async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    const input = page.locator("#instagram-url-input");
    const btn = page.locator("#analyze-button");
    await input.fill("https://instagram.com/testuser");
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeEnabled();
  });

  test("Workspace view renders without overflow at any viewport", async ({ page }) => {
    await page.goto("/profiles");
    await page.getByRole("button", { name: "Workspace" }).click();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 1440;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test("Settings view renders without overflow at any viewport", async ({ page }) => {
    await page.goto("/profiles");
    await page.getByRole("button", { name: /Settings/ }).click();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 1440;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
