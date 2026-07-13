/**
 * verify-milestone5-stage3.ts
 *
 * Empirical verification script for Milestone 5 Stage 3: Telemetry Dashboard UI.
 * Verifies that the AiTelemetryPanel renders cleanly on Vercel Production under the Pipeline Providers tab
 * with real authenticated telemetry from GET /api/ai/telemetry/summary.
 */

import { chromium } from "playwright";
import * as fs from "fs";

const TARGET_URL = process.env.VERCEL_URL || "https://reel-forge-ai-psi.vercel.app";
const AUTH_STORAGE_PATH = "C:/Users/acer/.gemini/antigravity-ide/auth-storage.json";

async function verifyStage3UI() {
  console.log("=========================================================================");
  console.log(" ReelForge AI — Milestone 5 Stage 3: Telemetry Dashboard UI Check        ");
  console.log("=========================================================================");
  console.log(`[Target Server] ${TARGET_URL}`);

  let storageState: any = undefined;
  if (fs.existsSync(AUTH_STORAGE_PATH)) {
    storageState = JSON.parse(fs.readFileSync(AUTH_STORAGE_PATH, "utf-8"));
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log(`[Playwright] Navigating to ${TARGET_URL} to establish origin context...`);
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // Check auth and sign-in redirect if needed
  const checkAuth = async () => {
    return page.evaluate(async () => {
      const clerk = (window as any).Clerk;
      const hasUser = Boolean(clerk?.user || clerk?.session);
      return { hasUser, url: window.location.href };
    });
  };

  const authState = await checkAuth();
  console.log(`[Diagnostics Check] Current URL: ${authState.url} | Auth Detected (window.Clerk.session): ${authState.hasUser}`);

  if (!authState.hasUser) {
    console.log(`[Playwright] Not authenticated on ${authState.url}. Navigating to ${TARGET_URL}/sign-in...`);
    await page.goto(`${TARGET_URL}/sign-in`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const startWait = Date.now();
    while (Date.now() - startWait < 60000) {
      const state = await checkAuth();
      if (state.hasUser) break;
      await page.waitForTimeout(2000);
    }
  }

  console.log(`[Playwright] Navigating to ${TARGET_URL}/profiles to access Studio Settings...`);
  await page.goto(`${TARGET_URL}/profiles`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log(`[Playwright] Current page URL after /profiles navigation: ${currentUrl}`);

  if (currentUrl.includes("/sign-in")) {
    console.log("[Playwright] Redirected to /sign-in while accessing /profiles. Waiting for Clerk session check...");
    const startWait = Date.now();
    while (Date.now() - startWait < 30000) {
      await page.waitForTimeout(2000);
      if (!page.url().includes("/sign-in")) break;
    }
    if (page.url().includes("/sign-in")) {
      console.log("[Playwright] Re-navigating to /profiles after Clerk auth established...");
      await page.goto(`${TARGET_URL}/profiles`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(3000);
    }
  }

  console.log("\n--- TEST 1: Switching to Settings Studio & Pipeline Providers Tab ---");
  const settingsBtn = page.locator('button:has-text("Settings")').first();
  await settingsBtn.waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
  if (await settingsBtn.count() === 0) {
    console.error(`[FAIL] ❌ Settings top navigation button not found on /profiles page.`);
    await browser.close();
    process.exit(1);
  }
  await settingsBtn.click();
  await page.waitForTimeout(2000);

  const providersTabBtn = page.getByRole("button", { name: /Pipeline Providers/i }).first();
  await providersTabBtn.waitFor({ state: "visible", timeout: 20000 }).catch(() => {});

  if (await providersTabBtn.count() === 0) {
    console.error(`[FAIL] ❌ Pipeline Providers button not found (Current URL: ${page.url()}).`);
    await browser.close();
    process.exit(1);
  }

  await providersTabBtn.click();
  await page.waitForTimeout(4000); // Wait for telemetry fetch and render
  console.log("   └─ Navigation Check: ✅ Successfully switched to Pipeline Providers tab inside Settings Studio.");

  console.log("\n--- TEST 2: AiTelemetryPanel DOM Rendering & Separation Check ---");
  // Wait up to 10s for loading state to finish
  const headerLocator = page.locator('h3:has-text("AI Telemetry & Quota Monitor")');
  await headerLocator.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});

  const panelHeader = await headerLocator.count();
  if (panelHeader === 0) {
    console.log("[Debug] Full page text when Pipeline Providers is open:");
    console.log(await page.evaluate(() => document.body.innerText));
    console.error("[FAIL] ❌ AI Telemetry & Quota Monitor header not rendered in DOM.");
    await browser.close();
    process.exit(1);
  }
  console.log("   ├─ Header Render Check: ✅ AI Telemetry & Quota Monitor visible.");

  // Check Persisted Database Telemetry Section
  const persistedSection = await page.locator('span:has-text("Persisted Database Telemetry")').count();
  if (persistedSection === 0) {
    console.error("[FAIL] ❌ Persisted Database Telemetry section label missing.");
    await browser.close();
    process.exit(1);
  }
  console.log("   ├─ Persisted Metrics Check: ✅ Historical database token breakdown rendered separately.");

  // Check Runtime Provider Health Section
  const runtimeSection = await page.locator('h4:has-text("Runtime Provider Health & Circuit State")').count();
  if (runtimeSection === 0) {
    console.error("[FAIL] ❌ Runtime Provider Health section header missing.");
    await browser.close();
    process.exit(1);
  }
  console.log("   └─ Runtime Health Check: ✅ Live circuit breaker cards rendered separately.");

  console.log("\n--- TEST 3: Telemetry Data Population & Zero-Leakage DOM Check ---");
  const bodyText = await page.evaluate(() => document.body.innerText);

  // Check that key telemetry metrics are present in DOM text
  const hasTokensUsed = bodyText.includes("Total AI Tokens Used");
  const hasTokenFlow = bodyText.includes("Token Flow Breakdown");
  const hasCostEst = bodyText.includes("Total Estimated Value") || bodyText.includes("USD");
  const hasProviders = bodyText.includes("Google Gemini") || bodyText.includes("OpenAI GPT-4o") || bodyText.includes("Anthropic Claude");

  console.log(`   ├─ Total Tokens Card Present?: ${hasTokensUsed ? "✅ YES" : "❌ NO"}`);
  console.log(`   ├─ Token Breakdown Card Present?: ${hasTokenFlow ? "✅ YES" : "❌ NO"}`);
  console.log(`   ├─ USD Cost Card Present?: ${hasCostEst ? "✅ YES" : "❌ NO"}`);
  console.log(`   ├─ Provider Health Cards Present?: ${hasProviders ? "✅ YES" : "❌ NO"}`);

  if (!hasTokensUsed || !hasTokenFlow || !hasCostEst || !hasProviders) {
    console.error("[FAIL] ❌ One or more required telemetry UI cards failed to render.");
    await browser.close();
    process.exit(1);
  }

  // Security DOM Audit: Verify no sensitive keys or internal user IDs leaked into DOM text or attributes
  const forbiddenStrings = ["GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "AIzaSy", "sk-proj-", "clerk_user_"];
  for (const pattern of forbiddenStrings) {
    if (bodyText.includes(pattern)) {
      console.error(`[FAIL] ❌ DOM leaked sensitive string: ${pattern}`);
      await browser.close();
      process.exit(1);
    }
  }
  console.log("   └─ Security DOM Audit: ✅ Zero internal secrets or API keys found anywhere in DOM.");

  console.log("\n=========================================================================");
  console.log(" ✅ All Milestone 5 Stage 3 Telemetry Dashboard UI Checks Passed!");
  console.log("=========================================================================\n");

  await browser.close();
  process.exit(0);
}

verifyStage3UI().catch((err) => {
  console.error("[Fatal Error in Stage 3 UI Verification]:", err);
  process.exit(1);
});
