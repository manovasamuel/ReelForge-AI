import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * Stage 3B Phase 4D — Read-Only UsageGuard Diagnostic Investigation
 *
 * Calls production authenticated endpoints:
 *   GET /api/ai/telemetry/summary  → subscription + plan + usage state
 *   GET /api/billing/summary       → plan config + subscription status
 *   GET /api/ai/health             → provider availability (is Gemini available?)
 *
 * No data modification. Read-only.
 */

const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
const STORAGE_STATE_PATH = path.resolve("C:/Users/acer/.gemini/antigravity-ide/auth-storage.json");

async function runDiagnostic() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  Phase 4D — UsageGuard Read-Only Diagnostic                       ║");
  console.log(`║  Target: ${PROD_URL.padEnd(55)}║`);
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.error("[ABORT] No auth-storage.json found.");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(PROD_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);

  const authCheck = await page.evaluate(() => ({
    hasUser: Boolean((window as any).Clerk?.user || (window as any).Clerk?.session),
    url: window.location.href,
  }));

  if (!authCheck.hasUser) {
    console.error(`[ABORT] Clerk session not active on ${authCheck.url}.`);
    await browser.close();
    process.exit(1);
  }
  console.log(`[Auth] ✅ Session active.\n`);

  // ── PROBE 1: /api/ai/telemetry/summary ────────────────────────────────
  console.log("═".repeat(66));
  console.log("  PROBE 1 — GET /api/ai/telemetry/summary");
  console.log("═".repeat(66));

  const telemetryResult = await page.evaluate(async () => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/ai/telemetry/summary", { credentials: "include", headers });
    return { status: res.status, json: await res.json().catch(() => null) };
  });

  if (telemetryResult.status !== 200) {
    console.error(`  [ERROR] HTTP ${telemetryResult.status}: ${JSON.stringify(telemetryResult.json)}`);
  } else {
    const d = telemetryResult.json;
    const ps = d?.persistedUsage;
    const quota = d?.quotaStatus;
    const rh = d?.runtimeHealth;

    console.log("\n  ── Subscription & Plan ─────────────────────────────────────");
    console.log(`  Plan ID:              ${ps?.planId ?? "MISSING"}`);
    console.log(`  Plan Name:            ${ps?.planName ?? "MISSING"}`);
    console.log(`  Subscription Status:  ${ps?.subscriptionStatus ?? "MISSING"}`);

    console.log("\n  ── AI Token Usage ──────────────────────────────────────────");
    console.log(`  Prompt Tokens Used:   ${ps?.promptTokensUsed ?? "MISSING"}`);
    console.log(`  Completion Tokens:    ${ps?.completionTokensUsed ?? "MISSING"}`);
    console.log(`  Total Tokens Used:    ${ps?.totalTokensUsed ?? "MISSING"}`);
    console.log(`  Monthly AI Limit:     ${ps?.monthlyAiTokenLimit ?? "MISSING"}`);
    console.log(`  Remaining Tokens:     ${quota?.remainingTokens ?? "MISSING"}`);
    console.log(`  Usage Percentage:     ${quota?.usagePercentage ?? "MISSING"}%`);
    console.log(`  Quota Exhausted:      ${quota?.isExceeded ?? "UNKNOWN"}`);

    console.log("\n  ── Model Access ────────────────────────────────────────────");
    const modelAccess: string[] = ps?.modelAccess ?? [];
    console.log(`  Accessible models:    ${modelAccess.join(", ")}`);
    console.log(`  gemini-3.1-flash-lite in modelAccess: ${modelAccess.includes("gemini-3.1-flash-lite")}`);

    console.log("\n  ── Scraper Usage ───────────────────────────────────────────");
    console.log(`  Scraper Calls Used:   ${ps?.scraperCallsUsed ?? "MISSING"}`);
    console.log(`  Monthly Scraper Limit: ${ps?.monthlyScraperLimit ?? "MISSING"}`);

    console.log("\n  ── AI Provider Runtime Health ──────────────────────────────");
    if (Array.isArray(rh)) {
      for (const p of rh) {
        console.log(
          `  [${String(p.providerId).padEnd(14)}] available=${String(p.isAvailable).padEnd(5)} | healthy=${String(p.isHealthy).padEnd(5)} | circuit=${p.circuitState} | failures=${p.consecutiveFailures}`
        );
      }
    }

    console.log("\n  ── Full Raw Telemetry Response ─────────────────────────────");
    console.log(JSON.stringify(d, null, 2));
  }

  // ── PROBE 2: /api/billing/summary ─────────────────────────────────────
  console.log("\n" + "═".repeat(66));
  console.log("  PROBE 2 — GET /api/billing/summary");
  console.log("═".repeat(66));

  const billingResult = await page.evaluate(async () => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/billing/summary", { credentials: "include", headers });
    return { status: res.status, json: await res.json().catch(() => null) };
  });

  if (billingResult.status !== 200) {
    console.error(`  [ERROR] HTTP ${billingResult.status}: ${JSON.stringify(billingResult.json)}`);
  } else {
    console.log("\n  ── Full Billing Summary Response ───────────────────────────");
    console.log(JSON.stringify(billingResult.json, null, 2));
  }

  // ── PROBE 3: /api/ai/health ───────────────────────────────────────────
  console.log("\n" + "═".repeat(66));
  console.log("  PROBE 3 — GET /api/ai/health (Provider Availability)");
  console.log("═".repeat(66));

  const aiHealthResult = await page.evaluate(async () => {
    const res = await fetch("/api/ai/health", { credentials: "include" });
    return { status: res.status, json: await res.json().catch(() => null) };
  });

  if (aiHealthResult.status !== 200) {
    console.error(`  [ERROR] HTTP ${aiHealthResult.status}`);
  } else {
    const providers: any[] = aiHealthResult.json?.data ?? [];
    for (const p of providers) {
      console.log(
        `  [${String(p.providerId).padEnd(14)}] isAvailable=${String(p.isAvailable).padEnd(5)} | isHealthy=${String(p.isHealthy).padEnd(5)} | circuit=${p.circuitState} | failures=${p.consecutiveFailures}`
      );
    }
    const gemini = providers.find((p) => p.providerId === "gemini");
    console.log(`\n  KEY DIAGNOSTIC — Gemini Provider:`);
    console.log(`    isAvailable:         ${gemini?.isAvailable}  (false = GEMINI_API_KEY missing in runtime)`);
    console.log(`    isHealthy:           ${gemini?.isHealthy}  (false = circuit breaker tripped)`);
    console.log(`    circuitState:        ${gemini?.circuitState}`);
    console.log(`    consecutiveFailures: ${gemini?.consecutiveFailures}`);
    console.log(`\n  Full /api/ai/health response:`);
    console.log(JSON.stringify(aiHealthResult.json, null, 2));
  }

  console.log("\n" + "═".repeat(66));
  console.log("  DIAGNOSTIC COMPLETE — Read-only, no data modified");
  console.log("═".repeat(66) + "\n");

  await browser.close();
  process.exit(0);
}

runDiagnostic().catch((err) => {
  console.error("[FATAL] Diagnostic error:", err);
  process.exit(1);
});
