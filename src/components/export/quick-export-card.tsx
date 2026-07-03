"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  Sparkles,
  Download,
} from "lucide-react";
import type { SavedProject } from "@/types/project";
import { ExportService } from "@/services/export";
import { showToast } from "@/components/ui/toast";
import type { CopySectionType } from "@/types/export";

interface QuickExportCardProps {
  project: SavedProject;
  onExportTriggered?: () => void;
}

export function QuickExportCard({ project, onExportTriggered }: QuickExportCardProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  async function handleDownload(format: "html" | "markdown" | "json" | "print", label: string) {
    setIsExporting(label);
    try {
      await ExportService.exportProject(project, format, "complete");
      showToast("Export Generated", `Successfully generated ${label} for "${project.name}".`);
      onExportTriggered?.();
    } catch {
      showToast("Export Failed", "Could not generate file payload.");
    } finally {
      setIsExporting(null);
    }
  }

  async function handleCopy(section: CopySectionType, label: string) {
    setCopiedSection(section);
    const success = await ExportService.copyToClipboard(project, section);
    if (success) {
      showToast("Copied to Clipboard", `Successfully copied ${label} to system clipboard.`);
    } else {
      showToast("Copy Failed", "Clipboard permission denied or unavailable.");
    }
    setTimeout(() => setCopiedSection(null), 2000);
  }

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-card/90 backdrop-blur-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-fuchsia-400" /> Quick Export Hub
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            One-click instant downloads and clipboard copies for &ldquo;{project.name}&rdquo;
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-300 mb-2.5">
            Document Downloads
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => handleDownload("print", "PDF Report")}
              disabled={isExporting !== null}
              className="h-auto py-3.5 flex flex-col items-center justify-center gap-2 rounded-xl border-violet-500/40 bg-violet-950/20 hover:bg-violet-900/30 text-white transition-all hover:scale-[1.02]"
            >
              <FileText className="h-5 w-5 text-violet-400" />
              <div className="text-center">
                <div className="text-xs font-bold">PDF Report</div>
                <div className="text-[10px] text-muted-foreground">Print to PDF</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDownload("markdown", "Markdown Report")}
              disabled={isExporting !== null}
              className="h-auto py-3.5 flex flex-col items-center justify-center gap-2 rounded-xl border-violet-500/30 bg-card/60 hover:bg-violet-500/10 text-white transition-all hover:scale-[1.02]"
            >
              <FileCode className="h-5 w-5 text-fuchsia-400" />
              <div className="text-center">
                <div className="text-xs font-bold">Markdown (.md)</div>
                <div className="text-[10px] text-muted-foreground">Notion / GitHub</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDownload("html", "Standalone HTML")}
              disabled={isExporting !== null}
              className="h-auto py-3.5 flex flex-col items-center justify-center gap-2 rounded-xl border-violet-500/30 bg-card/60 hover:bg-violet-500/10 text-white transition-all hover:scale-[1.02]"
            >
              <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
              <div className="text-center">
                <div className="text-xs font-bold">HTML Report</div>
                <div className="text-[10px] text-muted-foreground">Standalone Doc</div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDownload("json", "JSON Backup")}
              disabled={isExporting !== null}
              className="h-auto py-3.5 flex flex-col items-center justify-center gap-2 rounded-xl border-violet-500/30 bg-card/60 hover:bg-violet-500/10 text-white transition-all hover:scale-[1.02]"
            >
              <Download className="h-5 w-5 text-emerald-400" />
              <div className="text-center">
                <div className="text-xs font-bold">JSON Project</div>
                <div className="text-[10px] text-muted-foreground">Complete Backup</div>
              </div>
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fuchsia-300 mb-2.5">
            Instant Clipboard Copy
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy("summary", "Executive Summary")}
              className="text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 border border-violet-500/30 gap-1.5 h-9"
            >
              {copiedSection === "summary" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Summary
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy("script", "Script Package")}
              className="text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 border border-violet-500/30 gap-1.5 h-9"
            >
              {copiedSection === "script" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Script
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy("repurpose", "Repurpose Package")}
              className="text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 border border-violet-500/30 gap-1.5 h-9"
            >
              {copiedSection === "repurpose" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Repurpose
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy("complete", "Complete Report")}
              className="text-xs bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 hover:from-violet-600/40 hover:to-fuchsia-600/40 text-white border border-violet-500/50 gap-1.5 h-9 font-bold"
            >
              {copiedSection === "complete" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              Copy All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
