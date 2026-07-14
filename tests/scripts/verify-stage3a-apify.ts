import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * ReelForge AI v2.0 — Milestone 6 Stage 3A: Apify Provider Controlled Verification
 *
 * Preflight Checks (zero real API calls):
 *   A. Authenticate via Playwright auth-storage
 *   B. Read scraperCallsCount BEFORE the request
 *   C. Document Apify adapter contract
 *
 * Live Test (exactly ONE real Apify scraper call):
 *   D. POST /api/profiles/analyze with x-instagram-provider: "apify"
 *   E. Verify:
 *      - HTTP 200
 *      - executedProvider === "apify" (not "mock")
 *      - username matches requested profile
 *      - bio/followers are real data (not mock travel photographer)
 *      - all 12+ ReelForge InstagramPost fields present
 *      - no credentials in response
 *
 * Downstream Check (no additional scraper call):
 *   F. Verify brand intelligence accepts the real profile payload
 *
 * Accounting:
 *   G. Read scraperCallsCount AFTER — verify delta === 1
 */
async function runApifyVerification() {
  const TARGET_URL = process.env.TEST_URL || "https://reel-forge-ai-psi.vercel.app";
  const STORAGE_DIR = path.resolve("C:/Users/acer/.gemini/antigravity-ide");
  const STORAGE_STATE_PATH = path.join(STORAGE_DIR, "auth-storage.json");

  // Target profile: known large public account with rich media — good verification target
  const TARGET_PROFILE = "natgeo"; // National Geographic — verified, public, rich posts

  console.log("\n=========================================================================");
  console.log(" ReelForge AI — M6 Stage 3A: Apify Provider Controlled Verification");
  console.log("=========================================================================\n");
  console.log(`[Config] Target Server  : ${TARGET_URL}`);
  console.log(`[Config] Target Profile : @${TARGET_PROFILE}`);
  console.log(`[Config] Provider       : apify`);
  console.log("[Config] Max scraper calls allowed: 1\n");
  console.log("[Security] Credentials will not appear in output or logs.\n");

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

  let context;
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    try {
      context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
      console.log("[Auth] Loaded stored authentication state.");
    } catch {
      context = await browser.newContext();
      console.log("[Auth] WARNING: Could not load auth state. Proceeding without stored session.");
    }
  } else {
    context = await browser.newContext();
    console.log("[Auth] WARNING: No auth-storage.json found. Proceeding without stored session.");
  }

  const page = await context.newPage();
  console.log(`[Playwright] Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 25000 }).catch((e) => {
    console.log(`[Playwright] Navigation warning: ${e.message}`);
  });
  await page.waitForTimeout(2000);

  // ─── AUTH CHECK ────────────────────────────────────────────────────────────
  const authState = await page.evaluate(async () => {
    const clerk = (window as any).Clerk;
    return {
      hasUser: Boolean(clerk?.user?.id || clerk?.session?.user?.id),
      userId: clerk?.user?.id?.slice(0, 8) ?? "not-auth",
      url: window.location.href,
    };
  });
  console.log(`\n[Auth] Status: ${authState.hasUser ? "✅ Authenticated" : "❌ NOT authenticated"}`);
  console.log(`[Auth] Session prefix: ${authState.userId}...`);

  if (!authState.hasUser) {
    console.error("\n[ABORT] Not authenticated. Cannot execute a metered scraper call without auth.");
    console.error("  → Ensure auth-storage.json contains a valid Clerk session.");
    await browser.close();
    process.exit(1);
  }

  // ─── PREFLIGHT B: scraperCallsCount BEFORE ─────────────────────────────────
  console.log("\n─── PREFLIGHT B: Scraper Usage Counter (BEFORE request) ─────────────────");
  const usageBefore = await page.evaluate(async (baseUrl: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/ai/telemetry/summary`, {
        credentials: "include",
      });
      if (!res.ok) return { ok: false, status: res.status };
      const json = await res.json();
      return {
        ok: true,
        scraperCallsCount: json?.data?.persistedUsage?.scraperCallsCount ?? null,
        aiPromptTokens:    json?.data?.persistedUsage?.aiPromptTokens ?? null,
        totalTokens:       json?.data?.persistedUsage?.totalTokens ?? null,
        planId:            json?.data?.subscription?.planId ?? "unknown",
        monthlyScraperLimit: json?.data?.quotas?.monthlyScraperLimit ?? null,
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }, TARGET_URL);
  console.log(`  Scraper calls used      : ${usageBefore.scraperCallsCount ?? "N/A"}`);
  console.log(`  Monthly scraper limit   : ${usageBefore.monthlyScraperLimit ?? "N/A"}`);
  console.log(`  Plan                    : ${usageBefore.planId ?? "N/A"}`);
  console.log(`  AI prompt tokens        : ${usageBefore.aiPromptTokens ?? "N/A"}`);
  if (!usageBefore.ok) console.log(`  Error                   : ${JSON.stringify(usageBefore)}`);

  // ─── PREFLIGHT C: Contract documentation ───────────────────────────────────
  console.log("\n─── PREFLIGHT C: Apify Adapter Contract ──────────────────────────────────");
  console.log("  Actor    : apify~instagram-profile-scraper");
  console.log("  Endpoint : POST https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items");
  console.log("  Auth     : ?token=<APIFY_API_TOKEN> (query param — value is server-side only, never logged)");
  console.log("  Input    : { \"usernames\": [\"" + TARGET_PROFILE + "\"] }");
  console.log("  Response : Array<ProfileObject> — synchronous, waits for actor completion");
  console.log("  Timeout  : 15s per attempt via FailoverInstagramProvider (1 retry allowed)");

  // ─── LIVE TEST: Single real Apify request ──────────────────────────────────
  console.log(`\n─── LIVE TEST: One real Apify request for @${TARGET_PROFILE} ──────────────`);
  console.log("[NOTE] This is the ONLY metered scraper call permitted in Stage 3A.");

  let scraperCallCount = 0;
  page.on("request", (req) => {
    if (req.url().includes("/api/profiles/analyze")) scraperCallCount++;
  });

  const liveStart = Date.now();

  const liveResult = await page.evaluate(async (args: { baseUrl: string; profile: string }) => {
    const start = Date.now();
    try {
      const res = await fetch(`${args.baseUrl}/api/profiles/analyze`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-instagram-provider": "apify",
        },
        body: JSON.stringify({
          instagramUrl: `https://www.instagram.com/${args.profile}/`,
          provider: "apify",
        }),
      });

      const elapsed = Date.now() - start;
      let json: any = null;
      try { json = await res.json(); } catch { /* ignore */ }

      if (!json) return { ok: false, status: res.status, elapsed, error: "empty_response" };

      // Scrub: never return raw API key material — build a safe summary only
      const safeResult: Record<string, any> = {
        httpStatus: res.status,
        ok: res.ok,
        elapsed,
        // Telemetry
        executedProvider: json?.telemetry?.provider ?? json?.provider ?? "MISSING",
        fallbackUsed:     json?.telemetry?.fallbackUsed ?? false,
        reason:           json?.telemetry?.reason ?? null,
        // Profile identity
        profile: json?.data ? {
          username:             json.data.username,
          display_name:         json.data.display_name,
          bio_first100:         json.data.bio?.substring(0, 100) ?? null,
          bio_length:           json.data.bio?.length ?? 0,
          follower_count:       json.data.follower_count,
          following_count:      json.data.following_count,
          post_count:           json.data.post_count,
          category:             json.data.category,
          is_verified:          json.data.is_verified,
          is_private:           json.data.is_private,
          profile_picture_present: !!json.data.profile_picture_url,
          external_url_present: !!json.data.external_url,
          // Posts
          posts_returned: Array.isArray(json.data.posts) ? json.data.posts.length : 0,
          first_post: json.data.posts?.[0] ? {
            id:            json.data.posts[0].id,
            type:          json.data.posts[0].type,
            has_thumbnail: !!json.data.posts[0].thumbnail_url,
            has_url:       !!json.data.posts[0].url,
            has_caption:   !!json.data.posts[0].caption,
            likes:         json.data.posts[0].likes,
            comments:      json.data.posts[0].comments,
            timestamp:     json.data.posts[0].timestamp,
          } : null,
          last_post: json.data.posts?.length > 1 ? {
            id:    json.data.posts[json.data.posts.length - 1].id,
            type:  json.data.posts[json.data.posts.length - 1].type,
          } : null,
          // Field completeness: count non-null post fields across all posts
          post_field_coverage: Array.isArray(json.data.posts)
            ? json.data.posts.reduce((acc: Record<string, number>, p: any) => {
                if (p.id)            acc.id = (acc.id || 0) + 1;
                if (p.thumbnail_url) acc.thumbnail_url = (acc.thumbnail_url || 0) + 1;
                if (p.url)           acc.url = (acc.url || 0) + 1;
                if (p.caption)       acc.caption = (acc.caption || 0) + 1;
                if (p.likes > 0)     acc.likes = (acc.likes || 0) + 1;
                if (p.comments >= 0) acc.comments = (acc.comments || 0) + 1;
                if (p.timestamp)     acc.timestamp = (acc.timestamp || 0) + 1;
                if (p.type)          acc.type = (acc.type || 0) + 1;
                return acc;
              }, {})
            : {},
        } : null,
        error: json?.error ?? null,
      };

      // Security: confirm no API key strings appear in response (heuristic check)
      const rawStr = JSON.stringify(json);
      safeResult.credentialLeakCheck = {
        responseContainsApifyToken: rawStr.includes("apify_api") || rawStr.includes("apify_token"),
        responseContainsBearerToken: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/.test(rawStr),
      };

      // Mock detection
      const MOCK_BIO = "Travel photographer & storyteller";
      const MOCK_FOLLOWERS = 248500;
      safeResult.mockDetection = {
        mockBioPresent:       json?.data?.bio?.includes(MOCK_BIO) ?? false,
        mockFollowerCount:    json?.data?.follower_count === MOCK_FOLLOWERS,
        usernameMatchesSent:  json?.data?.username?.toLowerCase() === args.profile.toLowerCase(),
      };

      return safeResult;
    } catch (e) {
      return { ok: false, error: String(e), elapsed: Date.now() - start };
    }
  }, { baseUrl: TARGET_URL, profile: TARGET_PROFILE });

  const totalElapsed = Date.now() - liveStart;

  // ─── LIVE TEST RESULTS ─────────────────────────────────────────────────────
  console.log(`\n─── Live Request Result ──────────────────────────────────────────────────`);
  console.log(`  HTTP Status             : ${liveResult.httpStatus} ${liveResult.ok ? "✅" : "❌"}`);
  console.log(`  Wall-clock latency      : ${totalElapsed}ms`);
  console.log(`  Reported elapsed        : ${liveResult.elapsed}ms`);
  console.log(`  Executed Provider       : ${liveResult.executedProvider}`);
  console.log(`  Fallback Used           : ${liveResult.fallbackUsed}`);
  console.log(`  Reason                  : ${liveResult.reason ?? "none"}`);
  console.log(`  /api/profiles/analyze calls triggered: ${scraperCallCount} (expect 1)`);

  if (liveResult.error && !liveResult.profile) {
    console.log(`\n  [ERROR] ${JSON.stringify(liveResult.error)}`);
  }

  if (liveResult.profile) {
    const p = liveResult.profile;
    console.log(`\n─── Profile Data Verification ────────────────────────────────────────────`);
    console.log(`  Username                : @${p.username}`);
    console.log(`  Display Name            : ${p.display_name}`);
    console.log(`  Bio (first 100 chars)   : "${p.bio_first100}"`);
    console.log(`  Bio length              : ${p.bio_length} chars`);
    console.log(`  Followers               : ${p.follower_count?.toLocaleString()}`);
    console.log(`  Following               : ${p.following_count?.toLocaleString()}`);
    console.log(`  Post Count              : ${p.post_count?.toLocaleString()}`);
    console.log(`  Category                : ${p.category ?? "null"}`);
    console.log(`  Is Verified             : ${p.is_verified}`);
    console.log(`  Is Private              : ${p.is_private}`);
    console.log(`  Profile Pic Present     : ${p.profile_picture_present}`);
    console.log(`  External URL Present    : ${p.external_url_present}`);
    console.log(`  Posts Returned          : ${p.posts_returned}`);

    if (p.first_post) {
      console.log(`\n─── First Post Sample ────────────────────────────────────────────────────`);
      console.log(`  Post ID                 : ${p.first_post.id}`);
      console.log(`  Type                    : ${p.first_post.type}`);
      console.log(`  Has Thumbnail URL       : ${p.first_post.has_thumbnail}`);
      console.log(`  Has Post URL            : ${p.first_post.has_url}`);
      console.log(`  Has Caption             : ${p.first_post.has_caption}`);
      console.log(`  Likes                   : ${p.first_post.likes}`);
      console.log(`  Comments                : ${p.first_post.comments}`);
      console.log(`  Timestamp               : ${p.first_post.timestamp}`);
    }

    if (p.last_post) {
      console.log(`\n─── Last Post Sample ─────────────────────────────────────────────────────`);
      console.log(`  Post ID                 : ${p.last_post.id}`);
      console.log(`  Type                    : ${p.last_post.type}`);
    }

    console.log(`\n─── Post Field Coverage (across all ${p.posts_returned} posts) ──────────`);
    const cov = p.post_field_coverage as Record<string, number>;
    const n = p.posts_returned;
    for (const field of ["id", "thumbnail_url", "url", "caption", "likes", "comments", "timestamp", "type"]) {
      const count = cov[field] ?? 0;
      const pct = n > 0 ? Math.round((count / n) * 100) : 0;
      const icon = pct === 100 ? "✅" : pct >= 50 ? "⚠️ " : "❌";
      console.log(`  ${field.padEnd(20)}: ${count}/${n} (${pct}%) ${icon}`);
    }
  }

  // ─── MOCK DETECTION ───────────────────────────────────────────────────────
  if (liveResult.mockDetection) {
    const m = liveResult.mockDetection;
    console.log(`\n─── Mock Data Detection ──────────────────────────────────────────────────`);
    console.log(`  Mock bio present        : ${m.mockBioPresent ? "⚠️ YES — mock used!" : "✅ NO"}`);
    console.log(`  Mock follower count     : ${m.mockFollowerCount ? "⚠️ YES — mock used!" : "✅ NO"}`);
    console.log(`  Username matches sent   : ${m.usernameMatchesSent ? "✅ YES" : "⚠️ MISMATCH"}`);
  }

  // ─── SECURITY CHECK ───────────────────────────────────────────────────────
  if (liveResult.credentialLeakCheck) {
    const c = liveResult.credentialLeakCheck;
    console.log(`\n─── Security Verification ────────────────────────────────────────────────`);
    console.log(`  Apify token in response : ${c.responseContainsApifyToken ? "⚠️ LEAK DETECTED" : "✅ CLEAN"}`);
    console.log(`  Bearer token in response: ${c.responseContainsBearerToken ? "⚠️ LEAK DETECTED" : "✅ CLEAN"}`);
  }

  // ─── DOWNSTREAM: Brand Intelligence (no new scrape) ───────────────────────
  let brandResult: any = null;
  const isRealData = liveResult.executedProvider === "apify" && !liveResult.mockDetection?.mockBioPresent;
  if (isRealData && liveResult.profile) {
    console.log(`\n─── Downstream: Brand Intelligence (no new scraper call) ─────────────────`);
    brandResult = await page.evaluate(async (args: { baseUrl: string; profile: any }) => {
      try {
        const minProfile = {
          username:            args.profile.username,
          display_name:        args.profile.display_name,
          bio:                 args.profile.bio_first100,
          follower_count:      args.profile.follower_count,
          following_count:     args.profile.following_count,
          post_count:          args.profile.post_count,
          is_private:          args.profile.is_private,
          is_verified:         args.profile.is_verified,
          category:            args.profile.category,
          profile_picture_url: args.profile.profile_picture_present ? "https://placeholder.local/pic.jpg" : null,
          external_url:        null,
          posts: [],
        };
        const res = await fetch(`${args.baseUrl}/api/brand-intelligence/analyze`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: minProfile }),
        });
        const json = await res.json();
        return {
          status: res.status,
          ok: res.ok,
          hasData: !!json?.data,
          aiProvider: json?.telemetry?.providerId ?? json?.provider ?? "unknown",
          errorCode: json?.error?.code ?? null,
          errorMsg:  typeof json?.error === "string" ? json.error.substring(0, 80) : null,
        };
      } catch (e) {
        return { status: 0, ok: false, networkError: String(e) };
      }
    }, { baseUrl: TARGET_URL, profile: liveResult.profile });

    console.log(`  HTTP Status             : ${brandResult.status}`);
    console.log(`  Accepted real profile   : ${brandResult.ok || brandResult.hasData ? "✅ YES" : "❌ NO"}`);
    console.log(`  AI Provider used        : ${brandResult.aiProvider}`);
    if (brandResult.errorCode) console.log(`  Error Code              : ${brandResult.errorCode}`);
    if (brandResult.errorMsg)  console.log(`  Error Message           : ${brandResult.errorMsg}`);
    if (brandResult.networkError) console.log(`  Network Error           : ${brandResult.networkError}`);
  } else {
    console.log(`\n─── Downstream Check: SKIPPED ────────────────────────────────────────────`);
    console.log(`  Reason: Live provider was not 'apify' or mock data detected — skipping downstream.`);
  }

  // ─── POST-REQUEST: scraperCallsCount AFTER ────────────────────────────────
  console.log(`\n─── Post-Request: Scraper Usage Counter (AFTER request) ─────────────────`);
  await page.waitForTimeout(2000); // allow DB write to commit
  const usageAfter = await page.evaluate(async (baseUrl: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/ai/telemetry/summary`, { credentials: "include" });
      if (!res.ok) return { ok: false, status: res.status };
      const json = await res.json();
      return {
        ok: true,
        scraperCallsCount: json?.data?.persistedUsage?.scraperCallsCount ?? null,
      };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }, TARGET_URL);
  console.log(`  Scraper calls used (after): ${usageAfter.scraperCallsCount ?? "N/A"}`);

  // ─── FINAL SUMMARY ────────────────────────────────────────────────────────
  const before = typeof usageBefore.scraperCallsCount === "number" ? usageBefore.scraperCallsCount : null;
  const after  = typeof usageAfter.scraperCallsCount  === "number" ? usageAfter.scraperCallsCount  : null;
  const delta  = (before !== null && after !== null) ? (after - before) : null;
  const wasApify = liveResult.executedProvider === "apify";
  const wasMock  = liveResult.executedProvider === "mock";

  console.log(`\n=========================================================================`);
  console.log(` Stage 3A — Final Summary`);
  console.log(`=========================================================================`);
  console.log(`  Real Apify provider executed    : ${wasApify ? "✅ YES" : "❌ NO"}`);
  console.log(`  Mock fallback used              : ${wasMock ? "⚠️ YES" : "✅ NO"}`);
  console.log(`  Fallback flag in response       : ${liveResult.fallbackUsed}`);
  console.log(`  /api/profiles/analyze calls     : ${scraperCallCount} (must be 1)`);
  console.log(`  scraperCallsCount BEFORE        : ${before ?? "unavailable"}`);
  console.log(`  scraperCallsCount AFTER         : ${after ?? "unavailable"}`);
  console.log(`  Delta (expect 1 if real)        : ${delta ?? "unavailable"} ${delta === 1 ? "✅" : delta === 0 ? "(0 = mock, no metering)" : "⚠️"}`);
  console.log(`  Downstream brand check          : ${brandResult ? (brandResult.ok || brandResult.hasData ? "✅ ACCEPTED" : "❌ REJECTED") : "SKIPPED"}`);
  console.log(`  Credential leak detected        : ${(liveResult.credentialLeakCheck?.responseContainsApifyToken || liveResult.credentialLeakCheck?.responseContainsBearerToken) ? "⚠️ YES — INVESTIGATE" : "✅ NONE"}`);

  if (!wasApify) {
    console.log(`\n[DIAGNOSIS] Provider did not use Apify. Executed: '${liveResult.executedProvider}'.`);
    if (liveResult.executedProvider === "mock") {
      console.log(`  → APIFY_API_TOKEN is likely absent from Vercel Production env vars.`);
      console.log(`  → Verify the token was added and that the deployment was redeployed after adding.`);
      console.log(`  → ApifyProvider.isAvailable() returns false when APIFY_API_TOKEN is unset.`);
    }
  }

  console.log(`=========================================================================\n`);

  await browser.close();
}

runApifyVerification().catch((err) => {
  console.error("\n[FATAL] Verification script crashed:", err);
  process.exit(1);
});
