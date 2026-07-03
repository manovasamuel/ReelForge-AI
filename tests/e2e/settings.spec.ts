import { test, expect } from "@playwright/test";

test.describe("Settings — Dashboard Navigation & Panels", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Settings/ }).click();
  });

  test("should render the Settings dashboard", async ({ page }) => {
    await expect(page.getByText(/Settings/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("should display Appearance & Theme tab and content", async ({ page }) => {
    await page.getByRole("button", { name: /Appearance/i }).first().click();
    await expect(page.getByText(/Theme/i).first()).toBeVisible({ timeout: 5000 });
    // Dark Mode / Light Mode cards
    await expect(page.getByText(/Dark Mode/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("should display Pipeline Providers tab and content", async ({ page }) => {
    await page.getByRole("button", { name: /Provider/i }).first().click();
    await expect(page.getByText(/Data Ingestion/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("should display provider status badges in Providers tab", async ({ page }) => {
    await page.getByRole("button", { name: /Provider/i }).first().click();
    // Should have Active badge for the mock provider
    await expect(page.getByText(/Active/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("should display Workspace & Auto-Save tab content", async ({ page }) => {
    // Use text-exact match to scope to the settings sidebar tab, not the top-nav button
    await page.getByRole("button", { name: /Workspace/i }).nth(1).click();
    await expect(page.getByText(/Auto.Save Live Studio State/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("should display Export Formatting tab content", async ({ page }) => {
    await page.getByRole("button", { name: /Export/i }).first().click();
    await expect(page.getByText(/Export/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("should display Storage & Data tab content", async ({ page }) => {
    await page.getByRole("button", { name: /Storage/i }).first().click();
    await expect(page.getByText(/Storage/i).first()).toBeVisible({ timeout: 3000 });
  });

  test("should display About & Developer tab with version info", async ({ page }) => {
    await page.getByRole("button", { name: /About/i }).first().click();
    // Should show version info
    await expect(page.getByText(/v1\.3/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("should display Developer section with Build Type info", async ({ page }) => {
    await page.getByRole("button", { name: /About/i }).first().click();
    await expect(page.getByText(/Mock Mode/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("should have Export Settings backup button", async ({ page }) => {
    await page.getByRole("button", { name: /About/i }).first().click();
    await expect(
      page.getByRole("button", { name: /Export Settings/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("Export Settings backup should trigger a JSON download", async ({ page }) => {
    await page.getByRole("button", { name: /About/i }).first().click();
    const exportBtn = page.getByRole("button", { name: /Export Settings/i }).first();
    await exportBtn.waitFor({ timeout: 5000 });

    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 10000 }),
      exportBtn.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/settings.*\.json$/i);
  });

  test("should have an Import Settings file input", async ({ page }) => {
    await page.getByRole("button", { name: /About/i }).first().click();
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 5000 });
  });

  test("Theme: Dark Mode button should be interactive", async ({ page }) => {
    await page.getByRole("button", { name: /Appearance/i }).first().click();
    const darkBtn = page.getByText(/Dark Mode/i).first();
    await expect(darkBtn).toBeVisible({ timeout: 5000 });
    await darkBtn.click(); // should not throw
  });

  test("Theme: Light Mode button should be interactive", async ({ page }) => {
    await page.getByRole("button", { name: /Appearance/i }).first().click();
    const lightBtn = page.getByText(/Light Mode/i).first();
    await expect(lightBtn).toBeVisible({ timeout: 5000 });
    await lightBtn.click(); // should not throw
  });
});
