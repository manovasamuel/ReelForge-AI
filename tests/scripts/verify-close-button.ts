import { chromium } from "@playwright/test";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}`;

async function verifyCloseButton() {
  console.log("Starting Next.js production server on port", PORT);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    shell: true,
    stdio: "pipe",
    env: { ...process.env, PORT: String(PORT) },
  });

  server.stdout?.on("data", (data) => {
    // console.log(`[server] ${data}`);
  });
  server.stderr?.on("data", (data) => {
    // console.error(`[server err] ${data}`);
  });

  // Wait for server to start
  console.log("Waiting for server to be responsive...");
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/pricing`);
      if (res.status === 200) {
        console.log("Server is ready!");
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  const outDir = path.resolve("scratch/close-button-qa");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. MOBILE DRAWER IN DARK THEME (390x844)
    console.log("\n--- Testing Mobile Navigation Drawer Header (Dark Theme) ---");
    const contextDark = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const pageDark = await contextDark.newPage();
    await pageDark.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
    await pageDark.waitForTimeout(1000);

    // Open mobile nav
    const menuBtn = pageDark.locator('button[aria-label="Open navigation menu"]');
    await menuBtn.click();
    await pageDark.waitForTimeout(600);

    // Inspect the close button
    const closeBtnDark = pageDark.locator('button[aria-label="Close navigation menu"]');
    await closeBtnDark.waitFor({ state: "visible", timeout: 8000 });
    const isVisibleDark = await closeBtnDark.isVisible();
    const boxDark = await closeBtnDark.boundingBox();

    // Capture screenshot of the drawer and header
    const shotDarkPath = path.join(outDir, "drawer-header-dark.png");
    await pageDark.screenshot({ path: shotDarkPath });

    // Check computed styles
    const stylesDark = await closeBtnDark.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const svg = el.querySelector("svg");
      const svgComputed = svg ? window.getComputedStyle(svg) : null;
      return {
        width: computed.width,
        height: computed.height,
        transform: computed.transform,
        display: computed.display,
        alignItems: computed.alignItems,
        justifyContent: computed.justifyContent,
        svgWidth: svgComputed?.width,
        svgHeight: svgComputed?.height,
      };
    });

    console.log("Dark Close Button Styles:", stylesDark);
    console.log("Dark Bounding Box:", boxDark);

    // Check hover stability
    await closeBtnDark.hover();
    await pageDark.waitForTimeout(200);
    const hoverStylesDark = await closeBtnDark.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return { transform: computed.transform };
    });
    console.log("Dark Hover Transform:", hoverStylesDark);

    // Test click-to-close
    await closeBtnDark.click();
    await pageDark.waitForTimeout(500);
    const isDrawerClosedDark = !(await closeBtnDark.isVisible());
    console.log("Dark Drawer Closed on Click:", isDrawerClosedDark);

    // 2. MOBILE DRAWER IN LIGHT THEME (390x844)
    console.log("\n--- Testing Mobile Navigation Drawer Header (Light Theme) ---");
    const contextLight = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const pageLight = await contextLight.newPage();
    await pageLight.addInitScript(() => {
      localStorage.setItem("theme", "light");
    });
    await pageLight.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
    await pageLight.waitForTimeout(1000);

    // Open mobile nav
    const menuBtnLight = pageLight.locator('button[aria-label="Open navigation menu"]');
    await menuBtnLight.click();
    await pageLight.waitForTimeout(600);

    const closeBtnLight = pageLight.locator('button[aria-label="Close navigation menu"]');
    await closeBtnLight.waitFor({ state: "visible", timeout: 8000 });
    const isVisibleLight = await closeBtnLight.isVisible();
    const boxLight = await closeBtnLight.boundingBox();

    const shotLightPath = path.join(outDir, "drawer-header-light.png");
    await pageLight.screenshot({ path: shotLightPath });

    // Check count of X buttons inside drawer to verify ZERO duplicates
    const totalXButtons = await pageLight.locator('svg.lucide-x').count();
    console.log("Total X icons rendered in drawer:", totalXButtons);

    await closeBtnLight.click();
    await pageLight.waitForTimeout(500);
    const isDrawerClosedLight = !(await closeBtnLight.isVisible());
    console.log("Light Drawer Closed on Click:", isDrawerClosedLight);

    const pass =
      isVisibleDark &&
      isVisibleLight &&
      isDrawerClosedDark &&
      isDrawerClosedLight &&
      totalXButtons === 1 &&
      boxDark &&
      boxDark.width >= 32 &&
      boxDark.height >= 32 &&
      stylesDark.width === "32px" &&
      stylesDark.height === "32px" &&
      (hoverStylesDark.transform === "none" || hoverStylesDark.transform === "matrix(1, 0, 0, 1, 0, 0)");

    console.log("\n=======================================================");
    console.log(pass ? "✅ CLOSE BUTTON VERIFICATION: ALL PASS" : "❌ VERIFICATION FAILED");
    console.log("=======================================================");

    return pass;
  } finally {
    await browser.close();
    server.kill();
  }
}

verifyCloseButton().then((ok) => {
  if (!ok) process.exit(1);
});
