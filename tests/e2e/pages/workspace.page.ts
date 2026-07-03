import { Page, Locator } from "@playwright/test";

/**
 * Page Object Model — Workspace view
 */
export class WorkspacePage {
  readonly page: Page;

  readonly searchInput: Locator;
  readonly sortSelect: Locator;
  readonly emptyStateMessage: Locator;
  readonly newAnalysisButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/Search by project name/i);
    this.sortSelect = page.locator("select");
    this.emptyStateMessage = page.getByText(/No projects yet/i);
    this.newAnalysisButton = page.getByRole("button", { name: /New Analysis/i });
  }

  /** Returns a ProjectCard locator by project name */
  getProjectCard(name: string): Locator {
    return this.page.locator(`[data-testid="project-card"]`, { hasText: name }).first();
  }

  /** Finds any project card's "Open" button */
  getOpenButton(name: string): Locator {
    return this.page
      .locator("article, [class*='card']", { hasText: name })
      .getByRole("button", { name: /Open/i })
      .first();
  }

  /** Finds any project card's "Rename" button */
  getRenameButton(name: string): Locator {
    return this.page
      .locator("article, [class*='card']", { hasText: name })
      .getByRole("button", { name: /Rename/i })
      .first();
  }

  /** Finds any project card's "Duplicate" button */
  getDuplicateButton(name: string): Locator {
    return this.page
      .locator("article, [class*='card']", { hasText: name })
      .getByRole("button", { name: /Duplicate/i })
      .first();
  }

  /** Finds any project card's "Delete" button */
  getDeleteButton(name: string): Locator {
    return this.page
      .locator("article, [class*='card']", { hasText: name })
      .getByRole("button", { name: /Delete/i })
      .first();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async sortBy(option: string) {
    await this.sortSelect.selectOption(option);
  }
}
