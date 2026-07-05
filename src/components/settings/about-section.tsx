"use client";

import React, { useRef, useState } from "react";
import { DeveloperInfo, AppSettings } from "@/types/settings";
import { Info, Cpu, CheckCircle2, ShieldAlert, Download, Upload, Code } from "lucide-react";

interface AboutSectionProps {
  developer: DeveloperInfo;
  onExportBackup: () => boolean;
  onImportBackup: (jsonString: string) => AppSettings;
  onRestoreDefaults: () => void;
}

export function AboutSection({
  developer,
  onExportBackup,
  onImportBackup,
  onRestoreDefaults,
}: AboutSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onImportBackup(content);
        showToast("Settings successfully restored from JSON backup.");
      } catch {
        alert("Failed to restore settings: Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {toast && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      {/* About App Card */}
      <div className="p-6 bg-gradient-to-br from-purple-900/30 to-gray-900/60 border border-purple-500/30 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-purple-600/30">
              RF
            </div>
            <div>
              <h2 className="text-xl font-black text-white">ReelForge AI</h2>
              <p className="text-xs text-purple-300">Deterministic Social Intelligence & Studio Pipeline</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full">
            v2.0.0
          </span>
        </div>
      </div>

      {/* Developer Diagnostics Section (Additional Requirement 1) */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Cpu className="h-5 w-5 text-purple-400" /> Developer Diagnostics & Environment
        </h3>
        <p className="text-sm text-gray-400 mb-4">Read-only runtime telemetry illustrating swappable provider layers and memory models.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Build Type</div>
            <div className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {developer.buildType}
            </div>
          </div>

          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Storage Engine</div>
            <div className="text-sm font-bold text-white mt-1">{developer.storageEngine}</div>
          </div>

          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Workspace Version</div>
            <div className="text-lg font-bold text-white mt-1">Schema {developer.workspaceVersion}</div>
          </div>

          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl md:col-span-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Pipeline Providers</div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {developer.activeProviders.map((p) => (
                <span key={p} className="px-2.5 py-1 bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono text-xs rounded-lg">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Mock Mode</div>
            <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Enabled (Client-Only)
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Feature Flags */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Code className="h-5 w-5 text-purple-400" /> Active Feature Flags (Read-Only)
        </h3>
        <p className="text-sm text-gray-400 mb-4">Architectural switches controlling heuristic and AI synthesis paths.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {developer.featureFlags.map((flag) => (
            <div key={flag.key} className="p-3 bg-gray-900/40 border border-gray-800/80 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-gray-300">{flag.label}</div>
                <div className="font-mono text-xs text-gray-500">{flag.key}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${flag.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-400"}`}>
                {flag.enabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Import / Export Settings Backup (Additional Requirement 2) */}
      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Download className="h-5 w-5 text-purple-400" /> Backup & Restore Configuration
        </h3>
        <p className="text-sm text-gray-400 mb-4">Export your custom studio preferences to a JSON backup or import them across machines.</p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              onExportBackup();
              showToast("Settings configuration exported to file.");
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-sm text-white flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all"
          >
            <Download className="h-4 w-4" /> Export Settings (.json)
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 hover:border-gray-600 font-bold text-sm text-gray-200 flex items-center gap-2 transition-all"
          >
            <Upload className="h-4 w-4" /> Import Settings Backup
          </button>

          <button
            onClick={() => {
              if (confirm("Reset settings to clean defaults?")) {
                onRestoreDefaults();
                showToast("Settings restored to factory default values.");
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 font-bold text-sm text-gray-400 hover:text-gray-200 transition-all ml-auto"
          >
            Restore Default Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
