import { test, expect } from "@playwright/test";
import { StudioPage } from "../pages/studio.page";

test.describe("Navigation — 4-way switcher", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
  });

  test("should load /profiles and display the Studio view by default", async ({ page }) => {
    await expect(page).toHaveURL(/\/profiles/);
    await expect(page.getByText("Instagram Profile Analysis")).toBeVisible();
    await expect(page.getByText("ReelForge AI v1.3 Platform")).toBeVisible();
  });

  test("should display all 4 navigation buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Studio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Workspace" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Export Center/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Settings/ })).toBeVisible();
  });

  test("should switch to Workspace view", async ({ page }) => {
    await page.getByRole("button", { name: "Workspace" }).click();
    await expect(page.getByPlaceholder(/Search by project name/i)).toBeVisible();
  });

  test("should switch to Export Center view", async ({ page }) => {
    await page.getByRole("button", { name: /Export Center/ }).click();
    // Without an active project, should show the empty state
    await expect(page.getByText(/No Active Analysis Selected/i)).toBeVisible();
  });

  test("should switch to Settings view", async ({ page }) => {
    await page.getByRole("button", { name: /Settings/ }).click();
    await expect(page.getByText(/Settings/i).first()).toBeVisible();
  });

  test("should switch back to Studio from any view", async ({ page }) => {
    await page.getByRole("button", { name: "Workspace" }).click();
    await page.getByRole("button", { name: "Studio" }).click();
    await expect(page.getByText("Instagram Profile Analysis")).toBeVisible();
  });

  test("should display page title 'ReelForge AI'", async ({ page }) => {
    await expect(page).toHaveTitle(/ReelForge AI/i);
  });
});

test.describe("Navigation — responsive sidebar", () => {
  test("desktop sidebar should be visible", async ({ page, viewport }) => {
    if ((viewport?.width ?? 1440) >= 1024) {
      await page.goto("/profiles");
      await expect(page.locator("aside").first()).toBeVisible();
    } else {
      test.skip();
    }
  });
});
