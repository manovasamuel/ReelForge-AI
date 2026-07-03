"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2, Download, CheckCircle2, Sliders } from "lucide-react";
import type { SavedProject } from "@/types/project";
import type { ExportFormat, ExportScope } from "@/types/export";
import { ExportService } from "@/services/export";
import { showToast } from "@/components/ui/toast";

interface AdvancedExportPanelProps {
  project: SavedProject;
  onExportTriggered?: () => void;
}

export function AdvancedExportPanel({ project, onExportTriggered }: AdvancedExportPanelProps) {
  const [selectedScope, setSelectedScope] = useState<ExportScope>("complete");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("markdown");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleCustomGenerate() {
    setIsGenerating(true);
    try {
      await ExportService.exportProject(project, selectedFormat, selectedScope);
      showToast("Custom Export Generated", `Generated ${selectedScope.toUpperCase()} report as ${selectedFormat.toUpperCase()}.`);
      onExportTriggered?.();
    } catch {
      showToast("Generation Error", "Failed to compile custom export.");
    } finally {
      setIsGenerating(false);
    }
  }

  const scopes: { id: ExportScope; label: string; description: string }[] = [
    { id: "executive", label: "Executive Summary", description: "Profile metrics, Brand position, Competitors list, and DNA Score." },
    { id: "complete", label: "Complete Intelligence Report", description: "Comprehensive audit including every intelligence phase and studio output." },
    { id: "script", label: "Script Package", description: "Only the studio hook, scene breakdown, captions, and hashtags." },
    { id: "repurpose", label: "Repurpose Package", description: "Only multi-platform adaptions for LinkedIn, X, Threads, and Shorts." },
    { id: "raw", label: "Raw Project (JSON)", description: "Raw serializable data model snapshot for backups and external tools." },
  ];

  const formats: { id: ExportFormat; label: string; ext: string }[] = [
    { id: "print", label: "PDF / Print Layout", ext: ".pdf" },
    { id: "markdown", label: "Markdown Document", ext: ".md" },
    { id: "html", label: "Standalone HTML Page", ext: ".html" },
    { id: "json", label: "JSON Data File", ext: ".json" },
  ];

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-card/90 backdrop-blur-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Advanced Export Builder</h3>
            <p className="text-xs text-muted-foreground">Select exact intelligence scope and target file format</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 text-[11px]">
          Granular Scope
        </Badge>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            1. Select Intelligence Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scopes.map((item) => {
              const isSelected = selectedScope === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedScope(item.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-violet-500 bg-violet-950/40 shadow-md shadow-violet-950/50"
                      : "border-border/70 bg-background/50 hover:bg-card/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-foreground"}`}>
                      {item.label}
                    </span>
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            2. Select Output Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {formats.map((fmt) => {
              const isSelected = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-fuchsia-500 bg-fuchsia-950/40 shadow-md text-white font-bold"
                      : "border-border/70 bg-background/50 hover:bg-card/80 text-muted-foreground"
                  }`}
                >
                  <div className="text-xs">{fmt.label}</div>
                  <span className="text-[10px] text-violet-400 font-mono mt-0.5 block">{fmt.ext}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={handleCustomGenerate}
            disabled={isGenerating}
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs gap-2 px-6 py-5 rounded-xl shadow-lg shadow-violet-950/60"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Compiling Report..." : "Generate Custom Export"}
          </Button>
        </div>
      </div>
    </div>
  );
}
