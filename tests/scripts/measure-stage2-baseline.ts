import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

/**
 * ReelForge AI v2.0 — Milestone 6 Stage 2 Performance Baseline Measurement
 *
 * Measures:
 * 1. Initial `/profiles` page navigation and loading timing
 * 2. Exact count of `GET /api/v2/projects` requests on page mount
 * 3. Duration and response code of each `GET /api/v2/projects` request
 * 4. Duration and timing of `GET /api/ai/telemetry/summary` requests
 * 5. Refetch triggers when toggling `viewMode` (`Studio` -> `Workspace` -> `Settings` -> `Studio`)
 */
async function measureBaseline() {
  const TARGET_URL = process.env.TEST_URL || "https://reel-forge-ai-psi.vercel.app";
  const STORAGE_DIR = path.resolve("C:/Users/acer/.gemini/antigravity-ide");
  const STORAGE_STATE_PATH = path.join(STORAGE_DIR, "auth-storage.json");

  console.log("\n=========================================================================");
  console.log(" ReelForge AI — Milestone 6 Stage 2: Performance Baseline Measurement ");
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

  // Network activity tracker
  interface RequestLog {
    url: string;
    method: string;
    startTime: number;
    endTime?: number;
    durationMs?: number;
    status?: number;
  }

  const projectRequests: RequestLog[] = [];
  const telemetryRequests: RequestLog[] = [];
  const requestTimestamps = new Map<string, number>();

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/api/v2/projects") && req.method() === "GET") {
      const log: RequestLog = { url, method: req.method(), startTime: performance.now() };
      projectRequests.push(log);
      requestTimestamps.set(req.url() + "_" + projectRequests.length, log.startTime);
    } else if (url.includes("/api/ai/telemetry/summary") && req.method() === "GET") {
      const log: RequestLog = { url, method: req.method(), startTime: performance.now() };
      telemetryRequests.push(log);
      requestTimestamps.set(req.url() + "_" + telemetryRequests.length, log.startTime);
    }
  });

  page.on("response", async (res) => {
    const url = res.url();
    const endTime = performance.now();
    if (url.includes("/api/v2/projects") && res.request().method() === "GET") {
      const lastReq = projectRequests.find((r) => r.endTime === undefined && r.url === url);
      if (lastReq) {
        lastReq.endTime = endTime;
        lastReq.durationMs = Math.round(endTime - lastReq.startTime);
        lastReq.status = res.status();
      }
    } else if (url.includes("/api/ai/telemetry/summary") && res.request().method() === "GET") {
      const lastReq = telemetryRequests.find((r) => r.endTime === undefined && r.url === url);
      if (lastReq) {
        lastReq.endTime = endTime;
        lastReq.durationMs = Math.round(endTime - lastReq.startTime);
        lastReq.status = res.status();
      }
    }
  });

  console.log("\n--- TEST 1: Initial Page Navigation to `/profiles` (Studio) ---");
  const navStartTime = performance.now();
  await page.goto(`${TARGET_URL}/profiles`, { waitUntil: "domcontentloaded", timeout: 25000 });
  const domLoadedTime = Math.round(performance.now() - navStartTime);
  console.log(`[Timing] DOMContentLoaded achieved in: ${domLoadedTime} ms`);

  // Wait 3 seconds for all initial useEffect network requests to complete
  await page.waitForTimeout(3000);
  const initialMountTime = Math.round(performance.now() - navStartTime);
  console.log(`[Timing] Total initial network stabilization window: ${initialMountTime} ms`);

  console.log(`\n[Baseline Requests Captured on Initial Mount]:`);
  console.log(`  GET /api/v2/projects count: ${projectRequests.length}`);
  projectRequests.forEach((req, idx) => {
    console.log(`    Request #${idx + 1}: Status ${req.status ?? "N/A"} | Duration: ${req.durationMs ?? "N/A"} ms`);
  });

  console.log(`  GET /api/ai/telemetry/summary count: ${telemetryRequests.length}`);
  telemetryRequests.forEach((req, idx) => {
    console.log(`    Request #${idx + 1}: Status ${req.status ?? "N/A"} | Duration: ${req.durationMs ?? "N/A"} ms`);
  });

  // Now measure tab switching (viewMode triggers)
  const initialProjectReqCount = projectRequests.length;
  const initialTelemetryReqCount = telemetryRequests.length;

  console.log("\n--- TEST 2: Tab Switching & Refetch Dependency Check ---");

  // Click Workspace tab
  console.log("[Action] Clicking 'Workspace' tab button...");
  const workspaceBtn = page.locator("button", { hasText: "Workspace" }).first();
  if (await workspaceBtn.isVisible()) {
    const t0 = performance.now();
    await workspaceBtn.click();
    await page.waitForTimeout(2000);
    const t1 = Math.round(performance.now() - t0);
    const newReqs = projectRequests.length - initialProjectReqCount;
    console.log(`[Result] Clicking 'Workspace' tab triggered ${newReqs} new GET /api/v2/projects requests over ${t1} ms`);
  } else {
    console.log("[Warning] Workspace button not visible on page.");
  }

  const postWorkspaceReqCount = projectRequests.length;

  // Click Settings tab
  console.log("[Action] Clicking 'Settings' tab button...");
  const settingsBtn = page.locator("button", { hasText: "Settings" }).first();
  if (await settingsBtn.isVisible()) {
    const t0 = performance.now();
    await settingsBtn.click();
    await page.waitForTimeout(2000);
    const t1 = Math.round(performance.now() - t0);
    const newReqs = projectRequests.length - postWorkspaceReqCount;
    const newTelemetryReqs = telemetryRequests.length - initialTelemetryReqCount;
    console.log(`[Result] Clicking 'Settings' tab triggered ${newReqs} new GET /api/v2/projects requests and ${newTelemetryReqs} new GET /api/ai/telemetry/summary requests over ${t1} ms`);
  } else {
    console.log("[Warning] Settings button not visible on page.");
  }

  const postSettingsReqCount = projectRequests.length;

  // Click back to Studio tab
  console.log("[Action] Clicking back to 'Studio' tab button...");
  const studioBtn = page.locator("button", { hasText: "Studio" }).first();
  if (await studioBtn.isVisible()) {
    const t0 = performance.now();
    await studioBtn.click();
    await page.waitForTimeout(2000);
    const t1 = Math.round(performance.now() - t0);
    const newReqs = projectRequests.length - postSettingsReqCount;
    console.log(`[Result] Clicking back to 'Studio' tab triggered ${newReqs} new GET /api/v2/projects requests over ${t1} ms`);
  }

  console.log("\n=========================================================================");
  console.log(" Summary of Baseline Findings:");
  console.log(`   Total GET /api/v2/projects requests during test session: ${projectRequests.length}`);
  console.log(`   Total GET /api/ai/telemetry/summary requests during test session: ${telemetryRequests.length}`);
  console.log("=========================================================================\n");

  await browser.close();
}

measureBaseline().catch((err) => {
  console.error("Fatal error during baseline measurement:", err);
  process.exit(1);
});
