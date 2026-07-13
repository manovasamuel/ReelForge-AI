/**
 * ReelForge AI — Live Production Gemini Console Verification Snippet
 * 
 * Instructions:
 * If you are already authenticated inside `npx playwright open` or your regular browser on `https://reel-forge-ai-psi.vercel.app`,
 * simply open Developer Tools (F12 or Ctrl+Shift+I -> Console tab) and paste this entire async self-executing function
 * to verify live Gemini execution right inside your active session without any OTP re-login!
 */
(async () => {
  console.clear();
  console.log("=======================================================================");
  console.log(" ReelForge AI v2.0 — Milestone 4: Live Production Gemini Verification ");
  console.log("=======================================================================\n");

  const clerk = (window as any).Clerk;
  if (!clerk || !clerk.session) {
    console.error("[FAIL] ❌ Active Clerk session not found on this window. Please log in first.");
    return;
  }

  console.log(`[AUTH CHECK] ✅ Authenticated as User ID: ${clerk.user?.id || clerk.session?.user?.id} | Email: ${clerk.user?.primaryEmailAddress?.emailAddress || "N/A"}`);
  const token = await clerk.session.getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // 1. Check /api/ai/health
  console.log("\n[Step 1/3] Querying /api/ai/health inside active authenticated session...");
  try {
    const healthRes = await fetch("/api/ai/health", { credentials: "include", headers });
    const healthJson = await healthRes.json();
    console.log(`[/api/ai/health] HTTP Status: ${healthRes.status}`);
    const geminiStatus = healthJson?.data?.find((p: any) => p.providerId === "gemini");
    if (geminiStatus) {
      console.log(`[AI Health] Gemini Provider -> isAvailable: ${geminiStatus.isAvailable} | Circuit State: ${geminiStatus.circuitState}`);
      if (geminiStatus.isAvailable) {
        console.log("[PASS] ✅ Production server detects Gemini as AVAILABLE!");
      } else {
        console.warn("[WARN] ⚠️ Gemini isAvailable: false. Verify Vercel settings and deploy status.");
      }
    } else {
      console.log("[AI Health] Full Response:", healthJson);
    }
  } catch (err) {
    console.error("[FAIL] ❌ Error querying /api/ai/health:", err);
  }

  // 2. Execute Real Gemini Request via POST /api/brand-intelligence/analyze
  console.log("\n[Step 2/3] Executing real Gemini generation request via POST /api/brand-intelligence/analyze...");
  const startTime = performance.now();
  try {
    const analyzeRes = await fetch("/api/brand-intelligence/analyze", {
      method: "POST",
      credentials: "include",
      headers: { ...headers, "x-ai-provider": "gemini", "x-ai-model": "gemini-1.5-flash" },
      body: JSON.stringify({
        profile: {
          username: "reel_forge_studio",
          display_name: "ReelForge Studio AI",
          bio: "Next-gen AI short-form video script studio for creators and brands.",
          follower_count: 45000,
          following_count: 320,
          post_count: 150,
          category: "Creator Studio",
          posts: [{ id: "post-1", caption: "How to craft viral hooks that stop the scroll using AI data #reelsai", likes: 1250, comments: 84, timestamp: new Date().toISOString(), type: "video" }]
        },
        aiProvider: "gemini",
        aiModel: "gemini-1.5-flash"
      })
    });
    const clientLatency = Math.round(performance.now() - startTime);
    const analyzeJson = await analyzeRes.json();
    console.log(`[/api/brand-intelligence/analyze] HTTP Status: ${analyzeRes.status} (${clientLatency}ms total client RTT)`);

    if (analyzeRes.status === 200 && analyzeJson.telemetry && analyzeJson.data) {
      const t = analyzeJson.telemetry;
      console.log("\n=======================================================================");
      console.log("             LIVE GEMINI PRODUCTION EXECUTION REPORT                  ");
      console.log("=======================================================================");
      console.log(`Provider Used      : ${t.provider || t.providerId || "unknown"}`);
      console.log(`Model Used         : ${t.modelUsed || "unknown"}`);
      console.log(`fallbackUsed       : ${t.fallbackUsed === true ? "true (Deterministic Fallback)" : "false (Live Google Gemini)"}`);
      console.log(`Prompt Tokens      : ${t.usage?.promptTokens ?? "N/A"}`);
      console.log(`Completion Tokens  : ${t.usage?.completionTokens ?? "N/A"}`);
      console.log(`Total Tokens       : ${t.usage?.totalTokens ?? "N/A"}`);
      console.log(`Server Latency (ms): ${t.latencyMs ?? "N/A"} ms`);
      console.log(`Estimated USD Cost : $${t.costEstimateUsd ?? "N/A"}`);
      console.log(`Reason / Status    : ${t.reason ?? "OK"}`);
      console.log("=======================================================================\n");

      const d = analyzeJson.data;
      if (d.industry && d.brandType && Array.isArray(d.primaryContentPillars)) {
        console.log("[PASS] ✅ Structured JSON Schema Validation Passed!");
        console.log(`Industry: "${d.industry}" | Brand Type: "${d.brandType}" | Target Audience: "${d.targetAudience}"`);
      } else {
        console.error("[FAIL] ❌ Schema validation error — missing required fields:", d);
      }
    } else {
      console.error("[FAIL] ❌ Unexpected analyze response:", analyzeJson);
    }
  } catch (err) {
    console.error("[FAIL] ❌ Error executing real Gemini generation request:", err);
  }

  // 3. Re-verify /api/v2/health
  console.log("\n[Step 3/3] Re-verifying public /api/v2/health endpoint...");
  try {
    const v2Res = await fetch("/api/v2/health");
    const v2Json = await v2Res.json();
    console.log(`[/api/v2/health] HTTP Status: ${v2Res.status} | Status: "${v2Json.status}" | Database: "${v2Json.database}"`);
    if (v2Res.status === 200 && v2Json.status === "healthy" && v2Json.database === "connected") {
      console.log("[PASS] ✅ Public health endpoint healthy & production database connected.");
    }
  } catch (err) {
    console.error("[FAIL] ❌ Error checking /api/v2/health:", err);
  }

  console.log("\n=======================================================================");
  console.log("             Live Production Verification Complete!                   ");
  console.log("=======================================================================\n");
})();
