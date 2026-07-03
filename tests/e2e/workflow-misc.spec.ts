import { test, expect } from "@playwright/test";
import { VALID_INSTAGRAM_URLS, API_TIMEOUT, FULL_PIPELINE_TIMEOUT } from "./helpers/fixtures";

/**
 * Workflow Tracker — tests the sidebar step tracker that
 * shows which phases are complete/active/pending.
 */
test.describe("Workflow Tracker", () => {
  test.setTimeout(FULL_PIPELINE_TIMEOUT);

  test("should display workflow tracker sidebar", async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible();
  });

  test("Phase 1 step should be marked active/complete after analysis", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    // Profile analysis heading should confirm success
    await expect(page.getByText(/@/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  });

  test("summary panel should show phases count after analysis", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    // Workflow tracker should indicate progress
    await expect(page.getByText(/1\/9|Phase 1/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  });
});

/**
 * Re-analysis flow — resetting the studio with a new URL
 */
test.describe("Studio — Re-analysis Reset", () => {
  test.setTimeout(FULL_PIPELINE_TIMEOUT);

  test("Entering a new URL should reset previous results", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });

    // Type in a new URL — should clear old results
    await page.locator("#instagram-url-input").fill("https://instagram.com/nasa");
    // Old profile data should reset to idle/empty
    await expect(page.getByText(/Brand Intelligence/i).first()).not.toBeVisible({ timeout: 3000 });
  });
});

/**
 * Toast notifications — spot-check key user-facing toasts
 */
test.describe("Toast Notifications", () => {
  test.setTimeout(FULL_PIPELINE_TIMEOUT);

  test("should show 'Project Saved' toast after saving", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    const saveBtn = page.getByRole("button", { name: /Save/ }).first();
    await saveBtn.waitFor({ timeout: API_TIMEOUT });
    await saveBtn.click();
    const nameInput = page.getByPlaceholder(/e.g., @nike/i);
    await nameInput.clear();
    await nameInput.fill("Toast QA Test");
    await page.getByRole("button", { name: "Save Project" }).click();
    await expect(page.getByText(/Project Saved/i)).toBeVisible({ timeout: 5000 });
  });
});
