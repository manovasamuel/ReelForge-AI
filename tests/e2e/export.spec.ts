import { test, expect } from "@playwright/test";
import { VALID_INSTAGRAM_URLS, API_TIMEOUT, FULL_PIPELINE_TIMEOUT } from "./helpers/fixtures";

test.describe("Export Center", () => {
  test.setTimeout(FULL_PIPELINE_TIMEOUT);

  test("should show 'No Active Analysis' message when no project is loaded", async ({ page }) => {
    await page.goto("/profiles");
    await page.getByRole("button", { name: /Export Center/ }).click();
    await expect(page.getByText(/No Active Analysis Selected/i)).toBeVisible({ timeout: 5000 });
  });

  test("should display export options after an analysis is run", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });

    await page.getByRole("button", { name: /Export Center/ }).click();
    await expect(page.getByText(/Omnichannel Intelligence Export/i)).toBeVisible({ timeout: 5000 });
  });

  test("should display PDF, Markdown, HTML, JSON export buttons", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    await page.getByRole("button", { name: /Export Center/ }).click();
    await expect(page.getByText(/Omnichannel Intelligence Export/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /PDF/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Markdown/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /JSON/i }).first()).toBeVisible();
  });

  test("should display v1.3 Export Center badge (BUG-RF-005 regression)", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    await page.getByRole("button", { name: /Export Center/ }).click();
    await expect(page.getByText(/v1\.3 Export Center/i)).toBeVisible({ timeout: 5000 });
  });

  test("JSON export button should trigger a download", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    await page.getByRole("button", { name: /Export Center/ }).click();
    await expect(page.getByText(/Omnichannel Intelligence Export/i)).toBeVisible({ timeout: 5000 });

    // Listen for download event
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.getByRole("button", { name: /JSON/i }).first().click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test("Markdown export button should trigger a download", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    await page.getByRole("button", { name: /Export Center/ }).click();
    await expect(page.getByText(/Omnichannel Intelligence Export/i)).toBeVisible({ timeout: 5000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.getByRole("button", { name: /Markdown/i }).first().click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.md$/);
  });

  test("HTML export button should trigger a download", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    await page.getByRole("button", { name: /Export Center/ }).click();
    await expect(page.getByText(/Omnichannel Intelligence Export/i)).toBeVisible({ timeout: 5000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      page.getByRole("button", { name: /HTML/i }).first().click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.html$/);
  });
});
