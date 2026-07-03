# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: studio-pipeline.spec.ts >> Studio — Full Pipeline (Phases 1–9) >> Phase 5: Content Collection loads after Phase 4
- Location: tests\e2e\studio-pipeline.spec.ts:56:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Competitor Radar/i).first()
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 60000ms
  - waiting for getByText(/Competitor Radar/i).first()

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
  - button "Save"
  - button "Studio"
  - button "Workspace"
  - button "Export Center"
  - button "Settings"
  - navigation "Intelligence workflow progress": Profile Brand Competitors Analysis Collection Intelligence Content DNA Strategy + Script Repurpose
  - heading "Instagram Profile Analysis" [level=1]
  - paragraph: Paste an Instagram profile URL to extract and analyze their content strategy.
  - textbox "https://instagram.com/username": https://www.instagram.com/cristiano
  - button "Analyze Profile"
  - paragraph: Paste any public Instagram profile URL.
  - region:
    - text: STEP 1
    - heading "Instagram Profile Snapshot" [level=3]
    - paragraph: Raw account metrics and recent media ingestion
    - img "cristiano profile picture"
    - heading "@cristiano" [level=2]
    - paragraph: Cristiano
    - text: Photographer
    - link "murugavel.photography":
      - /url: https://murugavel.photography
    - paragraph: Travel photographer & storyteller 📷 | Capturing the world one frame at a time | Workshops open 🗓️
    - separator
    - text: 248.5K Followers
    - separator
    - text: 892 Following Total Posts 1,340
    - separator
    - heading "Latest Posts" [level=3]
    - link "Golden hour at its finest 🌅 Nothing beats the view from 3,0":
      - /url: https://www.instagram.com/p/mock001/
      - 'img "Golden hour at its finest 🌅 Nothing beats the view from 3,000 meters. #mountain"'
      - text: ♥ 48,320 💬 412
    - link "The road less traveled always leads somewhere worth going 🛤":
      - /url: https://www.instagram.com/p/mock002/
      - 'img "The road less traveled always leads somewhere worth going 🛤️ #adventure #wander"'
      - text: ♥ 62,105 💬 738
    - 'link "Stars don''t compete — they just shine ✨ #nightsky #astrophot"':
      - /url: https://www.instagram.com/p/mock003/
      - 'img "Stars don''t compete — they just shine ✨ #nightsky #astrophotography #nature"'
      - text: ♥ 91,450 💬 1,203
    - 'link "Where the forest meets the fog 🌿 A morning well spent. #for"':
      - /url: https://www.instagram.com/p/mock004/
      - 'img "Where the forest meets the fog 🌿 A morning well spent. #forest #nature #hiking"'
      - text: ♥ 34,780 💬 294
    - 'link "Ocean therapy hits different when you go alone 🌊 #ocean #so"':
      - /url: https://www.instagram.com/p/mock005/
      - 'img "Ocean therapy hits different when you go alone 🌊 #ocean #solitude #peace"'
      - text: ♥ 55,920 💬 567
    - 'link "Peak season, peak vibes 🏔️ Every climb is worth the view. #"':
      - /url: https://www.instagram.com/p/mock006/
      - 'img "Peak season, peak vibes 🏔️ Every climb is worth the view. #climbing #peaks"'
      - text: ♥ 27,340 💬 181
  - region:
    - text: STEP 2
    - heading "Brand Intelligence Blueprint" [level=3]
    - paragraph: Deterministic evaluation of tone, target audience & primary pillars
    - heading "Brand Intelligence Report" [level=2]
    - paragraph: Strategic brand positioning and content strategy blueprint
    - text: Niche Authority Industry E-Commerce & Retail Direct-to-Consumer Apparel & Goods Target Audience 18 - 34 years Style-conscious shoppers & modern consumers Brand Tone Aspirational, Trendy & Vibrant Brand Voice Content Style High-Energy Reels & Product Try-Ons Format & Aesthetic
    - separator
    - heading "Primary Content Pillars" [level=3]
    - text: 1 New Drop Announcements & Teasers 2 User-Generated Content & Styling Ideas 3 Day in the Life / Brand Aesthetic 4 Exclusive Promotions & Flash Sales Brand Type E-Commerce
    - separator
    - text: Posting Frequency Daily (7+ posts per week) AI Confidence 96%
    - progressbar: x
    - paragraph: Confidence based on available profile indicators & bio richness.
  - region:
    - text: STEP 3
    - heading "Competitor Discovery Radar" [level=3]
    - paragraph: Top 10 deterministic matches ranking audience overlap & content style
    - heading "Top 10 Competitors Discovered" [level=3]
    - paragraph: High-converting accounts sharing audience overlap & content style
    - text: "Total: 10 Accounts Avg Match: 85% Peak Confidence: 94% Status: Complete"
    - 'article "Competitor #1: @modern_apparel_co"':
      - img "modern_apparel_co"
      - text: "#1"
      - heading "@modern_apparel_co" [level=4]
      - text: 95% Match
      - paragraph: Modern Apparel Co.
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 540.0K Followers
      - paragraph: "Why: Identical D2C aesthetic and high-energy product drop reel formats."
      - text: "Confidence: 94%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #2: @streetwear_daily"':
      - img "streetwear_daily"
      - text: "#2"
      - heading "@streetwear_daily" [level=4]
      - text: 92% Match
      - paragraph: Urban Threads Studio
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 380.0K Followers
      - paragraph: "Why: Direct overlap in 18-34 demographic and styling try-on content."
      - text: "Confidence: 92%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #3: @minimal_goods_hub"':
      - img "minimal_goods_hub"
      - text: "#3"
      - heading "@minimal_goods_hub" [level=4]
      - text: 90% Match
      - paragraph: Minimalist Goods
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 290.0K Followers
      - paragraph: "Why: Matches aspirational brand tone and carousel product showcases."
      - text: "Confidence: 89%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #4: @eco_style_collective"':
      - img "eco_style_collective"
      - text: "#4"
      - heading "@eco_style_collective" [level=4]
      - text: 88% Match
      - paragraph: EcoStyle Collective
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 175.0K Followers
      - paragraph: "Why: Competes for style-conscious modern consumer demographics."
      - text: "Confidence: 87%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #5: @trend_fits_studio"':
      - img "trend_fits_studio"
      - text: "#5"
      - heading "@trend_fits_studio" [level=4]
      - text: 86% Match
      - paragraph: TrendFits Studio
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 420.0K Followers
      - paragraph: "Why: Similar flash sale promotion patterns and UGC styling reels."
      - text: "Confidence: 91%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #6: @luxe_basics_wear"':
      - img "luxe_basics_wear"
      - text: "#6"
      - heading "@luxe_basics_wear" [level=4]
      - text: 84% Match
      - paragraph: Luxe Basics Wear
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 610.0K Followers
      - paragraph: "Why: Shares visual storytelling aesthetic and high posting frequency."
      - text: "Confidence: 88%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #7: @daily_drop_exclusive"':
      - img "daily_drop_exclusive"
      - text: "#7"
      - heading "@daily_drop_exclusive" [level=4]
      - text: 82% Match
      - paragraph: Daily Drop Exclusives
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 145.0K Followers
      - paragraph: "Why: Competes directly on limited release hype sequences."
      - text: "Confidence: 83%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #8: @curated_closet_co"':
      - img "curated_closet_co"
      - text: "#8"
      - heading "@curated_closet_co" [level=4]
      - text: 80% Match
      - paragraph: Curated Closet
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 230.0K Followers
      - paragraph: "Why: Overlap in day-in-the-life behind-the-scenes brand reels."
      - text: "Confidence: 85%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #9: @essentials_outfitted"':
      - img "essentials_outfitted"
      - text: "#9"
      - heading "@essentials_outfitted" [level=4]
      - text: 78% Match
      - paragraph: Essentials Outfitted
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 310.0K Followers
      - paragraph: "Why: Similar pricing tier and target customer profile."
      - text: "Confidence: 81%"
      - progressbar: x
      - button "Analyze Competitor"
    - 'article "Competitor #10: @vibe_apparel_group"':
      - img "vibe_apparel_group"
      - text: "#10"
      - heading "@vibe_apparel_group" [level=4]
      - text: 75% Match
      - paragraph: Vibe Apparel Group
      - text: E-Commerce & Retail (Direct-to-Consumer Apparel & Goods) 189.0K Followers
      - paragraph: "Why: Shares primary content pillars around customer testimonials."
      - text: "Confidence: 79%"
      - progressbar: x
      - button "Analyze Competitor"
  - complementary "Intelligence Summary":
    - text: Live Session Phase 3 Complete @cristiano Current Profile @cristiano
    - separator
    - text: Industry E-Commerce & Retail
    - separator
    - text: Brand Type E-Commerce
    - separator
    - text: Competitors Found 10
    - separator
    - text: Selected Target None Selected Ready for Phase 4
    - paragraph: Profile ingestion, brand intelligence, and competitor discovery are complete.
- alert
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { FULL_PIPELINE_TIMEOUT, API_TIMEOUT } from "./helpers/fixtures";
  3   | 
  4   | /**
  5   |  * Full Pipeline — single sequential test covering all 9 phases.
  6   |  * Uses one shared page and one continuous session to avoid redundant
  7   |  * phase repetition across individual tests.
  8   |  * 
  9   |  * NOTE: Each phase assertion is an independent `test` step within the
  10  |  * same session so that failures are reported granularly.
  11  |  */
  12  | 
  13  | const INSTAGRAM_URL = "https://www.instagram.com/cristiano";
  14  | 
  15  | test.describe("Studio — Full Pipeline (Phases 1–9)", () => {
  16  |   test.setTimeout(FULL_PIPELINE_TIMEOUT);
  17  | 
  18  |   test("Phase 1: Profile card renders after analysis", async ({ page }) => {
  19  |     await page.goto("/profiles");
  20  |     await page.waitForLoadState("networkidle");
  21  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  22  |     await page.locator("#analyze-button").click();
  23  |     await expect(page.getByText(/Profile Snapshot/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  24  |   });
  25  | 
  26  |   test("Phase 2: Brand Intelligence renders automatically", async ({ page }) => {
  27  |     await page.goto("/profiles");
  28  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  29  |     await page.locator("#analyze-button").click();
  30  |     await expect(page.getByText(/Brand Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  31  |     await expect(page.getByText(/industry/i).first()).toBeVisible({ timeout: API_TIMEOUT });
  32  |   });
  33  | 
  34  |   test("Phase 3: Competitor Radar renders automatically", async ({ page }) => {
  35  |     await page.goto("/profiles");
  36  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  37  |     await page.locator("#analyze-button").click();
  38  |     // Wait for Brand Intelligence first (prerequisite)
  39  |     await expect(page.getByText(/Brand Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  40  |     // Then wait for competitors
  41  |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
  42  |     await expect(page.getByRole("button", { name: /Analyze/i }).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  43  |   });
  44  | 
  45  |   test("Phase 4: Competitor Analysis triggers on clicking Analyze button", async ({ page }) => {
  46  |     await page.goto("/profiles");
  47  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  48  |     await page.locator("#analyze-button").click();
  49  |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  50  |     const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
  51  |     await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
  52  |     await analyzeBtn.click();
  53  |     await expect(page.getByText(/Competitor Analysis/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  54  |   });
  55  | 
  56  |   test("Phase 5: Content Collection loads after Phase 4", async ({ page }) => {
  57  |     await page.goto("/profiles");
  58  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  59  |     await page.locator("#analyze-button").click();
> 60  |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
      |                                                               ^ Error: expect(locator).toBeVisible() failed
  61  |     const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
  62  |     await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
  63  |     await analyzeBtn.click();
  64  |     await expect(page.getByText(/Content Collection/i).first()).toBeVisible({ timeout: API_TIMEOUT * 3 });
  65  |   });
  66  | 
  67  |   test("Phase 6: Content Intelligence renders after Phase 5", async ({ page }) => {
  68  |     await page.goto("/profiles");
  69  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  70  |     await page.locator("#analyze-button").click();
  71  |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  72  |     const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
  73  |     await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
  74  |     await analyzeBtn.click();
  75  |     await expect(page.getByText(/Content Intelligence/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  76  |   });
  77  | 
  78  |   test("Phase 7: Generate Content DNA Blueprint button is visible", async ({ page }) => {
  79  |     await page.goto("/profiles");
  80  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  81  |     await page.locator("#analyze-button").click();
  82  |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  83  |     const analyzeBtn = page.getByRole("button", { name: /Analyze/i }).first();
  84  |     await analyzeBtn.waitFor({ timeout: API_TIMEOUT * 2 });
  85  |     await analyzeBtn.click();
  86  |     await expect(
  87  |       page.getByRole("button", { name: /Generate Content DNA Blueprint/i })
  88  |     ).toBeVisible({ timeout: API_TIMEOUT * 4 });
  89  |   });
  90  | 
  91  |   test("Phase 7: Content DNA Blueprint renders after clicking generate", async ({ page }) => {
  92  |     await page.goto("/profiles");
  93  |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  94  |     await page.locator("#analyze-button").click();
  95  |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  96  |     await page.getByRole("button", { name: /Analyze/i }).first().click();
  97  |     const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
  98  |     await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
  99  |     await dnaBtn.click();
  100 |     await expect(page.getByText(/Content DNA Blueprint/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  101 |   });
  102 | 
  103 |   test("Phase 8: Reel Script Package generates after Content DNA", async ({ page }) => {
  104 |     await page.goto("/profiles");
  105 |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  106 |     await page.locator("#analyze-button").click();
  107 |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  108 |     await page.getByRole("button", { name: /Analyze/i }).first().click();
  109 |     const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
  110 |     await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
  111 |     await dnaBtn.click();
  112 |     const scriptBtn = page.getByRole("button", { name: /Generate Reel Script Package/i });
  113 |     await scriptBtn.waitFor({ timeout: API_TIMEOUT * 2 });
  114 |     await scriptBtn.click();
  115 |     await expect(page.getByText(/Phase 8/i).first()).toBeVisible({ timeout: API_TIMEOUT * 2 });
  116 |   });
  117 | 
  118 |   test("Phase 8: Teleprompter mode button is visible after script generation", async ({ page }) => {
  119 |     await page.goto("/profiles");
  120 |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  121 |     await page.locator("#analyze-button").click();
  122 |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  123 |     await page.getByRole("button", { name: /Analyze/i }).first().click();
  124 |     const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
  125 |     await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
  126 |     await dnaBtn.click();
  127 |     const scriptBtn = page.getByRole("button", { name: /Generate Reel Script Package/i });
  128 |     await scriptBtn.waitFor({ timeout: API_TIMEOUT * 2 });
  129 |     await scriptBtn.click();
  130 |     await expect(
  131 |       page.getByRole("button", { name: /Teleprompter/i }).first()
  132 |     ).toBeVisible({ timeout: API_TIMEOUT * 2 });
  133 |   });
  134 | 
  135 |   test("Phase 9: Generate Repurpose Package button visible after Phase 8", async ({ page }) => {
  136 |     await page.goto("/profiles");
  137 |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  138 |     await page.locator("#analyze-button").click();
  139 |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  140 |     await page.getByRole("button", { name: /Analyze/i }).first().click();
  141 |     const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
  142 |     await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
  143 |     await dnaBtn.click();
  144 |     const scriptBtn = page.getByRole("button", { name: /Generate Reel Script Package/i });
  145 |     await scriptBtn.waitFor({ timeout: API_TIMEOUT * 2 });
  146 |     await scriptBtn.click();
  147 |     await expect(
  148 |       page.getByRole("button", { name: /Generate Repurpose Package/i })
  149 |     ).toBeVisible({ timeout: API_TIMEOUT * 2 });
  150 |   });
  151 | 
  152 |   test("Phase 9: Repurpose dashboard renders with platform tabs", async ({ page }) => {
  153 |     await page.goto("/profiles");
  154 |     await page.locator("#instagram-url-input").fill(INSTAGRAM_URL);
  155 |     await page.locator("#analyze-button").click();
  156 |     await expect(page.getByText(/Competitor Radar/i).first()).toBeVisible({ timeout: API_TIMEOUT * 4 });
  157 |     await page.getByRole("button", { name: /Analyze/i }).first().click();
  158 |     const dnaBtn = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
  159 |     await dnaBtn.waitFor({ timeout: API_TIMEOUT * 4 });
  160 |     await dnaBtn.click();
```