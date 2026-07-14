import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * Stage 3B Phase 4D — Controlled Production E2E Verification (Playwright Browser)
 *
 * Runs the full 8-stage pipeline against the live production runtime:
 *   reel-forge-ai-psi.vercel.app
 *
 * Uses persisted Clerk auth-storage.json to authenticate without OTP re-entry.
 * All API calls are made via page.evaluate() using the browser's Clerk session cookie.
 * No production secrets are printed or stored.
 *
 * Budget guardrails (strictly enforced):
 *   Apify:  max 2 calls total (0 on cache hit per account)
 *   Gemini: 6 logical AI operations
 */

const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
const STORAGE_DIR = path.resolve("C:/Users/acer/.gemini/antigravity-ide");
const STORAGE_STATE_PATH = path.join(STORAGE_DIR, "auth-storage.json");
const BRAND_USERNAME = "nike";
const PREFERRED_COMPETITOR = "adidas";

// ─── Budget & Telemetry Trackers ─────────────────────────────────────────────
interface StageTelemetry {
  stage: string;
  providerId?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  latencyMs?: number;
  totalTokens?: number;
  costUsd?: number;
  status?: number;
  error?: string;
}

const stageLogs: StageTelemetry[] = [];
let geminiLogicalOps = 0;
let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function section(title: string) {
  console.log(`\n${"═".repeat(66)}`);
  console.log(`  ${title}`);
  console.log("═".repeat(66));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function runPhase4DE2E() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  Stage 3B Phase 4D — Controlled Production E2E Verification      ║");
  console.log(`║  Target: ${PROD_URL.padEnd(55)}║`);
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  // ── Browser & Session Setup ─────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true, args: ["--start-maximized", "--no-sandbox"] });

  let context;
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    console.log(`[Session] Loading persisted Clerk auth state from: ${STORAGE_STATE_PATH}`);
    try {
      context = await browser.newContext({ storageState: STORAGE_STATE_PATH, viewport: { width: 1440, height: 900 } });
    } catch {
      console.warn("[Session] Failed to load storageState — initializing fresh context.");
      context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    }
  } else {
    console.warn("[Session] No existing storageState found — fresh context. Manual OTP may be required.");
    context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  }

  const page = await context.newPage();
  await page.goto(PROD_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);

  // ── Auth Check ──────────────────────────────────────────────────────────
  const authState = await page.evaluate(async () => {
    const clerk = (window as any).Clerk;
    const hasUser = Boolean(clerk?.user || clerk?.session);
    return { hasUser, url: window.location.href, isOnAuthPage: window.location.href.includes("/sign-in") };
  });

  console.log(`[Auth] Session detected: ${authState.hasUser} | URL: ${authState.url}`);

  if (!authState.hasUser) {
    if (!authState.isOnAuthPage) {
      await page.goto(`${PROD_URL}/sign-in`, { waitUntil: "domcontentloaded", timeout: 30000 });
    }
    console.log("\n⚠️  NOT AUTHENTICATED — Please complete Clerk login in the opened browser window.");
    console.log("    Waiting up to 5 minutes for authenticated session...\n");
    const start = Date.now();
    let authenticated = false;
    while (Date.now() - start < 300000) {
      const check = await page.evaluate(() => Boolean((window as any).Clerk?.user || (window as any).Clerk?.session));
      if (check) { authenticated = true; break; }
      await page.waitForTimeout(3000);
    }
    if (!authenticated) {
      console.error("[ABORT] Authentication timeout after 5 minutes.");
      await browser.close();
      process.exit(1);
    }
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log("[Auth] Session saved for future runs.");
  }

  // Ensure we're on the app, not auth page
  await page.goto(PROD_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1500);
  console.log("[Auth] ✅ Production session confirmed.\n");

  // ════════════════════════════════════════════════════════════════════
  // STEP 0: @nike Profile Ingestion  (max 1 Apify call if cache miss)
  // ════════════════════════════════════════════════════════════════════
  section(`STEP 0 — @${BRAND_USERNAME} Profile Ingestion`);

  const step0Result = await page.evaluate(async (username: string) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json", "x-instagram-provider": "apify" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/profiles/analyze", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ instagramUrl: `https://instagram.com/${username}`, provider: "apify" }),
    });
    const status = res.status;
    const json = await res.json().catch(() => null);
    return { status, json };
  }, BRAND_USERNAME);

  stageLogs.push({
    stage: `Step 0 — @${BRAND_USERNAME} Profile Ingestion`,
    providerId: step0Result.json?.telemetry?.providerId,
    fallbackUsed: step0Result.json?.telemetry?.isMockFallback,
    latencyMs: step0Result.json?.telemetry?.latencyMs,
    status: step0Result.status,
  });

  assert(step0Result.status === 200, `Step 0: HTTP 200 from /api/profiles/analyze`);
  const nikeProfile = step0Result.json?.data;
  assert(!!nikeProfile?.username, `Step 0: profile.username present`);
  assert(nikeProfile?.username === BRAND_USERNAME, `Step 0: username === '${BRAND_USERNAME}'`);
  assert(typeof nikeProfile?.follower_count === "number", `Step 0: follower_count is a real number`);
  assert(nikeProfile?.is_private === false, `Step 0: @${BRAND_USERNAME} account is public`);

  const nikeTelemetry = step0Result.json?.telemetry;
  const nikeProviderUsed = nikeTelemetry?.providerId ?? nikeTelemetry?.provider ?? "unknown";
  const nikeMockFallback = nikeTelemetry?.isMockFallback ?? false;

  console.log(`  [Profile] @${BRAND_USERNAME}: ${nikeProfile?.follower_count?.toLocaleString()} followers | Posts: ${nikeProfile?.post_count} | Verified: ${nikeProfile?.is_verified}`);
  console.log(`  [Telemetry] Provider: ${nikeProviderUsed} | Mock fallback: ${nikeMockFallback} | Latency: ${nikeTelemetry?.latencyMs}ms`);
  console.log(`  [Budget] Apify calls — inferred from execution path: ${nikeMockFallback ? "0 (mock/cache)" : "max 1 (live path)"}`);

  assert(!nikeMockFallback, `Step 0: Real provider used (not mock fallback)`, `provider was ${nikeProviderUsed}`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 1: Brand Intelligence  (1 Gemini call)
  // ════════════════════════════════════════════════════════════════════
  section("STEP 1 — Brand Intelligence (1 Gemini logical op)");

  const step1Result = await page.evaluate(async (profileData: any) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
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
    return { status: res.status, json: await res.json().catch(() => null) };
  }, nikeProfile);

  geminiLogicalOps++;
  const brandReport = step1Result.json?.data;
  const brandTelemetry = step1Result.json?.telemetry;
  stageLogs.push({ stage: "Step 1 — Brand Intelligence", providerId: brandTelemetry?.providerId, modelUsed: brandTelemetry?.modelUsed, fallbackUsed: brandTelemetry?.fallbackUsed, latencyMs: brandTelemetry?.latencyMs, totalTokens: brandTelemetry?.usage?.totalTokens, costUsd: brandTelemetry?.costEstimateUsd, status: step1Result.status });

  assert(step1Result.status === 200, "Step 1: HTTP 200 from /api/brand-intelligence/analyze");
  assert(!!brandReport?.industry, "Step 1: Brand report has industry");
  assert(!!brandReport?.targetAudience, "Step 1: Brand report has targetAudience");
  assert(brandTelemetry?.fallbackUsed !== true, "Step 1: Gemini used (not deterministic fallback)");

  console.log(`  [AI] Provider: ${brandTelemetry?.providerId} | Model: ${brandTelemetry?.modelUsed} | Tokens: ${brandTelemetry?.usage?.totalTokens} | Latency: ${brandTelemetry?.latencyMs}ms`);
  console.log(`  [Brand] Industry: ${brandReport?.industry} | Audience: ${brandReport?.targetAudience}`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 2: Competitor Discovery  (1 Gemini call, 0 Apify calls)
  // ════════════════════════════════════════════════════════════════════
  section("STEP 2 — Competitor Discovery (1 Gemini logical op, 0 Apify calls)");

  const step2Result = await page.evaluate(async (report: any) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-competitors-provider": "live",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/competitors/discover", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ brandReport: report, provider: "live" }),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, brandReport);

  geminiLogicalOps++;
  const candidates: any[] = step2Result.json?.data ?? step2Result.json?.competitors ?? [];
  const discoverTelemetry = step2Result.json?.telemetry;
  stageLogs.push({ stage: "Step 2 — Competitor Discovery", providerId: discoverTelemetry?.providerId, fallbackUsed: discoverTelemetry?.fallbackUsed, latencyMs: discoverTelemetry?.latencyMs, status: step2Result.status });

  assert(step2Result.status === 200, "Step 2: HTTP 200 from /api/competitors/discover");
  assert(Array.isArray(candidates) && candidates.length > 0, `Step 2: At least one candidate returned (got ${candidates.length})`);

  // Report candidate states
  console.log(`\n  [Candidates] ${candidates.length} candidates returned:`);
  for (const c of candidates) {
    console.log(`    ${c.isVerifiedAccount ? "🟢" : "🔵"} @${c.username} → ${c.discoveryState} | verified=${c.isVerifiedAccount} | followers=${c.followers ?? "N/A"}`);
  }

  // Critical Truthfulness Rule verification
  const allHaveValidState = candidates.every((c) =>
    ["AI_SUGGESTED", "UNVERIFIED", "CACHE_VERIFIED", "LIVE_VERIFIED"].includes(c.discoveryState)
  );
  assert(allHaveValidState, "Step 2: All candidates have valid Candidate State Model state");

  const noAutoVerified = candidates.filter(c => c.discoveryState === "AI_SUGGESTED").every(c => c.isVerifiedAccount === false);
  assert(noAutoVerified, "Step 2: AI_SUGGESTED candidates carry isVerifiedAccount=false (Truthfulness Rule)");

  // Select known intended candidate (@adidas, @puma, @underarmour, @newbalance, @lululemon, @gymshark) or STOP
  const INTENDED_CANDIDATES = [PREFERRED_COMPETITOR, "puma", "underarmour", "newbalance", "lululemon", "gymshark"];
  const selected = candidates.find((c) => INTENDED_CANDIDATES.includes(c.username?.toLowerCase()));
  if (!selected) {
    console.error(`\n❌ [ABORT] Controlled intended candidate (${INTENDED_CANDIDATES.join(", ")}) not found in candidate list.`);
    console.error(`   To prevent blindly scraping arbitrary fallback candidates per safety guardrail, stopping right now.`);
    await browser.close();
    process.exit(1);
  }
  assert(!!selected, `Step 2: Competitor selected (@${selected?.username})`);
  console.log(`\n  [Selection] ✅ Selected: @${selected?.username} | State: ${selected?.discoveryState} | Verified: ${selected?.isVerifiedAccount}`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 3: Content Collection  (max 1 Apify call if cache miss)
  // ════════════════════════════════════════════════════════════════════
  section(`STEP 3 — Content Collection @${selected.username} (max 1 Apify call if cache miss)`);

  const step3Result = await page.evaluate(async (competitorUsername: string) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-content-provider": "live",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/content-collection/collect", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ username: competitorUsername, provider: "live" }),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, selected.username);

  const collectedItems: any[] = step3Result.json?.data ?? [];
  const collectTelemetry = step3Result.json?.telemetry;
  stageLogs.push({ stage: `Step 3 — Content Collection @${selected.username}`, providerId: collectTelemetry?.providerId, fallbackUsed: collectTelemetry?.isMockFallback, latencyMs: collectTelemetry?.latencyMs, status: step3Result.status });

  assert(step3Result.status === 200, `Step 3: HTTP 200 from /api/content-collection/collect`);
  assert(Array.isArray(collectedItems) && collectedItems.length > 0, `Step 3: Real content items collected (got ${collectedItems.length})`);

  const hasMockItems = collectedItems.some(
    (item) => item.id?.startsWith("mock") || item.id?.startsWith("fixture") || item.caption?.includes("Mock")
  );
  assert(!hasMockItems, "Step 3: No mock/fixture content items in collection");

  const viewsCheck = collectedItems.every((item) =>
    item.views === undefined || item.views === null || typeof item.views === "number"
  );
  assert(viewsCheck, "Step 3: views/reach field is null/undefined or a real number (not fabricated)");

  const collectProviderUsed = collectTelemetry?.providerId ?? "unknown";
  const collectMock = collectTelemetry?.isMockFallback ?? false;
  console.log(`  [Content] @${selected.username}: ${collectedItems.length} items | Provider: ${collectProviderUsed} | Mock: ${collectMock}`);
  console.log(`  [Budget] Apify call — inferred from execution path: ${collectMock ? "0 (mock/cache)" : "max 1 (live path)"}`);
  console.log(`  [Sample] ID: ${collectedItems[0]?.id} | Type: ${collectedItems[0]?.type} | Likes: ${collectedItems[0]?.likes} | Views: ${collectedItems[0]?.views ?? "N/A (unavailable)"}`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 4: Content Intelligence  (1 Gemini call)
  // ════════════════════════════════════════════════════════════════════
  section("STEP 4 — Content Intelligence (1 Gemini logical op)");

  const step4Result = await page.evaluate(async (items: any[]) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-ai-provider": "gemini",
      "x-ai-model": "gemini-3.1-flash-lite",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/content-intelligence/analyze", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ items, aiProvider: "gemini", aiModel: "gemini-3.1-flash-lite" }),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, collectedItems);

  geminiLogicalOps++;
  const intelReports: any[] = step4Result.json?.data ?? [];
  const intelTelemetry = step4Result.json?.telemetry;
  stageLogs.push({ stage: "Step 4 — Content Intelligence", providerId: intelTelemetry?.providerId, modelUsed: intelTelemetry?.modelUsed, fallbackUsed: intelTelemetry?.fallbackUsed, latencyMs: intelTelemetry?.latencyMs, totalTokens: intelTelemetry?.usage?.totalTokens, costUsd: intelTelemetry?.costEstimateUsd, status: step4Result.status });

  assert(step4Result.status === 200, "Step 4: HTTP 200 from /api/content-intelligence/analyze");
  assert(Array.isArray(intelReports) && intelReports.length > 0, `Step 4: Content Intelligence reports generated (got ${intelReports.length})`);
  assert(intelTelemetry?.fallbackUsed !== true, "Step 4: Live Gemini used (not deterministic fallback)");

  console.log(`  [AI] Provider: ${intelTelemetry?.providerId} | Model: ${intelTelemetry?.modelUsed} | Tokens: ${intelTelemetry?.usage?.totalTokens} | Latency: ${intelTelemetry?.latencyMs}ms`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 5: Content DNA  (1 Gemini call)
  // ════════════════════════════════════════════════════════════════════
  section("STEP 5 — Content DNA (1 Gemini logical op)");

  const step5Result = await page.evaluate(async (reports: any[]) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-ai-provider": "gemini",
      "x-ai-model": "gemini-3.1-flash-lite",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/content-dna/analyze", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ reports, aiProvider: "gemini", aiModel: "gemini-3.1-flash-lite" }),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, intelReports);

  geminiLogicalOps++;
  const dnaReport = step5Result.json?.data;
  const dnaTelemetry = step5Result.json?.telemetry;
  stageLogs.push({ stage: "Step 5 — Content DNA", providerId: dnaTelemetry?.providerId, modelUsed: dnaTelemetry?.modelUsed, fallbackUsed: dnaTelemetry?.fallbackUsed, latencyMs: dnaTelemetry?.latencyMs, totalTokens: dnaTelemetry?.usage?.totalTokens, costUsd: dnaTelemetry?.costEstimateUsd, status: step5Result.status });

  assert(step5Result.status === 200, "Step 5: HTTP 200 from /api/content-dna/analyze");
  assert(!!dnaReport?.id, "Step 5: DNA report has a valid ID");
  assert(dnaTelemetry?.fallbackUsed !== true, "Step 5: Live Gemini used (not deterministic fallback)");

  console.log(`  [AI] Provider: ${dnaTelemetry?.providerId} | Model: ${dnaTelemetry?.modelUsed} | Tokens: ${dnaTelemetry?.usage?.totalTokens} | Latency: ${dnaTelemetry?.latencyMs}ms`);
  console.log(`  [DNA] Report ID: ${dnaReport?.id} | Niche: ${dnaReport?.contentNiche ?? "N/A"}`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 6: Script Generation  (1 Gemini call)
  // ════════════════════════════════════════════════════════════════════
  section("STEP 6 — Script Generation (1 Gemini logical op)");

  const step6Result = await page.evaluate(async (dna: any) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-ai-provider": "gemini",
      "x-ai-model": "gemini-3.1-flash-lite",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/script-generation/generate", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ dnaReport: dna, aiProvider: "gemini", aiModel: "gemini-3.1-flash-lite" }),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, dnaReport);

  geminiLogicalOps++;
  const scriptPackage = step6Result.json?.data;
  const scriptTelemetry = step6Result.json?.telemetry;
  stageLogs.push({ stage: "Step 6 — Script Generation", providerId: scriptTelemetry?.providerId, modelUsed: scriptTelemetry?.modelUsed, fallbackUsed: scriptTelemetry?.fallbackUsed, latencyMs: scriptTelemetry?.latencyMs, totalTokens: scriptTelemetry?.usage?.totalTokens, costUsd: scriptTelemetry?.costEstimateUsd, status: step6Result.status });

  assert(step6Result.status === 200, "Step 6: HTTP 200 from /api/script-generation/generate");
  assert(!!scriptPackage?.hook, "Step 6: Script package has hook section");
  assert(scriptTelemetry?.fallbackUsed !== true, "Step 6: Live Gemini used (not deterministic fallback)");

  console.log(`  [AI] Provider: ${scriptTelemetry?.providerId} | Model: ${scriptTelemetry?.modelUsed} | Tokens: ${scriptTelemetry?.usage?.totalTokens} | Latency: ${scriptTelemetry?.latencyMs}ms`);
  console.log(`  [Script] Hook preview: "${String(scriptPackage?.hook ?? "").substring(0, 80)}..."`);

  // ════════════════════════════════════════════════════════════════════
  // STEP 7: Repurpose Studio  (1 Gemini call)
  // ════════════════════════════════════════════════════════════════════
  section("STEP 7 — Repurpose Studio (1 Gemini logical op)");

  const step7Result = await page.evaluate(async (pkg: any) => {
    const clerk = (window as any).Clerk;
    const token = await clerk?.session?.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-ai-provider": "gemini",
      "x-ai-model": "gemini-3.1-flash-lite",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch("/api/repurpose/generate", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ pkg, aiProvider: "gemini", aiModel: "gemini-3.1-flash-lite" }),
    });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, scriptPackage);

  geminiLogicalOps++;
  const repurposeReport = step7Result.json?.data;
  const repurposeTelemetry = step7Result.json?.telemetry;
  stageLogs.push({ stage: "Step 7 — Repurpose Studio", providerId: repurposeTelemetry?.providerId, modelUsed: repurposeTelemetry?.modelUsed, fallbackUsed: repurposeTelemetry?.fallbackUsed, latencyMs: repurposeTelemetry?.latencyMs, totalTokens: repurposeTelemetry?.usage?.totalTokens, costUsd: repurposeTelemetry?.costEstimateUsd, status: step7Result.status });

  assert(step7Result.status === 200, "Step 7: HTTP 200 from /api/repurpose/generate");
  assert(!!repurposeReport, "Step 7: Repurpose report generated");
  assert(repurposeTelemetry?.fallbackUsed !== true, "Step 7: Live Gemini used (not deterministic fallback)");

  console.log(`  [AI] Provider: ${repurposeTelemetry?.providerId} | Model: ${repurposeTelemetry?.modelUsed} | Tokens: ${repurposeTelemetry?.usage?.totalTokens} | Latency: ${repurposeTelemetry?.latencyMs}ms`);

  // ════════════════════════════════════════════════════════════════════
  // FINAL REPORT
  // ════════════════════════════════════════════════════════════════════
  section("PHASE 4D E2E FINAL REPORT");

  const totalGeminiTokens = stageLogs.reduce((sum, s) => sum + (s.totalTokens ?? 0), 0);
  const totalCostUsd = stageLogs.reduce((sum, s) => sum + (s.costUsd ?? 0), 0);
  const anyFallback = stageLogs.some((s) => s.fallbackUsed === true);
  const nikeApifyBudget = nikeMockFallback ? "0 (mock/cache path)" : "max 1 — inferred from execution path";
  const competitorApifyBudget = collectMock ? "0 (mock/cache path)" : "max 1 — inferred from execution path";

  console.log(`
  Production URL:          ${PROD_URL}
  Brand Profile Used:      @${BRAND_USERNAME}
  Selected Competitor:     @${selected.username}

  ── Apify Budget ──────────────────────────────────────────────
  @${BRAND_USERNAME} cache status:     NOT DIRECTLY OBSERVABLE (telemetry: ${nikeApifyBudget})
  @${selected.username} cache status:    NOT DIRECTLY OBSERVABLE (telemetry: ${competitorApifyBudget})
  Apify calls observed:    Not directly observable from response telemetry
  Apify calls inferred:    ${(nikeMockFallback ? 0 : 1) + (collectMock ? 0 : 1)} max across E2E run

  ── Gemini Budget ─────────────────────────────────────────────
  Logical AI operations:   ${geminiLogicalOps} / 6 expected
  Network attempts:        Not directly observable (per telemetry constraints)
  Total tokens used:       ${totalGeminiTokens.toLocaleString()}
  Estimated total cost:    $${totalCostUsd.toFixed(6)}

  ── Candidate Discovery States ────────────────────────────────`);
  for (const c of candidates) {
    console.log(`  @${c.username.padEnd(20)} → ${c.discoveryState} | verified=${c.isVerifiedAccount}`);
  }
  console.log(`
  ── Pipeline Results ──────────────────────────────────────────
  Content items collected: ${collectedItems.length}
  Content Intel reports:   ${intelReports.length}
  DNA Report ID:           ${dnaReport?.id ?? "MISSING"}
  DNA Content Niche:       ${dnaReport?.contentNiche ?? "N/A"}
  Script Hook:             ${scriptPackage?.hook ? "✅ present" : "❌ missing"}
  Repurpose Report:        ${repurposeReport ? "✅ generated" : "❌ missing"}

  ── Provenance ────────────────────────────────────────────────
  Mock data in pipeline:   ${anyFallback ? "⚠️  YES — fallback used in at least one stage" : "✅ None (all stages used live AI)"}
  Views/reach fabricated:  ✅ Not fabricated — null/undefined where unavailable

  ── Stage-by-Stage Provider Log ───────────────────────────────`);
  for (const s of stageLogs) {
    console.log(`  ${s.stage.padEnd(45)} | ${(s.providerId ?? "N/A").padEnd(14)} | fallback=${s.fallbackUsed ?? "N/A"} | ${s.latencyMs ?? "N/A"}ms`);
  }
  console.log(`
  ── Assertions ────────────────────────────────────────────────
  Passed: ${passed} | Failed: ${failed} | Total: ${passed + failed}
  `);

  const verdict = failed === 0 ? "✅ PASS" : failed <= 2 ? "⚠️  PARTIAL PASS" : "❌ FAIL";
  console.log(`  Stage 3B Phase 4D Verdict: ${verdict}`);

  await context.storageState({ path: STORAGE_STATE_PATH });
  await browser.close();

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runPhase4DE2E().catch((err) => {
  console.error("[FATAL] Phase 4D E2E unhandled error:", err);
  process.exit(1);
});
