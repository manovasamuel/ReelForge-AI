"use client";

import { useState } from "react";
import { QuickExportCard } from "./quick-export-card";
import { AdvancedExportPanel } from "./advanced-export-panel";
import { ExportHistoryTable } from "./export-history-table";
import { PrintReportView } from "./print-report-view";
import type { SavedProject } from "@/types/project";
import { Download, Box, FolderGit2 } from "lucide-react";

interface ExportCenterProps {
  project: SavedProject | null;
}

export function ExportCenter({ project }: ExportCenterProps) {
  const [historyTrigger, setHistoryTrigger] = useState(0);

  function handleExportTriggered() {
    setHistoryTrigger((prev) => prev + 1);
  }

  if (!project) {
    return (
      <div className="rounded-md border border-border bg-card p-12 text-center shadow-none max-w-2xl mx-auto my-12 space-y-4">
        <div className="h-12 w-12 rounded-md bg-muted border border-border flex items-center justify-center text-foreground mx-auto">
          <Download className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Active Analysis Selected</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Please run a studio analysis or open a saved project from your Workspace Repository before accessing the Export Center.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Printable Report View (Visible ONLY during window.print()) */}
      <PrintReportView project={project} />

      {/* Screen View */}
      <div className="print:hidden space-y-8">
        <div className="p-6 rounded-md border border-border bg-muted via-card/90 shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-white shadow-none">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted border border-border text-[11px] font-bold text-foreground mb-1">
                <Box className="h-3 w-3 text-foreground" /> ReelForge AI v2.0 Export Center
              </div>
              <h2 className="text-xl font-bold text-white">
                Omnichannel Intelligence Export: &ldquo;{project.name}&rdquo;
              </h2>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-muted-foreground">Version {project.version}</div>
            <div className="text-xs font-semibold text-foreground">{project.instagramUrl}</div>
          </div>
        </div>

        {/* Section 1: Quick Export Hub */}
        <section aria-label="Quick Export Hub">
          <QuickExportCard project={project} onExportTriggered={handleExportTriggered} />
        </section>

        {/* Section 2: Advanced Custom Export Builder */}
        <section aria-label="Advanced Export Builder">
          <AdvancedExportPanel project={project} onExportTriggered={handleExportTriggered} />
        </section>

        {/* Section 3: Export Audit History */}
        <section aria-label="Export Audit History">
          <ExportHistoryTable refreshToken={historyTrigger} />
        </section>
      </div>
    </div>
  );
}
