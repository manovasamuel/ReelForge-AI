import { Page, Locator } from "@playwright/test";

/**
 * Page Object Model — Export Center view
 */
export class ExportPage {
  readonly page: Page;

  readonly noProjectMessage: Locator;
  readonly exportCenterHeader: Locator;
  readonly pdfButton: Locator;
  readonly markdownButton: Locator;
  readonly htmlButton: Locator;
  readonly jsonButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.noProjectMessage = page.getByText(/No Active Analysis Selected/i);
    this.exportCenterHeader = page.getByText(/Omnichannel Intelligence Export/i);
    this.pdfButton = page.getByRole("button", { name: /PDF/i }).first();
    this.markdownButton = page.getByRole("button", { name: /Markdown/i }).first();
    this.htmlButton = page.getByRole("button", { name: /HTML/i }).first();
    this.jsonButton = page.getByRole("button", { name: /JSON/i }).first();
  }
}

/**
 * Page Object Model — Settings view
 */
export class SettingsPage {
  readonly page: Page;

  readonly appearanceTab: Locator;
  readonly providersTab: Locator;
  readonly workspaceTab: Locator;
  readonly exportTab: Locator;
  readonly storageTab: Locator;
  readonly aboutTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appearanceTab = page.getByRole("button", { name: /Appearance/i }).first();
    this.providersTab = page.getByRole("button", { name: /Provider/i }).first();
    this.workspaceTab = page.getByRole("button", { name: /Workspace/i }).first();
    this.exportTab = page.getByRole("button", { name: /Export/i }).first();
    this.storageTab = page.getByRole("button", { name: /Storage/i }).first();
    this.aboutTab = page.getByRole("button", { name: /About/i }).first();
  }

  async clickTab(name: string) {
    await this.page.getByRole("button", { name }).first().click();
  }
}
