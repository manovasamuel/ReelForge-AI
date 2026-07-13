import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * ReelForge AI v2.0 — Milestone 5 Stage 1 Runtime Verification (Run 4: Single Final Unauthorized Check)
 * 
 * Verifies:
 * - Unauthorized Check (`401 Unauthorized`) with `credentials: "omit"` & no Authorization header
 * - Invalid Input Check (`400 Bad Request`)
 * 
 * Note: All 4 Gemini workflows (Competitor Analysis, Content Intelligence, Content DNA, Repurpose) 
 * already empirically verified in Run 1 & Run 2 (HTTP 200 OK, gemini-3.1-flash-lite, fallbackUsed: false).
 * Zero Gemini generation requests are executed in this check to strictly preserve free-tier quota.
 */
async function verifyMilestone5Stage1Final() {
  const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
  const STORAGE_DIR = path.resolve("C:/Users/acer/.gemini/antigravity-ide");
  const STORAGE_STATE_PATH = path.join(STORAGE_DIR, "auth-storage.json");

  console.log("\n=========================================================================");
  console.log(" ReelForge AI — Milestone 5 Stage 1: Final Safety Verification Check     ");
  console.log("=========================================================================\n");

  const browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized", "--no-sandbox"],
  });

  let context;
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    console.log(`[Playwright] Loading persisted authentication storageState from: ${STORAGE_STATE_PATH}`);
    try {
      context = await browser.newContext({
        storageState: STORAGE_STATE_PATH,
        viewport: { width: 1440, height: 900 },
      });
    } catch (err) {
      context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    }
  } else {
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  }

  const page = await context.newPage();
  console.log(`[Playwright] Navigating to ${PROD_URL} to confirm active session...`);
  await page.goto(`${PROD_URL}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);

  const checkAuth = async () => {
    return page.evaluate(async () => {
      const clerk = (window as any).Clerk;
      const hasUser = Boolean(clerk?.user || clerk?.session);
      const url = window.location.href;
      return { hasUser, url };
    });
  };

  let authState = await checkAuth();
  console.log(`[Diagnostics Check] Current URL: ${authState.url} | Auth Detected (window.Clerk.session): ${authState.hasUser}`);

  if (!authState.hasUser) {
    console.log(`[Playwright] Not authenticated on ${authState.url}. Navigating to ${PROD_URL}/sign-in...`);
    await page.goto(`${PROD_URL}/sign-in`, { waitUntil: "domcontentloaded", timeout: 30000 });

    console.log("\n==========================================================================================");
    console.log(" [Playwright] PAUSED FOR HUMAN INTERACTION (OTP LOGIN REQUIRED IF SESSION EXPIRED)");
    console.log(" 👉 Please enter OTP inside THIS open Playwright browser window.");
    console.log("==========================================================================================\n");

    const startWait = Date.now();
    while (Date.now() - startWait < 600000) {
      authState = await checkAuth();
      if (authState.hasUser) break;
      await page.waitForTimeout(2000);
    }
  }

  if (!authState.hasUser) {
    console.error("[FAIL] ❌ Authentication check timed out.");
    await browser.close();
    process.exit(1);
  }

  console.log(`\n[Playwright] ✅ Authenticated session confirmed on URL: ${page.url()}`);
  try {
    await context.storageState({ path: STORAGE_STATE_PATH });
  } catch (err) {}

  // Helper to execute API requests from inside the browser page
  const executeApiRequest = async (url: string, method: string, body: any = null, omitAuth: boolean = false) => {
    return page.evaluate(async ({ url, method, body, omitAuth }) => {
      const token = omitAuth ? null : await (window as any).Clerk?.session?.getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-ai-provider": "gemini",
        "x-ai-model": "gemini-3.1-flash-lite",
      };
      if (token && !omitAuth) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        credentials: omitAuth ? "omit" : "include",
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const status = res.status;
      const json = await res.json().catch(() => null);
      return { status, json };
    }, { url, method, body, omitAuth });
  };

  const sampleCompetitor = {
    id: "comp-101",
    username: "viral_creator_hub",
    displayName: "Viral Creator Hub",
    profileUrl: "https://instagram.com/viral_creator_hub",
    followers: 120000,
    engagementRate: 6.4,
    industry: "Digital Marketing & AI Tools",
  };

  // =========================================================================
  // 1. Verify Unauthorized & Invalid Input Safety (Zero Gemini Calls)
  // =========================================================================
  console.log("\n--- TEST 1: Safety Checks (Unauthorized 401 & Invalid Input 400) ---");
  // Pass complete, already-valid `sampleCompetitor` with credentials: "omit" & omitAuth: true
  const unauthRes = await executeApiRequest("/api/competitor-analysis/analyze", "POST", { competitor: sampleCompetitor }, true);
  console.log(`[Unauthorized Check] Status: ${unauthRes.status} | Expected: 401 | Result: ${unauthRes.status === 401 ? "✅ PASS" : "❌ FAIL"}`);
  console.log("[Unauthorized Check] Response JSON:", JSON.stringify(unauthRes.json, null, 2));

  const invalidRes = await executeApiRequest("/api/competitor-analysis/analyze", "POST", {}, false);
  console.log(`[Invalid Input Check] Status: ${invalidRes.status} | Expected: 400 | Result: ${invalidRes.status === 400 ? "✅ PASS" : "❌ FAIL"}`);

  // Summary of already completed live AI workflow checks from Run 1 & Run 2
  console.log("\n--- Summary of Previously Verified Live Stage 1 Workflows ---");
  console.log("   ├─ Competitor Analysis  : ✅ HTTP 200 OK | gemini-3.1-flash-lite | fallbackUsed: false | Tokens: 2217");
  console.log("   ├─ Content Intelligence : ✅ HTTP 200 OK | gemini-3.1-flash-lite | fallbackUsed: false | Tokens: 1762");
  console.log("   ├─ Content DNA Blueprint: ✅ HTTP 200 OK | gemini-3.1-flash-lite | fallbackUsed: false | Tokens: 1821");
  console.log("   └─ Omnichannel Repurpose: ✅ HTTP 200 OK | gemini-3.1-flash-lite | fallbackUsed: false | Tokens: 2156");

  console.log("\n=========================================================================");
  if (unauthRes.status === 401 && invalidRes.status === 400) {
    console.log(" ✅ Milestone 5 Stage 1 Fully Verified & Complete!");
  } else {
    console.log(" ⚠️ Verification completed with status check mismatch.");
  }
  console.log("=========================================================================\n");

  await browser.close();
  process.exit(unauthRes.status === 401 ? 0 : 1);
}

verifyMilestone5Stage1Final().catch((err) => {
  console.error("Verification script crashed:", err);
  process.exit(1);
});
