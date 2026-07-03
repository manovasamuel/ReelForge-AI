# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-validation.spec.ts >> Profile URL Validation >> should show error for a plain string (non-URL)
- Location: tests\e2e\studio-validation.spec.ts:21:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#url-error')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('#url-error')

```

```yaml
- complementary:
  - link "ReelForge AI":
    - /url: /
  - button
  - separator
  - navigation:
    - link "Dashboard":
      - /url: /
    - link "Profiles":
      - /url: /profiles
  - text: AI Powered Intelligence Engine
- banner: v1.0
- main:
  - heading "ReelForge AI v1.3 Platform" [level=2]
  - paragraph: Studio Analysis, Workspace Repository, Export Hub & Provider Studio
  - button "Studio"
  - button "Workspace"
  - button "Export Center"
  - button "Settings"
  - navigation "Intelligence workflow progress": Profile Brand Competitors Analysis Collection Intelligence Content DNA Strategy + Script Repurpose
  - heading "Instagram Profile Analysis" [level=1]
  - paragraph: Paste an Instagram profile URL to extract and analyze their content strategy.
  - textbox "https://instagram.com/username": not-a-url
  - button "Analyze Profile"
  - paragraph: Paste any public Instagram profile URL.
  - heading "Start Your Intelligence Workflow" [level=3]
  - paragraph: Paste any public Instagram profile URL above to trigger the automated 3-stage intelligence engine.
  - heading "1. Profile Snapshot" [level=4]
  - paragraph: Ingests follower metrics & recent content.
  - heading "2. Brand Strategy" [level=4]
  - paragraph: Derives industry, tone & primary pillars.
  - heading "3. Competitor Radar" [level=4]
  - paragraph: Identifies top 10 matching accounts.
- alert
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import {
  3   |   VALID_INSTAGRAM_URLS,
  4   |   VALID_URL_WITH_QUERY,
  5   |   VALID_URL_WITH_IGSH,
  6   |   INVALID_URLS,
  7   |   API_TIMEOUT,
  8   | } from "./helpers/fixtures";
  9   | 
  10  | test.describe("Profile URL Validation", () => {
  11  |   test.beforeEach(async ({ page }) => {
  12  |     await page.goto("/profiles");
  13  |     await page.waitForLoadState("networkidle");
  14  |   });
  15  | 
  16  |   test("analyze button should be disabled when input is empty", async ({ page }) => {
  17  |     const btn = page.locator("#analyze-button");
  18  |     await expect(btn).toBeDisabled();
  19  |   });
  20  | 
  21  |   test("should show error for a plain string (non-URL)", async ({ page }) => {
  22  |     await page.locator("#instagram-url-input").fill("not-a-url");
  23  |     await page.locator("#analyze-button").click();
> 24  |     await expect(page.locator("#url-error")).toBeVisible();
      |                                              ^ Error: expect(locator).toBeVisible() failed
  25  |   });
  26  | 
  27  |   test("should show error for a non-Instagram URL", async ({ page }) => {
  28  |     await page.locator("#instagram-url-input").fill("https://twitter.com/someuser");
  29  |     await page.locator("#analyze-button").click();
  30  |     await expect(page.locator("#url-error")).toBeVisible();
  31  |     await expect(page.locator("#url-error")).toContainText(/Instagram/i);
  32  |   });
  33  | 
  34  |   test("should show error for instagram.com with no username", async ({ page }) => {
  35  |     await page.locator("#instagram-url-input").fill("https://instagram.com/");
  36  |     await page.locator("#analyze-button").click();
  37  |     await expect(page.locator("#url-error")).toBeVisible();
  38  |   });
  39  | 
  40  |   test("should clear error when user types after an invalid submission", async ({ page }) => {
  41  |     await page.locator("#instagram-url-input").fill("bad-url");
  42  |     await page.locator("#analyze-button").click();
  43  |     await expect(page.locator("#url-error")).toBeVisible();
  44  |     await page.locator("#instagram-url-input").fill("https://instagram.com/nasa");
  45  |     await expect(page.locator("#url-error")).not.toBeVisible();
  46  |   });
  47  | 
  48  |   test("should accept a standard Instagram URL", async ({ page }) => {
  49  |     const url = VALID_INSTAGRAM_URLS[0];
  50  |     await page.locator("#instagram-url-input").fill(url);
  51  |     await expect(page.locator("#analyze-button")).toBeEnabled();
  52  |   });
  53  | 
  54  |   test("BUG-RF-002: should accept Instagram URL with ?hl= query param", async ({ page }) => {
  55  |     await page.locator("#instagram-url-input").fill(VALID_URL_WITH_QUERY);
  56  |     await expect(page.locator("#analyze-button")).toBeEnabled();
  57  |     // Submit and expect no validation error
  58  |     await page.locator("#analyze-button").click();
  59  |     await expect(page.locator("#url-error")).not.toBeVisible();
  60  |   });
  61  | 
  62  |   test("BUG-RF-002: should accept Instagram URL with ?igsh= tracking param", async ({ page }) => {
  63  |     await page.locator("#instagram-url-input").fill(VALID_URL_WITH_IGSH);
  64  |     await expect(page.locator("#analyze-button")).toBeEnabled();
  65  |     await page.locator("#analyze-button").click();
  66  |     await expect(page.locator("#url-error")).not.toBeVisible();
  67  |   });
  68  | 
  69  |   for (const bad of INVALID_URLS) {
  70  |     test(`should reject invalid URL: "${bad}"`, async ({ page }) => {
  71  |       await page.locator("#instagram-url-input").fill(bad);
  72  |       await page.locator("#analyze-button").click();
  73  |       if (bad === "") {
  74  |         // Empty keeps button disabled, no error shown
  75  |         await expect(page.locator("#analyze-button")).toBeDisabled();
  76  |       } else {
  77  |         await expect(page.locator("#url-error")).toBeVisible();
  78  |       }
  79  |     });
  80  |   }
  81  | });
  82  | 
  83  | test.describe("Profile Analysis — Phase 1", () => {
  84  |   test.beforeEach(async ({ page }) => {
  85  |     await page.goto("/profiles");
  86  |     await page.waitForLoadState("networkidle");
  87  |   });
  88  | 
  89  |   test("should trigger profile analysis and show loading state", async ({ page }) => {
  90  |     await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
  91  |     await page.locator("#analyze-button").click();
  92  |     // Button should be disabled while loading
  93  |     await expect(page.locator("#analyze-button")).toBeDisabled();
  94  |   });
  95  | 
  96  |   test("should render profile card after successful Phase 1", async ({ page }) => {
  97  |     await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
  98  |     await page.locator("#analyze-button").click();
  99  |     // Profile section should appear
  100 |     await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  101 |   });
  102 | 
  103 |   test("should auto-trigger Brand Intelligence after Phase 1", async ({ page }) => {
  104 |     await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
  105 |     await page.locator("#analyze-button").click();
  106 |     await expect(page.getByText(/Brand Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  107 |   });
  108 | 
  109 |   test("should display Competitor Radar after Phases 1-3 complete", async ({ page }) => {
  110 |     await page.locator("#instagram-url-input").fill(VALID_INSTAGRAM_URLS[0]);
  111 |     await page.locator("#analyze-button").click();
  112 |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
  113 |   });
  114 | });
  115 | 
```