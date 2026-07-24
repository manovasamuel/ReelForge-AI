import { test, expect, Page } from "@playwright/test";
import { VALID_INSTAGRAM_URLS, API_TIMEOUT, FULL_PIPELINE_TIMEOUT } from "./helpers/fixtures";

/**
 * Workspace tests — Save, Open, Rename, Duplicate, Delete, Search, Sort
 */
test.describe("Workspace — Project Lifecycle", () => {
  test.setTimeout(FULL_PIPELINE_TIMEOUT);

  const PROJECT_NAME = `QA Test Project ${Date.now()}`;

  /** Helper: Run Phase 1 only and get to a saveable state */
  async function runToPhase1(page: Page) {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    // Wait for Save button to become available (at least 1 completed step)
    await expect(
      page.getByRole("button", { name: /Save/ }).first()
    ).toBeVisible({ timeout: API_TIMEOUT });
  }

  test("Save button should appear after Phase 1 completes", async ({ page }) => {
    await runToPhase1(page);
    const saveBtn = page.getByRole("button", { name: /Save/ }).first();
    await expect(saveBtn).toBeVisible();
  });

  test("Save modal should open when Save is clicked", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    await expect(page.getByRole("heading", { name: "Save Project to Workspace" })).toBeVisible();
  });

  test("Save modal should have a project name input", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    await expect(page.getByPlaceholder(/e.g., @nike/i)).toBeVisible();
  });

  test("Save modal displays v1.2.0 Schema badge (BUG-RF-003 regression)", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    await expect(page.getByText(/v1.2.0 Schema/i)).toBeVisible();
  });

  test("Cancel should close the save modal", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    await expect(page.getByRole("heading", { name: "Save Project to Workspace" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).first().click();
    await expect(page.getByRole("heading", { name: "Save Project to Workspace" })).not.toBeVisible();
  });

  test("Should save project and show toast notification", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    const nameInput = page.getByPlaceholder(/e.g., @nike/i);
    await nameInput.clear();
    await nameInput.fill(PROJECT_NAME);
    await page.getByRole("button", { name: "Save Project" }).click();
    // Toast notification should appear
    await expect(page.getByText(/Project Saved/i)).toBeVisible({ timeout: API_TIMEOUT });
  });

  test("Saved project should appear in Workspace view", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    const nameInput = page.getByPlaceholder(/e.g., @nike/i);
    await nameInput.clear();
    await nameInput.fill(PROJECT_NAME);
    await page.getByRole("button", { name: "Save Project" }).click();
    await page.getByText(/Project Saved/i).waitFor({ timeout: API_TIMEOUT });

    // Navigate to Workspace
    await page.getByRole("button", { name: "Workspace" }).click();
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible({ timeout: API_TIMEOUT });
  });

  test("Search should filter projects by name", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    const nameInput = page.getByPlaceholder(/e.g., @nike/i);
    await nameInput.clear();
    await nameInput.fill(PROJECT_NAME);
    await page.getByRole("button", { name: "Save Project" }).click();
    await page.getByText(/Project Saved/i).waitFor({ timeout: API_TIMEOUT });

    await page.getByRole("button", { name: "Workspace" }).click();
    await page.getByPlaceholder(/Search by project name/i).fill(PROJECT_NAME.slice(0, 10));
    await expect(page.getByText(PROJECT_NAME).first()).toBeVisible({ timeout: API_TIMEOUT });
  });

  test("Search with no match should show empty results or empty state", async ({ page }) => {
    await runToPhase1(page);
    await page.getByRole("button", { name: /Save/ }).first().click();
    const nameInput = page.getByPlaceholder(/e.g., @nike/i);
    await nameInput.clear();
    await nameInput.fill(PROJECT_NAME);
    await page.getByRole("button", { name: "Save Project" }).click();
    await page.getByText(/Project Saved/i).waitFor({ timeout: API_TIMEOUT });

    await page.getByRole("button", { name: "Workspace" }).click();
    await page.getByPlaceholder(/Search by project name/i).fill("XYZNOTEXISTS99999");
    // Either empty state or no project card visible
    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBe(0);
  });

  test("Sort select should have expected options", async ({ page }) => {
    await page.goto("/profiles");
    await page.getByRole("button", { name: "Workspace" }).click();
    const sortSelect = page.locator("select");
    await expect(sortSelect).toBeVisible({ timeout: API_TIMEOUT });
    const options = await sortSelect.locator("option").allTextContents();
    expect(options.some((o) => o.match(/Newest/i))).toBeTruthy();
    expect(options.some((o) => o.match(/Oldest/i))).toBeTruthy();
    expect(options.some((o) => o.match(/Alphabetical/i))).toBeTruthy();
  });

  test("Workspace shows empty state when no projects exist", async ({ page }) => {
    // Clear localStorage first
    await page.goto("/profiles");
    await page.evaluate(() => {
      localStorage.removeItem("reelforge_projects");
    });
    await page.reload();
    await page.getByRole("button", { name: "Workspace" }).click();
    // Either "No saved projects yet" text or the empty-state component
    const noProjects = page.getByText(/No saved projects yet/i);
    await expect(noProjects.first()).toBeVisible({ timeout: 5000 });
  });
});
