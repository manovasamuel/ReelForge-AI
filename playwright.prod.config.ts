import { defineConfig, devices } from "@playwright/test";

/**
 * ReelForge AI — Playwright Production Configuration
 * Direct cross-browser test runner against live Vercel Production URL without starting a local web server.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "live-auth-production.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "https://reel-forge-ai-psi.vercel.app",
    trace: "off",
    screenshot: "only-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
  ],
});
