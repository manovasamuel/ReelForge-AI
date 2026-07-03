import { test, expect } from "@playwright/test";
import { FULL_PIPELINE_TIMEOUT, API_TIMEOUT } from "./helpers/fixtures";

/**
 * Full Pipeline — single sequential test covering all 9 phases.
 * Uses one shared page and one continuous session to avoid redundant
 * phase repetition across individual tests.
 */

const INSTAGRAM_URL = "https://www.instagram.com/cristiano";

test.describe("Studio — Full Pipeline (Phases 1–9)", () => {
  test.setTimeout(FULL_PIPELINE_TIMEOUT);

  test("Execute complete Phase 1–9 workflow sequentially", async ({ page }) => {
    await test.step("Phase 1: Profile Analysis", async () => {
      await page.goto("/profiles");
      await page.waitForLoadState("networkidle");
      await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
      await page.locator("#analyze-button").click();
      await expect(page.getByText(/Instagram Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
    });

    await test.step("Phase 2: Brand Intelligence", async () => {
      await expect(page.getByText(/Brand Intelligence Report/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
    });

    await test.step("Phase 3: Competitor Discovery Radar", async () => {
      await expect(page.getByText(/Competitor Discovery Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
    });

    await test.step("Phase 4: Competitor Analysis", async () => {
      const analyzeBtn = page.getByRole("button", { name: /Analyze Competitor/i }).first();
      await expect(analyzeBtn).toBeVisible({ timeout: API_TIMEOUT });
      await analyzeBtn.click();
      await expect(page.getByText(/Business Summary Blueprint/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
    });

    await test.step("Phase 5: Content Library & Media Engine", async () => {
      const collectBtn = page.getByRole("button", { name: /Collect Content/i });
      await expect(collectBtn).toBeVisible({ timeout: API_TIMEOUT });
      await collectBtn.click();
      await expect(page.getByText(/Content Library Benchmarks/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
    });

    await test.step("Phase 6: Batch Content Intelligence Teardown", async () => {
      const selectTopBtn = page.getByRole("button", { name: /Select Top/i });
      await expect(selectTopBtn).toBeVisible({ timeout: API_TIMEOUT });
      await selectTopBtn.click();
      const analyzeSelectedBtn = page.getByRole("button", { name: /Analyze Selected Content/i });
      await expect(analyzeSelectedBtn).toBeEnabled({ timeout: API_TIMEOUT });
      await analyzeSelectedBtn.click();
      await expect(page.getByText(/Batch Content Intelligence Teardown/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
    });

    await test.step("Phase 7: Unified Winning Content DNA Blueprint", async () => {
      const dnaBtn = page.getByRole("button", { name: /Generate Content DNA/i });
      await expect(dnaBtn).toBeVisible({ timeout: API_TIMEOUT * 2 });
      await dnaBtn.click();
      await expect(page.getByText(/Unified Winning Content DNA Blueprint/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
    });

    await test.step("Phase 8: Master Production Package", async () => {
      const scriptBtn = page.getByRole("button", { name: /Generate Script/i });
      await expect(scriptBtn).toBeVisible({ timeout: API_TIMEOUT * 2 });
      await scriptBtn.click();
      await expect(page.getByText(/Phase 8 Master Production Package/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
    });

    await test.step("Phase 9: Omnichannel Repurpose Engine", async () => {
      const repurposeBtn = page.getByRole("button", { name: /Proceed to Repurpose Engine/i });
      await expect(repurposeBtn).toBeVisible({ timeout: API_TIMEOUT * 2 });
      await repurposeBtn.click();
      await expect(page.getByText(/Phase 9 Omnichannel Engine/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
    });
  });
});


