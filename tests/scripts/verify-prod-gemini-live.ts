import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * ReelForge AI — Live Production Gemini & AI Health Automated Verification Script
 * 
 * Architecture:
 * 1. Uses a unified Playwright browser context (`page`) for both authentication and verification.
 * 2. Persists and loads `storageState` (`auth-storage.json`) so repeated OTP logins are avoided.
 * 3. Executes empirical production verification once session is confirmed active on `page`.
 */
async function verifyLiveProductionGemini() {
  const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
  const STORAGE_DIR = path.resolve("C:/Users/acer/.gemini/antigravity-ide");
  const STORAGE_STATE_PATH = path.join(STORAGE_DIR, "auth-storage.json");

  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  console.log("\n=========================================================================");
  console.log(" ReelForge AI v2.0 — Milestone 4: Live Production Gemini E2E Verification ");
  console.log("=========================================================================\n");

  console.log("[Playwright] Launching headed Chromium browser instance...");
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
      console.warn("[Playwright] Failed to load storageState, initializing fresh context...");
      context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    }
  } else {
    console.log("[Playwright] No existing storageState found. Initializing fresh context...");
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  }

  const page = await context.newPage();
  console.log(`[Playwright] Navigating to ${PROD_URL} to verify active session inside this Playwright window...`);
  await page.goto(`${PROD_URL}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);

  // Helper to check whether window.Clerk session or user is active right inside `page`
  const checkAuth = async () => {
    return page.evaluate(async () => {
      const clerk = (window as any).Clerk;
      const hasUser = Boolean(clerk?.user || clerk?.session);
      const url = window.location.href;
      const isOnAuthPage = url.includes("/sign-in") || url.includes("/sign-up");
      return { hasUser, url, isOnAuthPage };
    });
  };

  let authState = await checkAuth();
  console.log(`[Diagnostics Check] Current URL: ${authState.url} | Auth Detected (` + `window.Clerk.session): ${authState.hasUser}`);

  if (!authState.hasUser) {
    if (!authState.isOnAuthPage) {
      console.log(`[Playwright] Not authenticated on ${authState.url}. Navigating to ${PROD_URL}/sign-in inside this window...`);
      await page.goto(`${PROD_URL}/sign-in`, { waitUntil: "domcontentloaded", timeout: 30000 });
    }

    console.log("\n==========================================================================================");
    console.log(" [Playwright] PAUSED FOR HUMAN INTERACTION (CLERK EMAIL OTP IF NEEDED)");
    console.log(" 👉 Please enter your email verification code (OTP) directly inside THIS open Playwright window.");
    console.log(" Playwright is actively checking window.Clerk.session every 2 seconds inside this window...");
    console.log("==========================================================================================\n");

    const startWait = Date.now();
    while (Date.now() - startWait < 600000) {
      authState = await checkAuth();
      const isComplete = authState.hasUser || (!authState.isOnAuthPage && authState.url !== PROD_URL && authState.url !== PROD_URL + "/");

      console.log(
        `[Playwright Polling] URL: ${authState.url} | Auth Detected (` +
        `window.Clerk.session): ${authState.hasUser} | ` +
        `Status: ${isComplete ? "Authentication confirmed! Proceeding..." : "Waiting for OTP login completion in this window..."}`
      );

      if (isComplete) {
        break;
      }
      await page.waitForTimeout(2000);
    }
  }

  if (!authState.hasUser && (authState.isOnAuthPage || authState.url === PROD_URL || authState.url === PROD_URL + "/")) {
    console.error("[FAIL] ❌ Authentication detection timed out after 10 minutes.");
    await browser.close();
    process.exit(1);
  }

  // Save storage state right upon authentication confirmation so future runs do not require OTP!
  console.log(`\n[Playwright] ✅ Authenticated session confirmed on URL: ${page.url()}`);
  try {
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`[Playwright] ✅ Saved storageState to ${STORAGE_STATE_PATH} (Session isolated & persisted).`);
  } catch (err) {
    console.warn("[Playwright] ⚠️ Could not save storageState:", err);
  }

  // =================================================================================
  // Execute Automated Production Verifications using the Unified Authenticated Page
  // =================================================================================

  // 1. Verify /api/ai/health
  console.log("\n[Playwright] 1/3 Querying /api/ai/health using the authenticated browser session...");
  const aiHealthResult = await page.evaluate(async () => {
    const token = await (window as any).Clerk?.session?.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/ai/health", { credentials: "include", headers });
    const status = res.status;
    const json = await res.json().catch(() => null);
    return { status, json };
  });

  console.log(`[/api/ai/health] HTTP Status Code: ${aiHealthResult.status}`);
  if (aiHealthResult.status === 200 && aiHealthResult.json?.data) {
    const geminiStatus = aiHealthResult.json.data.find((p: any) => p.providerId === "gemini");
    console.log("[/api/ai/health] Provider Statuses:", JSON.stringify(aiHealthResult.json.data, null, 2));
    if (geminiStatus?.isAvailable === true) {
      console.log("[PASS] ✅ /api/ai/health reports Gemini provider as AVAILABLE (isAvailable: true).");
    } else {
      console.warn("[WARN] ⚠️ Gemini reports isAvailable: false. Check Vercel API key configuration.");
    }
  } else {
    console.error("[FAIL] ❌ Unexpected /api/ai/health status or payload:", aiHealthResult);
  }

  // 2. Real Gemini Request via POST /api/brand-intelligence/analyze
  console.log("\n[Playwright] 2/3 Executing real Gemini request via POST /api/brand-intelligence/analyze...");
  const sampleProfile = {
    username: "reel_forge_studio",
    display_name: "ReelForge Studio AI",
    bio: "Next-gen AI short-form video script studio for creators and brands.",
    profile_picture_url: null,
    follower_count: 45000,
    following_count: 320,
    post_count: 150,
    category: "Creator Studio",
    external_url: "https://reelforge.ai",
    is_private: false,
    is_verified: true,
    posts: [
      {
        id: "post-1",
        thumbnail_url: null,
        url: null,
        caption: "How to craft viral hooks that stop the scroll using AI data #reelsai #creator",
        likes: 1250,
        comments: 84,
        timestamp: new Date().toISOString(),
        type: "video",
      },
    ],
  };

  const startTime = performance.now();
  const analyzeResult = await page.evaluate(async (profileData) => {
    const token = await (window as any).Clerk?.session?.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-ai-provider": "gemini",
      "x-ai-model": "gemini-3.1-flash-lite",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/brand-intelligence/analyze", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ profile: profileData, aiProvider: "gemini", aiModel: "gemini-3.1-flash-lite" }),
    });
    const status = res.status;
    const json = await res.json().catch(() => null);
    return { status, json };
  }, sampleProfile);
  const clientLatency = Math.round(performance.now() - startTime);

  console.log(`[/api/brand-intelligence/analyze] HTTP Status: ${analyzeResult.status} (${clientLatency}ms RTT)`);
  if (analyzeResult.status === 200 && analyzeResult.json?.data && analyzeResult.json?.telemetry) {
    const telemetry = analyzeResult.json.telemetry;
    console.log("\n=======================================================================");
    console.log("             LIVE GEMINI PRODUCTION EXECUTION REPORT                  ");
    console.log("=======================================================================");
    console.log(`Provider Used      : ${telemetry.provider || telemetry.providerId || "unknown"}`);
    console.log(`Requested Model    : ${telemetry.requestedModel || "unknown"}`);
    console.log(`Executed Model     : ${telemetry.modelUsed || "unknown"}`);
    console.log(`fallbackUsed       : ${telemetry.fallbackUsed === true ? "true (Deterministic Fallback)" : "false (Live Google Gemini)"}`);
    console.log(`Prompt Tokens      : ${telemetry.usage?.promptTokens ?? "N/A"}`);
    console.log(`Completion Tokens  : ${telemetry.usage?.completionTokens ?? "N/A"}`);
    console.log(`Total Tokens       : ${telemetry.usage?.totalTokens ?? "N/A"}`);
    console.log(`Server Latency (ms): ${telemetry.latencyMs ?? "N/A"} ms`);
    console.log(`Estimated USD Cost : $${telemetry.costEstimateUsd ?? "N/A"}`);
    console.log(`Reason / Status    : ${telemetry.reason ?? "OK"}`);
    console.log("=======================================================================\n");

    if (telemetry.fallbackUsed === false && (telemetry.provider === "gemini" || telemetry.providerId === "gemini")) {
      console.log("[PASS] ✅ Live production Gemini API successfully executed without fallback!");
    } else {
      console.warn("[NOTICE] Execution completed via fallback:", telemetry.reason || "unknown");
    }

    // Structured response validation
    const data = analyzeResult.json.data;
    if (data.industry && data.brandType && data.targetAudience && Array.isArray(data.primaryContentPillars)) {
      console.log("[PASS] ✅ Structured response schema validation passed (BrandIntelligenceReport object verified)!");
      console.log(`Sample output -> Industry: "${data.industry}" | Brand Type: "${data.brandType}" | Confidence Score: ${data.confidenceScore}`);
    } else {
      console.error("[FAIL] ❌ Response data failed schema check (missing domain fields):", data);
    }
  } else {
    console.error("[FAIL] ❌ Unexpected analyze status or payload:", analyzeResult);
  }

  // 3. Re-verify /api/v2/health
  console.log("\n[Playwright] 3/3 Verifying public /api/v2/health endpoint...");
  const v2HealthResult = await page.evaluate(async () => {
    const res = await fetch("/api/v2/health");
    return { status: res.status, json: await res.json().catch(() => null) };
  });
  console.log(`[/api/v2/health] HTTP Status: ${v2HealthResult.status}`);
  if (v2HealthResult.status === 200 && v2HealthResult.json?.status === "healthy" && v2HealthResult.json?.database === "connected") {
    console.log("[PASS] ✅ /api/v2/health is healthy & production database is connected.");
  } else {
    console.error("[FAIL] ❌ /api/v2/health verification failed:", v2HealthResult);
  }

  console.log("\n=========================================================================");
  console.log(" Automated Playwright Verification Complete! Closing browser context... ");
  console.log("=========================================================================\n");

  await browser.close();
}

verifyLiveProductionGemini().catch((err) => {
  console.error("Fatal error during automated Playwright verification:", err);
  process.exit(1);
});
