import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const PROD_URL = "https://reel-forge-ai-psi.vercel.app";
const STORAGE_STATE_PATH = path.resolve("C:/Users/acer/.gemini/antigravity-ide/auth-storage.json");

async function checkUserInfo() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const page = await context.newPage();

  await page.goto(PROD_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const clerkInfo = await page.evaluate(() => {
    const u = (window as any).Clerk?.user;
    if (!u) return null;
    return {
      clerkId: u.id,
      email: u.primaryEmailAddress?.emailAddress || null,
      fullName: u.fullName || null,
      username: u.username || null,
      createdAt: u.createdAt || null,
    };
  });

  console.log("=== Authenticated Clerk User Details ===");
  console.log(JSON.stringify(clerkInfo, null, 2));

  await browser.close();
}

checkUserInfo().catch(console.error);
