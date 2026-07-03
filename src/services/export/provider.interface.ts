import type { SavedProject } from "@/types/project";
import type {
  ExportFormat,
  ExportScope,
  CopySectionType,
  ExportHistoryItem,
  ExportPayload,
} from "@/types/export";

export interface IExportProvider {
  /**
   * Generates formatted file payload for download from a SavedProject model.
   */
  generateExport(
    project: SavedProject,
    format: ExportFormat,
    scope: ExportScope
  ): Promise<ExportPayload>;

  /**
   * Copies formatted text representation of specific report section to clipboard.
   */
  copySection(project: SavedProject, section: CopySectionType): Promise<boolean>;

  /**
   * Triggers browser print workflow for PDF generation or physical printing.
   */
  triggerPrint(project: SavedProject): void;

  /**
   * Retrieves audit log of local exports.
   */
  getExportHistory(): ExportHistoryItem[];

  /**
   * Records a new export event to local storage.
   */
  recordExportHistory(item: Omit<ExportHistoryItem, "id">): ExportHistoryItem;

  /**
   * Clears export history audit log.
   */
  clearExportHistory(): void;

  /**
   * Deletes a single item from export history.
   */
  deleteHistoryItem(id: string): void;
}
