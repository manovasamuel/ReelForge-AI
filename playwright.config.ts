import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// Set a deterministic bypass token for E2E tests
process.env.E2E_TEST_BYPASS_TOKEN = "aios-e2e-bypass-123";

/**
 * ReelForge AI v1.3.1 — Playwright Configuration
 * Covers: Chromium, Firefox, WebKit
 * Viewports: Desktop (1440×900), Tablet (768×1024), Mobile (390×844)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: {
      "x-e2e-bypass": "aios-e2e-bypass-123",
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    // ── Desktop ──────────────────────────────────────────────────────
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "firefox-desktop",
      use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "webkit-desktop",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
    // ── Tablet ───────────────────────────────────────────────────────
    {
      name: "chromium-tablet",
      use: { ...devices["iPad Pro"], viewport: { width: 1024, height: 768 } },
    },
    // ── Mobile ───────────────────────────────────────────────────────
    {
      name: "chromium-mobile",
      use: { ...devices["iPhone 14 Pro"], viewport: { width: 390, height: 844 } },
    },
  ],
});
