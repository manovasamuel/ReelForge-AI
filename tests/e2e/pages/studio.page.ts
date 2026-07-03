import { Page, Locator } from "@playwright/test";

/**
 * Page Object Model — ReelForge AI Studio Page
 * Covers all interactive elements on /profiles
 */
export class StudioPage {
  readonly page: Page;

  // ── Navigation bar ────────────────────────────────────────────────
  readonly navStudio: Locator;
  readonly navWorkspace: Locator;
  readonly navExport: Locator;
  readonly navSettings: Locator;
  readonly saveButton: Locator;

  // ── Profile input ─────────────────────────────────────────────────
  readonly urlInput: Locator;
  readonly analyzeButton: Locator;
  readonly urlError: Locator;
  readonly helperText: Locator;

  // ── Workflow sections ─────────────────────────────────────────────
  readonly profileCard: Locator;
  readonly brandCard: Locator;
  readonly competitorList: Locator;
  readonly contentDNASection: Locator;
  readonly scriptSection: Locator;
  readonly repurposeSection: Locator;

  // ── Generate buttons ──────────────────────────────────────────────
  readonly generateDNAButton: Locator;
  readonly generateScriptButton: Locator;
  readonly generateRepurposeButton: Locator;

  // ── Save modal ────────────────────────────────────────────────────
  readonly saveModal: Locator;
  readonly saveModalNameInput: Locator;
  readonly saveModalConfirm: Locator;
  readonly saveModalCancel: Locator;

  // ── Teleprompter ──────────────────────────────────────────────────
  readonly teleprompterButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.navStudio = page.getByRole("button", { name: "Studio" });
    this.navWorkspace = page.getByRole("button", { name: "Workspace" });
    this.navExport = page.getByRole("button", { name: /Export Center/ });
    this.navSettings = page.getByRole("button", { name: /Settings/ });
    this.saveButton = page.getByRole("button", { name: /Save/ }).first();

    // Profile input
    this.urlInput = page.locator("#instagram-url-input");
    this.analyzeButton = page.locator("#analyze-button");
    this.urlError = page.locator("#url-error");
    this.helperText = page.getByText("Paste any public Instagram profile URL.");

    // Key sections (via aria labels / headings)
    this.profileCard = page.getByText("Profile Snapshot", { exact: false }).first();
    this.brandCard = page.getByText("Brand Intelligence", { exact: false }).first();
    this.competitorList = page.getByText("Competitor Radar", { exact: false }).first();
    this.contentDNASection = page.getByText("Content DNA Blueprint", { exact: false }).first();
    this.scriptSection = page.getByText("Script Generation", { exact: false }).first();
    this.repurposeSection = page.getByText("Repurpose Engine", { exact: false }).first();

    // Generate buttons
    this.generateDNAButton = page.getByRole("button", { name: /Generate Content DNA Blueprint/i });
    this.generateScriptButton = page.getByRole("button", { name: /Generate Reel Script Package/i });
    this.generateRepurposeButton = page.getByRole("button", { name: /Generate Repurpose Package/i });

    // Save modal
    this.saveModal = page.getByRole("heading", { name: "Save Project to Workspace" });
    this.saveModalNameInput = page.getByPlaceholder(/e.g., @nike Creator Teardown/i);
    this.saveModalConfirm = page.getByRole("button", { name: "Save Project" });
    this.saveModalCancel = page.getByRole("button", { name: "Cancel" }).first();

    // Teleprompter
    this.teleprompterButton = page.getByRole("button", { name: /Teleprompter/i });
  }

  async goto() {
    await this.page.goto("/profiles");
    await this.page.waitForLoadState("networkidle");
  }

  async analyzeProfile(url: string) {
    await this.urlInput.fill(url);
    await this.analyzeButton.click();
  }

  /** Waits for the profile card to appear (Phase 1 done) */
  async waitForProfileSuccess() {
    await this.page.waitForSelector('[data-testid="profile-card"], [data-slot="card"]', {
      timeout: 20000,
    });
  }

  /** Waits for brand intelligence section to render */
  async waitForBrandIntelligence() {
    await this.page.getByText(/Brand Intelligence/i).waitFor({ timeout: 20000 });
  }

  /** Waits for competitor list to appear */
  async waitForCompetitors() {
    await this.page.getByText(/Competitor Radar/i).waitFor({ timeout: 20000 });
  }

  /** Clicks the first competitor card to trigger Phase 4 */
  async clickFirstCompetitor() {
    const competitor = this.page
      .getByRole("button", { name: /Analyze/i })
      .first();
    await competitor.waitFor({ timeout: 20000 });
    await competitor.click();
  }

  /** Waits for content collection section */
  async waitForContentCollection() {
    await this.page.getByText(/Content Collection/i).first().waitFor({ timeout: 30000 });
  }

  /** Clicks "Generate Content DNA Blueprint" and waits */
  async generateContentDNA() {
    await this.generateDNAButton.waitFor({ timeout: 30000 });
    await this.generateDNAButton.click();
    await this.page.getByText(/Content DNA Blueprint/i).waitFor({ timeout: 30000 });
  }

  /** Clicks "Generate Reel Script Package" and waits */
  async generateScript() {
    await this.generateScriptButton.waitFor({ timeout: 30000 });
    await this.generateScriptButton.click();
    await this.page.getByText(/Phase 8/i).waitFor({ timeout: 30000 });
  }

  /** Opens save modal and saves with name */
  async saveProject(name: string) {
    await this.saveButton.click();
    await this.saveModal.waitFor({ timeout: 5000 });
    await this.saveModalNameInput.clear();
    await this.saveModalNameInput.fill(name);
    await this.saveModalConfirm.click();
  }

  /** Switches to Workspace view */
  async goToWorkspace() {
    await this.navWorkspace.click();
    await this.page.getByText("Search by project name").waitFor({ timeout: 5000 });
  }

  /** Switches to Export Center view */
  async goToExport() {
    await this.navExport.click();
  }

  /** Switches to Settings view */
  async goToSettings() {
    await this.navSettings.click();
    await this.page.getByText(/Settings.*Provider/i).waitFor({ timeout: 5000 });
  }
}
