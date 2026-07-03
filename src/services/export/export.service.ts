import { getExportProvider } from "./providers";
import type { SavedProject } from "@/types/project";
import type {
  ExportFormat,
  ExportScope,
  CopySectionType,
  ExportHistoryItem,
  ExportPayload,
} from "@/types/export";

export class ExportService {
  private static get provider() {
    return getExportProvider();
  }

  /**
   * Generates formatted export payload and triggers browser download.
   */
  static async exportProject(
    project: SavedProject,
    format: ExportFormat,
    scope: ExportScope
  ): Promise<ExportPayload> {
    if (format === "print") {
      this.provider.triggerPrint(project);
      return {
        filename: `${project.name}_print`,
        mimeType: "text/html",
        content: "Print triggered",
      };
    }

    const payload = await this.provider.generateExport(project, format, scope);

    if (typeof window !== "undefined") {
      const blob = new Blob([payload.content], { type: payload.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = payload.filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return payload;
  }

  /**
   * Copies formatted text to system clipboard.
   */
  static async copyToClipboard(
    project: SavedProject,
    section: CopySectionType
  ): Promise<boolean> {
    return this.provider.copySection(project, section);
  }

  /**
   * Triggers physical or PDF printing via browser window.print().
   */
  static printReport(project: SavedProject): void {
    this.provider.triggerPrint(project);
  }

  /**
   * Retrieves audit log of exported reports.
   */
  static getHistory(): ExportHistoryItem[] {
    return this.provider.getExportHistory();
  }

  /**
   * Clears export audit history.
   */
  static clearHistory(): void {
    this.provider.clearExportHistory();
  }

  /**
   * Deletes a single history entry.
   */
  static deleteHistoryItem(id: string): void {
    this.provider.deleteHistoryItem(id);
  }
}
