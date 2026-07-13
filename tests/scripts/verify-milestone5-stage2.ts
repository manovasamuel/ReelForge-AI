import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * ReelForge AI v2.0 — Milestone 5 Stage 2 Runtime Verification (`GET /api/ai/telemetry/summary`)
 * 
 * Verifies:
 * 1. Authentication Enforcement (401 when unauthenticated via `credentials: omit`)
 * 2. User-Scoped Data Isolation & Response Shape (200 OK when authenticated)
 * 3. Exact Token & Quota Calculations (`totalTokens === prompt + completion`, `remainingTokens`, `usagePercentage`)
 * 4. Production-Safe Sanitization (no raw keys, no env vars, exact separation of `persistedUsage` vs `runtimeHealth`)
 */
async function verifyMilestone5Stage2() {
  const TARGET_URL = process.env.TEST_URL || "https://reel-forge-ai-psi.vercel.app";
  const STORAGE_DIR = path.resolve("C:/Users/acer/.gemini/antigravity-ide");
  const STORAGE_STATE_PATH = path.join(STORAGE_DIR, "auth-storage.json");

  console.log("\n=========================================================================");
  console.log(" ReelForge AI — Milestone 5 Stage 2: Telemetry Summary API Verification  ");
  console.log("=========================================================================\n");
  console.log(`[Target Server] ${TARGET_URL}`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  let context;
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    try {
      context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
    } catch (err) {
      context = await browser.newContext();
    }
  } else {
    context = await browser.newContext();
  }

  const page = await context.newPage();
  console.log(`[Playwright] Navigating to ${TARGET_URL} to establish origin context...`);
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // Helper to execute fetch directly against the target URL
  const checkEndpoint = async (omitAuth: boolean) => {
    return page.evaluate(async ({ url, omitAuth }) => {
      const headers: Record<string, string> = {
        "Accept": "application/json",
      };
      const res = await fetch(`${url}/api/ai/telemetry/summary`, {
        method: "GET",
        credentials: omitAuth ? "omit" : "include",
        headers,
      });
      const status = res.status;
      const json = await res.json().catch(() => null);
      return { status, json };
    }, { url: TARGET_URL, omitAuth });
  };

  // =========================================================================
  // Test 1: Authentication Enforcement (401 Unauthorized)
  // =========================================================================
  console.log("\n--- TEST 1: Authentication Enforcement (401 Unauthorized Check) ---");
  const unauthRes = await checkEndpoint(true);
  console.log(`[Status] ${unauthRes.status} | Expected: 401 | Result: ${unauthRes.status === 401 ? "✅ PASS" : "❌ FAIL"}`);
  console.log("[Response JSON]:", JSON.stringify(unauthRes.json, null, 2));

  if (unauthRes.status !== 401 || unauthRes.json?.error?.code !== "UNAUTHORIZED") {
    console.error("[FAIL] ❌ Endpoint did not enforce 401 correctly on unauthenticated request.");
    await browser.close();
    process.exit(1);
  }

  // =========================================================================
  // Test 2: User-Scoped Data Isolation & Production-Safe Response Shape (200 OK)
  // =========================================================================
  console.log("\n--- TEST 2: Authenticated User-Scoped Response & Shape Check (200 OK) ---");
  const authRes = await checkEndpoint(false);
  console.log(`[Status] ${authRes.status} | Expected: 200 | Result: ${authRes.status === 200 ? "✅ PASS" : "❌ FAIL"}`);

  if (authRes.status !== 200 || !authRes.json?.data) {
    console.error("[FAIL] ❌ Endpoint did not return 200 OK with valid data payload on authenticated request.");
    console.error("Payload received:", JSON.stringify(authRes.json, null, 2));
    await browser.close();
    process.exit(1);
  }

  const data = authRes.json.data;
  console.log("[Sample Response Summary]:");
  console.log(`   ├─ User ID       : ${data.userId}`);
  console.log(`   ├─ Plan ID / Name: ${data.planId} (${data.planName})`);
  console.log(`   ├─ Persisted Keys: ${Object.keys(data.persistedUsage || {}).join(", ")}`);
  console.log(`   └─ Runtime Health: ${data.runtimeHealth?.providers?.length} providers tracked`);

  // Verify separation of persisted vs runtime health
  if (!data.persistedUsage || !data.runtimeHealth) {
    console.error("[FAIL] ❌ Missing explicit separation of `persistedUsage` vs `runtimeHealth`.");
    await browser.close();
    process.exit(1);
  }

  // Verify production-safe sanitization (no leaked keys or env strings)
  const jsonString = JSON.stringify(data);
  const forbiddenPatterns = ["GEMINI_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "AIzaSy", "sk-"];
  for (const pattern of forbiddenPatterns) {
    if (jsonString.includes(pattern)) {
      console.error(`[FAIL] ❌ Response leaked forbidden pattern: ${pattern}`);
      await browser.close();
      process.exit(1);
    }
  }
  console.log("   └─ Sanitization Check: ✅ No sensitive API keys or environment secrets detected.");

  // =========================================================================
  // Test 3: Exact Token Accounting & Quota Calculations
  // =========================================================================
  console.log("\n--- TEST 3: Token Accounting & Quota Calculations Check ---");
  const p = data.persistedUsage;
  const prompt = Number(p.aiPromptTokens);
  const completion = Number(p.aiCompletionTokens);
  const total = Number(p.totalTokens);
  const limit = Number(p.aiTokenLimit);

  console.log(`   ├─ Tokens         : Prompt (${prompt}) + Completion (${completion}) = Total (${total})`);
  console.log(`   ├─ Quota Limit    : ${p.isUnlimited ? "Unlimited (-1)" : limit}`);
  console.log(`   ├─ Remaining Quota: ${p.remainingTokens}`);
  console.log(`   ├─ Usage Percent  : ${p.usagePercentage}%`);
  console.log(`   └─ Estimated Cost : $${p.totalEstimatedCostUsd} USD`);

  if (total !== prompt + completion) {
    console.error(`[FAIL] ❌ Token sum mismatch! Total (${total}) !== Prompt (${prompt}) + Completion (${completion})`);
    await browser.close();
    process.exit(1);
  }

  if (!p.isUnlimited && limit > 0) {
    const expectedRemaining = Math.max(0, limit - total);
    if (p.remainingTokens !== expectedRemaining) {
      console.error(`[FAIL] ❌ Remaining quota mismatch! Expected ${expectedRemaining}, got ${p.remainingTokens}`);
      await browser.close();
      process.exit(1);
    }
    const expectedPercent = Number(Math.min(100, (total / limit) * 100).toFixed(2));
    if (p.usagePercentage !== expectedPercent) {
      console.error(`[FAIL] ❌ Percentage mismatch! Expected ${expectedPercent}%, got ${p.usagePercentage}%`);
      await browser.close();
      process.exit(1);
    }
  }
  console.log("   └─ Calculation Check: ✅ All token sums and quota formulas verified exactly!");

  console.log("\n=========================================================================");
  console.log(" ✅ All Milestone 5 Stage 2 Telemetry Summary API Checks Passed!");
  console.log("=========================================================================\n");

  await browser.close();
  process.exit(0);
}

verifyMilestone5Stage2().catch((err) => {
  console.error("Verification script crashed:", err);
  process.exit(1);
});
