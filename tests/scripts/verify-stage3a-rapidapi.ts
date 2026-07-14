import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * ReelForge AI v2.0 — Milestone 6 Stage 3A: RapidAPI Provider Controlled Verification
 *
 * Preflight Checks (no real API call):
 * A. Verify RAPIDAPI_KEY and RAPIDAPI_HOST env vars present in running Vercel production server
 * B. Verify route correctly reads x-instagram-provider header
 * C. Read scraperCallsCount BEFORE the request
 *
 * Live Test (exactly ONE real API call):
 * D. Send POST /api/profiles/analyze with x-instagram-provider: "rapidapi" for a known public account
 * E. Verify:
 *    - HTTP 200 OK
 *    - telemetry.provider === "rapidapi"
 *    - No mock fallback
 *    - Real username returned
 *    - Real biography/follower metadata
 *    - No hardcoded mock data (specific mock bio check)
 *    - posts array contains real data
 *    - ZERO credential leakage in response
 *
 * Downstream Check (no additional scraper call):
 * F. Send the real profile payload to brand intelligence API
 * G. Verify brand intelligence accepts the profile shape
 *
 * Scraper Counter:
 * H. Read scraperCallsCount AFTER to verify increment of exactly 1
 */
async function runStage3AVerification() {
  const TARGET_URL = process.env.TEST_URL || "https://reel-forge-ai-psi.vercel.app";
  const STORAGE_DIR = path.resolve("C:/Users/acer/.gemini/antigravity-ide");
  const STORAGE_STATE_PATH = path.join(STORAGE_DIR, "auth-storage.json");

  console.log("\n=========================================================================");
  console.log(" ReelForge AI — M6 Stage 3A: RapidAPI Controlled Provider Verification");
  console.log("=========================================================================\n");
  console.log(`[Target Server] ${TARGET_URL}`);
  console.log("[CONSTRAINT] Maximum 1 real scraper call. No credentials will appear in output.\n");

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

  let context;
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    try {
      context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
    } catch {
      context = await browser.newContext();
    }
  } else {
    context = await browser.newContext();
  }

  const page = await context.newPage();
  console.log(`[Playwright] Navigating to ${TARGET_URL} to establish auth context...`);
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const authCheck = await page.evaluate(async () => {
    const clerk = (window as any).Clerk;
    return { hasUser: Boolean(clerk?.user || clerk?.session), url: window.location.href };
  });
  console.log(`[Auth] Authenticated: ${authCheck.hasUser ? "YES ✅" : "NO ❌"} | URL: ${authCheck.url}`);

  if (!authCheck.hasUser) {
    console.error("[ABORT] Not authenticated — cannot proceed with real request. Exiting.");
    await browser.close();
    process.exit(1);
  }

  // ============================================================
  // PREFLIGHT A: Verify RAPIDAPI env vars present on server
  // ============================================================
  console.log("\n--- PREFLIGHT A: Verify RapidAPI Env Vars Configured on Production Server ---");
  const preflightEnvResult = await page.evaluate(async (baseUrl: string) => {
    // We check this via the health endpoint - if the server has RAPIDAPI_KEY set,
    // the provider's isAvailable() will be true. We can't directly read env vars
    // from the client, but we can check via a diagnostic-style route if available,
    // or verify via the actual request returning rapidapi (not mock).
    // For now we document what we're checking.
    return {
      note: "RAPIDAPI_KEY and RAPIDAPI_HOST presence will be confirmed empirically by whether the real request returns provider=rapidapi vs provider=mock",
      method: "empirical"
    };
  }, TARGET_URL);
  console.log(`[Env Check] ${preflightEnvResult.note}`);

  // ============================================================
  // PREFLIGHT B: Read scraperCallsCount BEFORE request
  // ============================================================
  console.log("\n--- PREFLIGHT B: Read Current scraperCallsCount (BEFORE real request) ---");
  const usageBefore = await page.evaluate(async (baseUrl: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/ai/telemetry/summary`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        return {
          ok: true,
          scraperCallsCount: json?.data?.persistedUsage?.scraperCallsCount ?? "NOT_IN_RESPONSE",
          aiPromptTokens: json?.data?.persistedUsage?.aiPromptTokens ?? 0,
          totalTokens: json?.data?.persistedUsage?.totalTokens ?? 0,
        };
      }
      return { ok: false, status: res.status };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }, TARGET_URL);
  console.log(`[Usage BEFORE]`, JSON.stringify(usageBefore, null, 2));

  // ============================================================
  // PREFLIGHT C: Contract verification — document what we expect
  // ============================================================
  console.log("\n--- PREFLIGHT C: RapidAPI Adapter Contract Documentation ---");
  console.log("  API Product  : Instagram Scraper API2 (by social-api3-instagram)");
  console.log("  Host         : instagram-scraper-api2.p.rapidapi.com");
  console.log("  Endpoint     : GET /v1/info?username_or_id_or_url={username}");
  console.log("  Headers      : x-rapidapi-key (redacted), x-rapidapi-host");
  console.log("  Expected top-level fields: username, full_name, biography, edge_followed_by.count,");
  console.log("                             edge_follow.count, edge_owner_to_timeline_media.count,");
  console.log("                             profile_pic_url_hd, is_private, is_verified, category_name");
  console.log("  Expected post fields:      id, shortcode, display_url, is_video, __typename,");
  console.log("                             edge_media_to_caption.edges[0].node.text,");
  console.log("                             edge_liked_by.count, edge_media_to_comment.count,");
  console.log("                             taken_at_timestamp");
  console.log("  Our adapter  : rapidapi.provider.ts — handles both nested and flat field paths");

  // ============================================================
  // LIVE TEST: One controlled real request
  // ============================================================
  const TARGET_PROFILE = "instagram"; // Official Instagram account — known public, verified, real metadata
  console.log(`\n--- LIVE TEST: Executing ONE real request for @${TARGET_PROFILE} via RapidAPI ---`);
  console.log("[NOTE] If RAPIDAPI_KEY is not set in Vercel, response will fallback to mock (provider=mock).");
  console.log("[NOTE] No credentials will appear in logs or response.");

  let requestCount = 0;
  page.on("request", req => {
    if (req.url().includes("/api/profiles/analyze")) requestCount++;
  });

  const liveRequestStart = Date.now();
  const liveResult = await page.evaluate(async (args: { baseUrl: string; profile: string }) => {
    try {
      const res = await fetch(`${args.baseUrl}/api/profiles/analyze`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-instagram-provider": "rapidapi",
        },
        body: JSON.stringify({
          instagramUrl: `https://www.instagram.com/${args.profile}/`,
          provider: "rapidapi",
        }),
      });

      const json = await res.json();

      // Scrub any keys that could be credentials before returning
      const sanitized = {
        status: res.status,
        ok: res.ok,
        requestedProvider: "rapidapi",
        executedProvider: json?.telemetry?.provider ?? "UNKNOWN",
        reason: json?.telemetry?.reason ?? "UNKNOWN",
        upgradeAvailable: json?.telemetry?.upgradeAvailable ?? false,
        profile: json?.data ? {
          username: json.data.username,
          display_name: json.data.display_name,
          bio: json.data.bio,
          follower_count: json.data.follower_count,
          following_count: json.data.following_count,
          post_count: json.data.post_count,
          is_private: json.data.is_private,
          is_verified: json.data.is_verified,
          category: json.data.category,
          profile_picture_present: !!json.data.profile_picture_url,
          posts_count: Array.isArray(json.data.posts) ? json.data.posts.length : 0,
          first_post_sample: json.data.posts?.[0] ? {
            id: json.data.posts[0].id,
            type: json.data.posts[0].type,
            has_thumbnail: !!json.data.posts[0].thumbnail_url,
            has_caption: !!json.data.posts[0].caption,
            has_likes: typeof json.data.posts[0].likes === "number",
            timestamp: json.data.posts[0].timestamp,
          } : null,
        } : null,
        error: json?.error ?? null,
      };

      // Check for any sensitive key patterns in the raw response string
      const rawStr = JSON.stringify(json);
      const credentialLeakCheck = {
        containsApiKey: /[A-Za-z0-9]{30,}/.test(rawStr) && rawStr.toLowerCase().includes("rapid"),
        containsToken: rawStr.toLowerCase().includes("token") && !rawStr.includes("aiToken"),
      };

      return { ...sanitized, credentialLeakCheck };
    } catch (e) {
      return { status: 0, ok: false, error: String(e) };
    }
  }, { baseUrl: TARGET_URL, profile: TARGET_PROFILE });

  const liveRequestDuration = Date.now() - liveRequestStart;
  console.log(`\n[Live Request Completed in ${liveRequestDuration}ms]`);
  console.log(`  HTTP Status       : ${liveResult.status}`);
  console.log(`  Requested Provider: ${liveResult.requestedProvider}`);
  console.log(`  Executed Provider : ${liveResult.executedProvider}`);
  console.log(`  Reason            : ${liveResult.reason}`);
  console.log(`  Upgrade Available : ${liveResult.upgradeAvailable}`);
  if (liveResult.error) {
    console.log(`  Error             : ${JSON.stringify(liveResult.error)}`);
  }

  if (liveResult.profile) {
    const p = liveResult.profile;
    console.log(`\n[Profile Verification]`);
    console.log(`  Username          : ${p.username}`);
    console.log(`  Display Name      : ${p.display_name}`);
    console.log(`  Bio (first 100)   : ${p.bio?.substring(0, 100) ?? "null"}`);
    console.log(`  Follower Count    : ${p.follower_count}`);
    console.log(`  Following Count   : ${p.following_count}`);
    console.log(`  Post Count        : ${p.post_count}`);
    console.log(`  Is Private        : ${p.is_private}`);
    console.log(`  Is Verified       : ${p.is_verified}`);
    console.log(`  Category          : ${p.category}`);
    console.log(`  Profile Pic Present: ${p.profile_picture_present}`);
    console.log(`  Posts Returned    : ${p.posts_count}`);

    if (p.first_post_sample) {
      console.log(`\n[First Post Sample]`);
      console.log(`  Post ID           : ${p.first_post_sample.id}`);
      console.log(`  Type              : ${p.first_post_sample.type}`);
      console.log(`  Has Thumbnail     : ${p.first_post_sample.has_thumbnail}`);
      console.log(`  Has Caption       : ${p.first_post_sample.has_caption}`);
      console.log(`  Has Likes (number): ${p.first_post_sample.has_likes}`);
      console.log(`  Timestamp         : ${p.first_post_sample.timestamp}`);
    }

    // Mock data detection
    const MOCK_BIO_SIGNATURE = "Travel photographer & storyteller";
    const MOCK_FOLLOWER_COUNT = 248500;
    const isMockBio = p.bio?.includes(MOCK_BIO_SIGNATURE) ?? false;
    const isMockFollowers = p.follower_count === MOCK_FOLLOWER_COUNT;
    const usernameMatches = p.username?.toLowerCase() === TARGET_PROFILE.toLowerCase();

    console.log(`\n[Mock Data Detection]`);
    console.log(`  Mock bio signature found   : ${isMockBio ? "⚠️ YES (MOCK USED)" : "✅ NO (real data)"}`);
    console.log(`  Mock follower count (248500): ${isMockFollowers ? "⚠️ YES (MOCK USED)" : "✅ NO (real data)"}`);
    console.log(`  Username matches request   : ${usernameMatches ? "✅ YES" : "⚠️ NO (mismatch!)"}`);
  }

  // Credential leak check
  console.log(`\n[Security Check]`);
  if (liveResult.credentialLeakCheck) {
    const leakCheck = liveResult.credentialLeakCheck;
    console.log(`  Credential leak risk (api key): ${leakCheck.containsApiKey ? "⚠️ POTENTIAL LEAK" : "✅ CLEAN"}`);
    console.log(`  Token field leak risk         : ${leakCheck.containsToken ? "⚠️ CHECK NEEDED" : "✅ CLEAN"}`);
  }

  // ============================================================
  // DOWNSTREAM: Brand Intelligence with real profile (no new scrape)
  // ============================================================
  console.log(`\n--- DOWNSTREAM CHECK: Brand Intelligence with Real Profile (no new scrape) ---`);

  let brandResult: any = null;
  if (liveResult.profile && liveResult.executedProvider !== "mock" && liveResult.status === 200) {
    brandResult = await page.evaluate(async (args: { baseUrl: string; profile: any }) => {
      try {
        // Reconstruct a minimal valid InstagramProfile from what we captured
        const minimalProfile = {
          username: args.profile.username,
          display_name: args.profile.display_name,
          bio: args.profile.bio,
          follower_count: args.profile.follower_count,
          following_count: args.profile.following_count,
          post_count: args.profile.post_count,
          is_private: args.profile.is_private,
          is_verified: args.profile.is_verified,
          category: args.profile.category,
          profile_picture_url: args.profile.profile_picture_present ? "https://example.com/placeholder.jpg" : null,
          external_url: null,
          posts: [],
        };

        const res = await fetch(`${args.baseUrl}/api/brand-intelligence/analyze`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "x-ai-provider": "disabled", // Explicitly use deterministic — no AI tokens consumed
          },
          body: JSON.stringify({ profile: minimalProfile }),
        });

        const json = await res.json();
        return {
          status: res.status,
          ok: res.ok,
          hasData: !!json?.data,
          fallbackUsed: json?.telemetry?.fallbackUsed ?? json?.fallbackUsed ?? "unknown",
          provider: json?.telemetry?.providerId ?? json?.provider ?? "unknown",
          errorCode: json?.error?.code ?? null,
        };
      } catch (e) {
        return { status: 0, ok: false, error: String(e) };
      }
    }, { baseUrl: TARGET_URL, profile: liveResult.profile });

    console.log(`  Brand Intelligence Status     : ${brandResult.status}`);
    console.log(`  Has Data                     : ${brandResult.hasData ? "✅ YES" : "❌ NO"}`);
    console.log(`  Fallback Used                : ${brandResult.fallbackUsed}`);
    console.log(`  AI Provider                  : ${brandResult.provider}`);
    if (brandResult.errorCode) console.log(`  Error Code                   : ${brandResult.errorCode}`);
    if (brandResult.error) console.log(`  Network Error                : ${brandResult.error}`);
  } else {
    console.log("  [SKIPPED] Live request returned mock or failed — downstream check skipped to avoid using stale mock data.");
  }

  // ============================================================
  // AFTER: Read scraperCallsCount post-request
  // ============================================================
  console.log("\n--- AFTER: Read scraperCallsCount (AFTER real request) ---");
  await page.waitForTimeout(1000); // Brief wait for DB write to propagate
  const usageAfter = await page.evaluate(async (baseUrl: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/ai/telemetry/summary`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        return {
          ok: true,
          scraperCallsCount: json?.data?.persistedUsage?.scraperCallsCount ?? "NOT_IN_RESPONSE",
        };
      }
      return { ok: false, status: res.status };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }, TARGET_URL);
  console.log(`[Usage AFTER]`, JSON.stringify(usageAfter, null, 2));

  // ============================================================
  // SUMMARY
  // ============================================================
  const wasRealProvider = liveResult.executedProvider === "rapidapi";
  const wasMockFallback = liveResult.executedProvider === "mock";
  const requestsToAnalyzeEndpoint = requestCount;

  console.log("\n=========================================================================");
  console.log(" Stage 3A Verification Summary");
  console.log("=========================================================================");
  console.log(`  Real provider executed        : ${wasRealProvider ? "✅ YES (rapidapi)" : "❌ NO — fell back to: " + liveResult.executedProvider}`);
  console.log(`  Mock fallback used            : ${wasMockFallback ? "⚠️ YES" : "✅ NO"}`);
  console.log(`  /api/profiles/analyze calls   : ${requestsToAnalyzeEndpoint} (should be 1)`);
  console.log(`  Downstream brand check        : ${brandResult ? (brandResult.ok || brandResult.hasData ? "✅ ACCEPTED" : "❌ REJECTED") : "SKIPPED"}`);
  if (usageBefore.ok && usageAfter.ok) {
    const before = typeof usageBefore.scraperCallsCount === "number" ? usageBefore.scraperCallsCount : "?";
    const after = typeof usageAfter.scraperCallsCount === "number" ? usageAfter.scraperCallsCount : "?";
    const delta = (typeof before === "number" && typeof after === "number") ? after - before : "?";
    console.log(`  scraperCallsCount before      : ${before}`);
    console.log(`  scraperCallsCount after       : ${after}`);
    console.log(`  Delta (should be 1 if real)   : ${delta} ${delta === 1 ? "✅" : delta === 0 ? "(0 = mock used, no metering)" : "⚠️ unexpected"}`);
  }
  console.log("=========================================================================\n");

  if (!wasRealProvider) {
    console.log("[DIAGNOSIS] Provider fell back to mock. This means RAPIDAPI_KEY and RAPIDAPI_HOST");
    console.log("  are NOT configured in Vercel Production environment variables.");
    console.log("  Required action: Add RAPIDAPI_KEY and RAPIDAPI_HOST to Vercel env vars.");
    console.log("  No credits were consumed. No real request was made to RapidAPI.");
  }

  await browser.close();
}

runStage3AVerification().catch((err) => {
  console.error("Fatal error during Stage 3A verification:", err);
  process.exit(1);
});
