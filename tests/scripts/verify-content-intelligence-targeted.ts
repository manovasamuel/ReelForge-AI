import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
const EMAIL = process.env.DEV_CLERK_TEST_EMAIL || "mmanovasamuel+test@gmail.com";
const PASSWORD = process.env.DEV_CLERK_TEST_PASSWORD || "ReelForgeTest2026!";
const STORAGE_STATE_PATH = path.resolve("C:/Users/acer/.gemini/antigravity-ide/auth-storage.json");

const mockAdidasItems = Array.from({ length: 12 }).map((_, idx) => ({
  id: `adidas-reel-${idx + 1}-${Date.now()}`,
  type: idx % 3 === 0 ? "carousel" : "reel",
  caption: `Step into performance. The new Ultraboost ${idx + 1} engineered for zero distraction. #adidas #running #ultraboost #sports`,
  views: idx % 2 === 0 ? 1250000 + idx * 50000 : 0,
  viewsAvailable: idx % 2 === 0,
  likes: 45000 + idx * 2000,
  comments: 650 + idx * 30,
  url: `https://instagram.com/p/mock_${idx + 1}`,
  thumbnailUrl: `https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400`,
  publishedAt: new Date(Date.now() - idx * 86400000).toISOString(),
}));

async function runTargetedVerification() {
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║    Targeted Production Verification — Content Intelligence       ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");
  console.log(`Target URL: ${PROD_URL}`);

  const browser = await chromium.launch({ headless: true });
  let context;
  if (fs.existsSync(STORAGE_STATE_PATH)) {
    console.log(`[Session] Loading persisted Clerk auth state from: ${STORAGE_STATE_PATH}`);
    context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  } else {
    context = await browser.newContext();
  }
  const page = await context.newPage();

  try {
    console.log(`\n── 1. Authenticating with Clerk (${EMAIL}) ──`);
    await page.goto(PROD_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2000);

    const authState = await page.evaluate(async () => {
      const clerk = (window as any).Clerk;
      return Boolean(clerk?.user || clerk?.session);
    });

    if (!authState) {
      console.log("  Navigating to sign-in page...");
      await page.goto(`${PROD_URL}/sign-in`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(3000);

      const emailInput = page.locator('input[type="email"], input[name="identifier"], input[id="identifier-field"]');
      await emailInput.waitFor({ state: "visible", timeout: 15000 });
      await emailInput.fill(EMAIL);
      await page.waitForTimeout(500);
      
      const continueBtn = page.locator('button.cl-formButtonPrimary, button[data-localization-key="formButtonPrimary"]').first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
      } else {
        await page.keyboard.press("Enter");
      }
      await page.waitForTimeout(3000);

      const passwordInput = page.locator('input[type="password"]:not([aria-hidden="true"]), input[name="password"]:not([aria-hidden="true"]), input.cl-formFieldInput[type="password"]').first();
      await passwordInput.waitFor({ state: "visible", timeout: 15000 });
      await passwordInput.fill(PASSWORD);
      await page.waitForTimeout(500);

      const submitBtn = page.locator('button.cl-formButtonPrimary, button[data-localization-key="formButtonPrimary"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      } else {
        await page.keyboard.press("Enter");
      }

      console.log("  Waiting for redirect to complete...");
      await page.waitForTimeout(6000);

      // Check session again
      let authenticated = false;
      for (let i = 0; i < 10; i++) {
        const check = await page.evaluate(() => Boolean((window as any).Clerk?.user || (window as any).Clerk?.session));
        if (check || !page.url().includes("/sign-in")) {
          authenticated = true;
          break;
        }
        await page.waitForTimeout(2000);
      }

      if (!authenticated) {
        await page.screenshot({ path: path.resolve(__dirname, "../../auth-debug.png"), fullPage: true });
        const bodyText = await page.evaluate(() => document.body.innerText || "");
        console.error("❌ [ABORT] Failed to establish Clerk session automatically. URL:", page.url());
        console.error("── Visible Page Text ──\n", bodyText);
        await browser.close();
        process.exit(1);
      }

      await context.storageState({ path: STORAGE_STATE_PATH });
      console.log("  ✅ Session established and saved to storageState.");
    } else {
      console.log("  ✅ Existing session active.");
    }

    console.log(`\n── 2. Invoking /api/content-intelligence/analyze with 12 items ──`);
    await page.goto(PROD_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const startTime = performance.now();
    const result = await page.evaluate(async (items) => {
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
    }, mockAdidasItems);

    const durationMs = Math.round(performance.now() - startTime);
    console.log(`  HTTP Status: ${result.status} | Request Duration: ${durationMs}ms`);

    const reports = result.json?.data || [];
    const telemetry = result.json?.telemetry;

    console.log(`\n── 3. Verification Results ────────────────────────────────────────`);
    console.log(`  Reports Returned: ${reports.length} / 12 expected`);
    console.log(`  Provider ID:      ${telemetry?.providerId}`);
    console.log(`  Model Used:       ${telemetry?.modelUsed}`);
    console.log(`  Fallback Used:    ${telemetry?.fallbackUsed}`);
    console.log(`  Latency Reported: ${telemetry?.latencyMs}ms`);
    console.log(`  Tokens Used:      ${telemetry?.usage?.totalTokens || "N/A"}`);

    if (result.status !== 200) {
      console.error(`\n❌ [FAIL] HTTP Status ${result.status}:`, JSON.stringify(result.json, null, 2));
      process.exit(1);
    }
    if (reports.length !== 12) {
      console.error(`\n❌ [FAIL] Expected 12 reports, got ${reports.length}`);
      process.exit(1);
    }
    if (telemetry?.fallbackUsed !== false) {
      console.error(`\n❌ [FAIL] Expected fallbackUsed === false, got ${telemetry?.fallbackUsed}`);
      process.exit(1);
    }
    if (telemetry?.providerId !== "gemini") {
      console.error(`\n❌ [FAIL] Expected providerId === 'gemini', got ${telemetry?.providerId}`);
      process.exit(1);
    }

    console.log(`\n══════════════════════════════════════════════════════════════════`);
    console.log(`  Targeted Content Intelligence Verdict: ✅ PASS`);
    console.log(`  Successfully analyzed 12 items via live Gemini with zero truncation!`);
    console.log(`══════════════════════════════════════════════════════════════════\n`);
    await browser.close();
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ [ERROR] Verification script exception: ${error.message}`);
    await browser.close();
    process.exit(1);
  }
}

runTargetedVerification();
