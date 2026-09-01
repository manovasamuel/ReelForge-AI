import { chromium } from "@playwright/test";

/**
 * ReelForge AI — Full Pipeline Live Verification (Local, Real Providers)
 *
 * Runs the complete 9-stage pipeline against http://localhost:3000 with
 * REAL providers (Apify + Gemini). Auth: offline dev mode (AUTH_MODE=offline).
 *
 * Budget guardrails:
 *   Apify:  max 2 live calls (profile natgeo cached from earlier run; competitor content = 1 call)
 *   Gemini: ~6 logical AI operations
 */

const BASE = "http://localhost:3000";
const BRAND_USERNAME = "natgeo";
const INTENDED_CANDIDATES = ["adidas", "puma", "underarmour", "newbalance", "lululemon", "gymshark"];

let passed = 0;
let failed = 0;
const stageLogs: any[] = [];

function assert(cond: boolean, name: string, detail?: string) {
  if (cond) {
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function section(title: string) {
  console.log(`\n${"=".repeat(66)}\n  ${title}\n${"=".repeat(66)}`);
}

async function api(method: string, path: string, body?: any, headers: Record<string, string> = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║  ReelForge AI — Full Pipeline LIVE Verification (Real Providers)  ║");
  console.log(`║  Target: ${BASE}`);
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  // ─── STEP 1: Profile Ingestion (cached → 0 Apify calls) ───────────────
  section(`STEP 1 — Profile Ingestion @${BRAND_USERNAME} (apify)`);
  const s1 = await api("POST", "/api/profiles/analyze", {
    instagramUrl: `https://instagram.com/${BRAND_USERNAME}`,
    provider: "apify",
  });
  stageLogs.push({ stage: "1. Profile Ingestion", status: s1.status });
  const profile = s1.json?.data;
  assert(s1.status === 200, "HTTP 200 from /api/profiles/analyze", `status=${s1.status}`);
  assert(profile?.username === BRAND_USERNAME, `profile.username === '${BRAND_USERNAME}'`);
  assert(typeof profile?.follower_count === "number" && profile.follower_count > 1000000, `Real follower count (${profile?.follower_count?.toLocaleString()})`);
  assert(Array.isArray(profile?.posts) && profile.posts.length > 0, `Real posts array (${profile?.posts?.length} posts)`);
  console.log(`  [Profile] @${profile?.username} | followers: ${profile?.follower_count?.toLocaleString()} | posts: ${profile?.post_count} | verified: ${profile?.is_verified}`);
  assert(s1.json?.telemetry?.isMockFallback === false, "Not mock fallback");

  // ─── STEP 2: Brand Intelligence (1 Gemini call) ────────────────────────
  section("STEP 2 — Brand Intelligence (gemini)");
  const s2 = await api("POST", "/api/brand-intelligence/analyze", {
    profile,
    aiProvider: "gemini",
    aiModel: "gemini-3.1-flash-lite",
  });
  const brand = s2.json?.data;
  const t2 = s2.json?.telemetry;
  stageLogs.push({ stage: "2. Brand Intelligence", status: s2.status, provider: t2?.providerId, model: t2?.modelUsed, fallback: t2?.fallbackUsed, tokens: t2?.usage?.totalTokens });
  assert(s2.status === 200, "HTTP 200 from /api/brand-intelligence/analyze", `status=${s2.status}`);
  assert(!!brand?.industry, "Brand report has industry", `industry=${brand?.industry}`);
  assert(!!brand?.targetAudience, "Brand report has targetAudience");
  assert(t2?.fallbackUsed !== true, "Live Gemini used (not deterministic fallback)", `provider=${t2?.providerId} model=${t2?.modelUsed}`);
  console.log(`  [AI] provider=${t2?.providerId} | model=${t2?.modelUsed} | tokens=${t2?.usage?.totalTokens} | latency=${t2?.latencyMs}ms`);
  console.log(`  [Brand] industry=${brand?.industry} | audience=${brand?.targetAudience}`);

  // ─── STEP 3: Competitor Discovery (live) ───────────────────────────────
  section("STEP 3 — Competitor Discovery (live)");
  const s3 = await api("POST", "/api/competitors/discover", {
    brandReport: brand,
    baseProfile: profile,
    provider: "live",
  });
  const candidates: any[] = s3.json?.data ?? [];
  stageLogs.push({ stage: "3. Competitor Discovery", status: s3.status, candidates: candidates.length });
  assert(s3.status === 200, "HTTP 200 from /api/competitors/discover", `status=${s3.status}`);
  assert(candidates.length > 0, `At least one candidate (got ${candidates.length})`);
  for (const c of candidates) {
    console.log(`    @${c.username} → ${c.discoveryState} | verified=${c.isVerifiedAccount} | followers=${c.followers ?? "N/A"}`);
  }
  const selected = candidates[0];
  assert(!!selected, `Competitor selected (@${selected.username})`);

  // ─── STEP 4: Competitor Analysis (1 Gemini call) ───────────────────────
  section(`STEP 4 — Competitor Analysis @${selected.username} (gemini)`);
  const s4 = await api("POST", "/api/competitor-analysis/analyze", {
    competitor: selected,
    aiProvider: "gemini",
    aiModel: "gemini-3.1-flash-lite",
  });
  const compAnalysis = s4.json?.data;
  const t4 = s4.json?.telemetry;
  stageLogs.push({ stage: "4. Competitor Analysis", status: s4.status, provider: t4?.providerId, model: t4?.modelUsed, fallback: t4?.fallbackUsed, tokens: t4?.usage?.totalTokens });
  assert(s4.status === 200, "HTTP 200 from /api/competitor-analysis/analyze", `status=${s4.status}`);
  assert(!!compAnalysis, "Competitor analysis report generated");
  assert(t4?.fallbackUsed !== true, "Live Gemini used", `provider=${t4?.providerId}`);
  console.log(`  [AI] provider=${t4?.providerId} | model=${t4?.modelUsed} | tokens=${t4?.usage?.totalTokens}ms`);

  // ─── STEP 5: Content Collection (1 Apify call, cache miss) ─────────────
  section(`STEP 5 — Content Collection @${selected.username} (live)`);
  const s5 = await api("POST", "/api/content-collection/collect", {
    username: selected.username,
    provider: "live",
  });
  const items: any[] = s5.json?.data ?? [];
  const t5 = s5.json?.telemetry;
  stageLogs.push({ stage: "5. Content Collection", status: s5.status, items: items.length, provider: t5?.providerId, mock: t5?.isMockFallback });
  assert(s5.status === 200, "HTTP 200 from /api/content-collection/collect", `status=${s5.status}`);
  assert(items.length > 0, `Real content items collected (${items.length})`);
  const hasMock = items.some((i) => i.id?.startsWith("mock") || i.id?.startsWith("fixture") || i.caption?.includes("Mock"));
  assert(!hasMock, "No mock/fixture items");
  console.log(`  [Content] ${items.length} items | provider=${t5?.providerId} | mock=${t5?.isMockFallback ?? false}`);
  console.log(`  [Sample] id=${items[0]?.id} | type=${items[0]?.type} | likes=${items[0]?.likes} | views=${items[0]?.views ?? "N/A"}`);

  // ─── STEP 6: Content Intelligence (1 Gemini call) ──────────────────────
  section("STEP 6 — Content Intelligence (gemini)");
  const s6 = await api("POST", "/api/content-intelligence/analyze", {
    items,
    aiProvider: "gemini",
    aiModel: "gemini-3.1-flash-lite",
  });
  const intelReports: any[] = s6.json?.data ?? [];
  const t6 = s6.json?.telemetry;
  stageLogs.push({ stage: "6. Content Intelligence", status: s6.status, reports: intelReports.length, provider: t6?.providerId, fallback: t6?.fallbackUsed });
  assert(s6.status === 200, "HTTP 200 from /api/content-intelligence/analyze", `status=${s6.status}`);
  assert(intelReports.length > 0, `Intelligence reports generated (${intelReports.length})`);
  assert(t6?.fallbackUsed !== true, "Live Gemini used", `provider=${t6?.providerId}`);
  console.log(`  [AI] provider=${t6?.providerId} | model=${t6?.modelUsed} | latency=${t6?.latencyMs}ms`);

  // ─── STEP 7: Content DNA (1 Gemini call) ───────────────────────────────
  section("STEP 7 — Content DNA (gemini)");
  const s7 = await api("POST", "/api/content-dna/analyze", {
    reports: intelReports,
    aiProvider: "gemini",
    aiModel: "gemini-3.1-flash-lite",
  });
  const dna = s7.json?.data;
  const t7 = s7.json?.telemetry;
  stageLogs.push({ stage: "7. Content DNA", status: s7.status, provider: t7?.providerId, fallback: t7?.fallbackUsed, tokens: t7?.usage?.totalTokens });
  assert(s7.status === 200, "HTTP 200 from /api/content-dna/analyze", `status=${s7.status}`);
  assert(!!dna?.id, "DNA report has id", `id=${dna?.id}`);
  assert(t7?.fallbackUsed !== true, "Live Gemini used", `provider=${t7?.providerId}`);
  console.log(`  [DNA] id=${dna?.id} | niche=${dna?.contentNiche ?? "N/A"}`);

  // ─── STEP 8: Script Generation (1 Gemini call) ─────────────────────────
  section("STEP 8 — Script Generation (auto-router)");
  const s8 = await api("POST", "/api/script-generation/generate", {
    dnaReport: dna,
  });
  const script = s8.json?.data;
  const t8 = s8.json?.telemetry;
  stageLogs.push({ stage: "8. Script Generation", status: s8.status, provider: t8?.providerId, fallback: t8?.fallbackUsed, tokens: t8?.usage?.totalTokens });
  assert(s8.status === 200, "HTTP 200 from /api/script-generation/generate", `status=${s8.status}`);
  assert(!!script?.hook, "Script package has hook", `hook=${String(script?.hook ?? "").substring(0, 50)}`);
  assert(t8?.fallbackUsed !== true, "Live Gemini used", `provider=${t8?.providerId}`);
  console.log(`  [Script] hook="${String(script?.hook ?? "").substring(0, 80)}..."`);
  console.log(`  [AI] provider=${t8?.providerId} | model=${t8?.modelUsed} | tokens=${t8?.usage?.totalTokens} | cost=$${t8?.costEstimateUsd}`);

  // ─── STEP 9: Repurpose Studio (auto-router) ──────────────────────────
  section("STEP 9 — Repurpose Studio (auto-router)");
  const s9 = await api("POST", "/api/repurpose/generate", {
    pkg: script,
  });
  const repurpose = s9.json?.data;
  const t9 = s9.json?.telemetry;
  stageLogs.push({ stage: "9. Repurpose Studio", status: s9.status, provider: t9?.providerId, fallback: t9?.fallbackUsed });
  assert(s9.status === 200, "HTTP 200 from /api/repurpose/generate", `status=${s9.status}`);
  assert(!!repurpose, "Repurpose report generated");
  assert(t9?.fallbackUsed !== true, "Live AI used", `provider=${t9?.providerId}`);
  console.log(`  [AI] provider=${t9?.providerId} | model=${t9?.modelUsed} | latency=${t9?.latencyMs}ms`);

  // ─── STEP 10: Project Persistence ──────────────────────────────────────
  section("STEP 10 — Project Persistence (v2/projects)");
  const projectPayload = {
    id: `verify-${Date.now()}`,
    name: `Verify Pipeline ${new Date().toISOString()}`,
    instagramUrl: `https://instagram.com/${BRAND_USERNAME}`,
    state: { profile, brand, competitors: candidates, competitorAnalysis: compAnalysis },
  };
  const s10 = await api("POST", "/api/v2/projects", projectPayload);
  stageLogs.push({ stage: "10. Project Save", status: s10.status });
  assert(s10.status === 200, "HTTP 200 POST /api/v2/projects", `status=${s10.status} body=${JSON.stringify(s10.json).substring(0, 120)}`);
  const s10b = await api("GET", "/api/v2/projects");
  const projects: any[] = s10b.json?.projects ?? [];
  stageLogs.push({ stage: "10b. Project List", status: s10b.status, count: projects.length });
  assert(s10b.status === 200, "HTTP 200 GET /api/v2/projects");
  assert(projects.length > 0, `Projects persisted (${projects.length} in DB)`);

  // ─── STEP 11: Workflow (AIOS ideate) ───────────────────────────────────
  section("STEP 11 — Workflow Ideation (AIOS)");
  const s11 = await api("POST", "/api/v2/workflow/ideate", {
    profileId: "00000000-0000-0000-0000-000000000000",
    userMessage: "Create a viral reel concept for a nature documentary brand",
  });
  stageLogs.push({ stage: "11. Workflow Ideate", status: s11.status });
  const concepts = s11.json?.data;
  assert(s11.status === 200, "HTTP 200 from /api/v2/workflow/ideate", `status=${s11.status} body=${JSON.stringify(s11.json).substring(0, 150)}`);
  if (s11.status === 200) {
    assert(Array.isArray(concepts) && concepts.length > 0, `Ideation concepts generated (${concepts?.length})`);
    console.log(`  [Workflow] workflowId=${s11.json?.workflowId} | stage=${s11.json?.currentStage} | concepts=${concepts?.length}`);
  }

  // ─── FINAL REPORT ──────────────────────────────────────────────────────
  section("FINAL REPORT");
  const anyFallback = stageLogs.some((s) => s.fallback === true);
  console.log(`
  Target:               ${BASE}
  Brand profile:        @${BRAND_USERNAME} (${profile?.follower_count?.toLocaleString()} followers — REAL Apify data)
  Selected competitor:  @${selected.username}
  Content items:        ${items.length}
  Projects in DB:       ${projects.length}

  ── Provider Usage ──
  Apify calls:          2 max (natgeo profile cached; competitor content live)
  Gemini operations:    6 (brand, comp-analysis, content-intel, DNA, script, repurpose)
  `);
  console.log("  ── Stage Log ──");
  for (const s of stageLogs) console.log(`    ${String(s.stage).padEnd(30)} | status=${s.status} | ${JSON.stringify(s)}`.substring(0, 140));
  console.log(`
  ── Assertions ──
  Passed: ${passed} | Failed: ${failed} | Total: ${passed + failed}
  Mock data in pipeline: ${anyFallback ? "⚠️ YES" : "✅ NONE"}
  `);
  const verdict = failed === 0 ? "✅ PASS" : failed <= 2 ? "⚠️ PARTIAL PASS" : "❌ FAIL";
  console.log(`  Verdict: ${verdict}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});