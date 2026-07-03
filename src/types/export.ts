export type ExportFormat = "pdf" | "markdown" | "json" | "html" | "print";

export type ExportScope = "executive" | "complete" | "script" | "repurpose" | "raw";

export type CopySectionType = "summary" | "script" | "repurpose" | "complete";

export interface ExportHistoryItem {
  id: string;
  projectId: string;
  projectName: string;
  format: ExportFormat;
  scope: ExportScope;
  timestamp: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
}

export interface ExportPayload {
  filename: string;
  mimeType: string;
  content: string;
  blobUrl?: string;
}
