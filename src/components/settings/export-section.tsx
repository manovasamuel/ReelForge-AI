"use client";

import React from "react";
import { ExportPreferences } from "@/types/settings";
import { FileText, Layers, FileCode, Printer } from "lucide-react";

interface ExportSectionProps {
  preferences: ExportPreferences;
  onChange: (updated: Partial<ExportPreferences>) => void;
}

export function ExportSection({ preferences, onChange }: ExportSectionProps) {
  const formats: { id: "print" | "markdown" | "html" | "json"; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "print", label: "PDF Document", icon: <Printer className="h-5 w-5" />, desc: "Print-ready stylesheet layout for executive stakeholder review." },
    { id: "markdown", label: "Markdown (.md)", icon: <FileText className="h-5 w-5" />, desc: "Structured syntax optimized for Notion, Obsidian, and GitHub." },
    { id: "html", label: "Standalone HTML Page", icon: <FileCode className="h-5 w-5" />, desc: "Self-contained interactive document with embedded dark mode." },
    { id: "json", label: "JSON State Backup", icon: <Layers className="h-5 w-5" />, desc: "Raw serializable domain object for automated pipelines." },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <FileText className="h-5 w-5 text-foreground" /> Default Report Export Format
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Controls pre-selected output format when triggering 1-click Quick Exports.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formats.map((f) => {
            const active = preferences.defaultFormat === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onChange({ defaultFormat: f.id })}
                className={`p-4 rounded-md border text-left transition-all duration-200 ${
                  active
                    ? "bg-muted border-border text-white shadow-md"
                    : "bg-card border-border text-muted-foreground hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-semibold">
                    {f.icon}
                    {f.label}
                  </div>
                  {active && <span className="h-2 w-2 rounded-full bg-muted" />}
                </div>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-md">
          <div>
            <div className="font-bold text-sm text-white">Include Executive Cover Page</div>
            <p className="text-xs text-muted-foreground mt-0.5">Prepend formal cover header with target profile URL and date on PDF & Markdown exports.</p>
          </div>
          <button
            onClick={() => onChange({ includeCoverPage: !preferences.includeCoverPage })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              preferences.includeCoverPage ? "bg-muted justify-end" : "bg-muted justify-start"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-card text-foreground shadow-md transform transition-transform" />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-card border border-border rounded-md">
          <div>
            <div className="font-bold text-sm text-white">Include Telemetry & Engine Metadata</div>
            <p className="text-xs text-muted-foreground mt-0.5">Append heuristic model versioning and confidence intervals inside compiled reports.</p>
          </div>
          <button
            onClick={() => onChange({ includeMetadata: !preferences.includeMetadata })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              preferences.includeMetadata ? "bg-muted justify-end" : "bg-muted justify-start"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-card text-foreground shadow-md transform transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
