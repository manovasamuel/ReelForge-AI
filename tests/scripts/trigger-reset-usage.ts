import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
const STORAGE_STATE_PATH = path.resolve("C:/Users/acer/.gemini/antigravity-ide/auth-storage.json");

async function executeResetAndVerify() {
  console.log("=== Launching Playwright to execute and verify one-time usage counter reset ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();

  // 1. Navigate to PROD to warm up cookies/context
  await page.goto(PROD_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  // 2. Trigger POST /api/admin/reset-usage
  console.log("\n1. Triggering POST /api/admin/reset-usage...");
  const resetResponse = await page.request.post(`${PROD_URL}/api/admin/reset-usage`);
  const resetResult = await resetResponse.json();

  console.log("Reset Endpoint Status:", resetResponse.status());
  console.log("Reset Endpoint Payload:", JSON.stringify(resetResult, null, 2));

  // 3. Verify immediately with GET /api/billing/summary
  console.log("\n2. Verifying restored budget with GET /api/billing/summary...");
  const billingResponse = await page.request.get(`${PROD_URL}/api/billing/summary`);
  const billingResult = await billingResponse.json();

  console.log("Billing Summary Status:", billingResponse.status());
  console.log("Billing Summary Usage Object:", JSON.stringify(billingResult?.data?.usage || billingResult, null, 2));

  // Write verification report artifact locally
  fs.writeFileSync(
    path.resolve("tests/scripts/reset-verification-output.json"),
    JSON.stringify({ resetResult, billingResult }, null, 2)
  );

  await browser.close();
}

executeResetAndVerify().catch(console.error);
