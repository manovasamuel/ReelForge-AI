import { test, expect } from "@playwright/test";
import { FULL_PIPELINE_TIMEOUT, API_TIMEOUT } from "./helpers/fixtures";

/**
 * Full Pipeline — single sequential test covering all 9 phases.
 * Uses one shared page and one continuous session to avoid redundant
 * phase repetition across individual tests.
 * 
 * NOTE: Each phase assertion is an independent `test` step within the
 * same session so that failures are reported granularly.
 */

const INSTAGRAM_URL = "https://www.instagram.com/cristiano";

test.describe("Studio — Full Pipeline (Phases 1–9)", () => {
  test.setTimeout(FULL_PIPELINE_TIMEOUT);

  test("Phase 1: Profile card renders after analysis", async ({ page }) => {
    await page.goto("/profiles");
    await page.waitForLoadState("networkidle");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  });

  test("Phase 2: Brand Intelligence renders automatically", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Brand Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
    await expect(page.getByText(/industry/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  });

  test("Phase 3: Competitor Radar renders automatically", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    // Wait for Brand Intelligence first (prerequisite)
    await expect(page.getByText(/Brand Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
    // Then wait for competitors
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
    await expect(page.getByRole("button", { name: /Analyze/i }).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  });

  test("Phase 4: Competitor Analysis triggers on clicking Analyze button", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
    await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await analyzeBtn.click();
    await expect(page.getByText(/Competitor Analysis/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  });

  test("Phase 5: Content Collection loads after Phase 4", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
    await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await analyzeBtn.click();
    await expect(page.getByText(/Content Collection/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
  });

  test("Phase 6: Content Intelligence renders after Phase 5", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
    await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await analyzeBtn.click();
    await expect(page.getByText(/Content Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  });

  test("Phase 7: Generate Content DNA Blueprint button is visible", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
    await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await analyzeBtn.click();
    await expect(
      page.getByRole("button", { name: /Generate Content DNA Blueprint/i })
    ).toBeVisible({ timeout: API_TIMEOUT * 4 });
  });

  test("Phase 7: Content DNA Blueprint renders after clicking generate", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    await page.getByRole("button", { name: /Analyze/i }).first().click();
    const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
    await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
    await dnaBtn.click();
    await expect(page.getByText(/Content DNA Blueprint/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  });

  test("Phase 8: Reel Script Package generates after Content DNA", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    await page.getByRole("button", { name: /Analyze/i }).first().click();
    const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
    await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
    await dnaBtn.click();
    const scriptBtn = page.getByRole("button", { name: /Generate Reel Script Package/i });
    await scriptBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await scriptBtn.click();
    await expect(page.getByText(/Phase 8/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  });

  test("Phase 8: Teleprompter mode button is visible after script generation", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    await page.getByRole("button", { name: /Analyze/i }).first().click();
    const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
    await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
    await dnaBtn.click();
    const scriptBtn = page.getByRole("button", { name: /Generate Reel Script Package/i });
    await scriptBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await scriptBtn.click();
    await expect(
      page.getByRole("button", { name: /Teleprompter/i }).first()
    ).toBeVisible({ timeout: API_TIMEOUT * 2 });
  });

  test("Phase 9: Generate Repurpose Package button visible after Phase 8", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    await page.getByRole("button", { name: /Analyze/i }).first().click();
    const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
    await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
    await dnaBtn.click();
    const scriptBtn = page.getByRole("button", { name: /Generate Reel Script Package/i });
    await scriptBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await scriptBtn.click();
    await expect(
      page.getByRole("button", { name: /Generate Repurpose Package/i })
    ).toBeVisible({ timeout: API_TIMEOUT * 2 });
  });

  test("Phase 9: Repurpose dashboard renders with platform tabs", async ({ page }) => {
    await page.goto("/profiles");
    await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
    await page.locator("#analyze-button").click();
    await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    await page.getByRole("button", { name: /Analyze/i }).first().click();
    const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
    await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
    await dnaBtn.click();
    const scriptBtn = page.getByRole("button", { name: /Generate Reel Script Package/i });
    await scriptBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await scriptBtn.click();
    const repurposeBtn = page.getByRole("button", { name: /Generate Repurpose Package/i });
    await repurposeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
    await repurposeBtn.click();
    await expect(page.getByText(/LinkedIn/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
    await expect(page.getByText(/YouTube Shorts/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  });
});
