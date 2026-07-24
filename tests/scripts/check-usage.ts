import { chromium } from "@playwright/test";
import * as path from "path";

const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
const STORAGE_STATE_PATH = path.resolve("C:/Users/acer/.gemini/antigravity-ide/auth-storage.json");

async function checkUsage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();

  await page.goto(PROD_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  const res = await page.request.get(`${PROD_URL}/api/billing/summary`);
  const json = await res.json();
  console.log("Current Billing Summary Usage:");
  console.log(JSON.stringify(json?.data?.usage || json, null, 2));

  await browser.close();
}

checkUsage().catch(console.error);
