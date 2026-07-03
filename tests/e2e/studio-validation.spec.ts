import { test, expect } from "@playwright/test";
import {
  VALID_INSTAGRAM_URLS,
  VALID_URL_WITH_QUERY,
  VALID_URL_WITH_IGSH,
  INVALID_URLS,
  API_TIMEOUT,
} from "./helpers/fixtures";

test.describe("Profile URL Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
  });

  test("analyze button should be disabled when input is empty", async ({ page }) => {
    const btn = page.locator("#analyze-button");
    await expect(btn).toBeDisabled();
  });

  test("should show error for a plain string (non-URL)", async ({ page }) => {
    await page.locator("#instagram-url-input").fill("not-a-url");
    await page.locator("#analyze-button").click();
    await expect(page.locator("#url-error")).toBeVisible();
  });

  test("should show error for a non-Instagram URL", async ({ page }) => {
    await page.locator("#instagram-url-input").fill("https://twitter.com/someuser");
    await page.locator("#analyze-button").click();
    await expect(page.locator("#url-error")).toBeVisible();
    await expect(page.locator("#url-error")).toContainText(/Instagram/i);
  });

  test("should show error for instagram.com with no username", async ({ page }) => {
    await page.locator("#instagram-url-input").fill("https://instagram.com/");
    await page.locator("#analyze-button").click();
    await expect(page.locator("#url-error")).toBeVisible();
  });

  test("should clear error when user types after an invalid submission", async ({ page }) => {
    await page.locator("#instagram-url-input").fill("bad-url");
    await page.locator("#analyze-button").click();
    await expect(page.locator("#url-error")).toBeVisible();
    await page.locator("#instagram-url-input").fill("https://instagram.com/nasa");
    await expect(page.locator("#url-error")).not.toBeVisible();
  });

  test("should accept a standard Instagram URL", async ({ page }) => {
    const url = VALID_INSTAGRAM_URLS[0];
    await page.locator("#instagram-url-input").fill(url);
    await expect(page.locator("#analyze-button")).toBeEnabled();
  });

  test("BUG-RF-002: should accept Instagram URL with ?hl= query param", async ({ page }) => {
    await page.locator("#instagram-url-input").fill(VALID_URL_WITH_QUERY);
    await expect(page.locator("#analyze-button")).toBeEnabled();
    // Submit and expect no validation error
    await page.locator("#analyze-button").click();
    await expect(page.locator("#url-error")).not.toBeVisible();
  });

  test("BUG-RF-002: should accept Instagram URL with ?igsh= tracking param", async ({ page }) => {
    await page.locator("#instagram-url-input").fill(VALID_URL_WITH_IGSH);
    await expect(page.locator("#analyze-button")).toBeEnabled();
    await page.locator("#analyze-button").click();
    await expect(page.locator("#url-error")).not.toBeVisible();
  });

  for (const bad of INVALID_URLS) {
    test(`should reject invalid URL: "${bad}"`, async ({ page }) => {
      await page.locator("#instagram-url-input").fill(bad);
      await page.locator("#analyze-button").click();
      if (bad === "") {
        // Empty keeps button disabled, no error shown
        await expect(page.locator("#analyze-button")).toBeDisabled();
      } else {
        await expect(page.locator("#url-error")).toBeVisible();
      }
    });
  }
});

test.describe("Profile Analysis — Phase 1", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
  });

  test("should trigger profile analysis and show loading state", async ({ page }) => {
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    // Button should be disabled while loading
    await expect(page.locator("#analyze-button")).toBeDisabled();
  });

  test("should render profile card after successful Phase 1", async ({ page }) => {
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    // Profile section should appear
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  });

  test("should auto-trigger Brand Intelligence after Phase 1", async ({ page }) => {
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Brand Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  });

  test("should display Competitor Radar after Phases 1-3 complete", async ({ page }) => {
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
  });
});
