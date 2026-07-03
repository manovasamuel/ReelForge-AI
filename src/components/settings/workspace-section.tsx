"use client";

import React from "react";
import { WorkspacePreferences, DefaultLandingPage } from "@/types/settings";
import { FolderKanban, Save, Home, ListFilter } from "lucide-react";

interface WorkspaceSectionProps {
  preferences: WorkspacePreferences;
  onChange: (updated: Partial<WorkspacePreferences>) => void;
}

export function WorkspaceSection({ preferences, onChange }: WorkspaceSectionProps) {
  const landingPages: { id: DefaultLandingPage; label: string; desc: string }[] = [
    { id: "studio", label: "Studio Pipeline", desc: "Live multi-phase intelligence workflow and script builder." },
    { id: "workspace", label: "Project Workspace", desc: "Saved repositories, storage telemetry, and state restoration." },
    { id: "export", label: "Export Center", desc: "Omnichannel report formatting and PDF/Markdown downloads." },
    { id: "settings", label: "Settings Dashboard", desc: "System configuration and provider preferences." },
  ];

  const limits: (5 | 10 | 25 | 50)[] = [5, 10, 25, 50];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center justify-between p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Save className="h-5 w-5 text-purple-400 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-white">Auto-Save Live Studio State</div>
              <p className="text-xs text-gray-400 mt-0.5">
                Automatically snapshot progress into active workspace slot on phase transition.
              </p>
            </div>
          </div>
          <button
            onClick={() => onChange({ autoSave: !preferences.autoSave })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              preferences.autoSave ? "bg-purple-600 justify-end" : "bg-gray-800 justify-start"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Home className="h-5 w-5 text-purple-400" /> Default Startup Landing View
        </h3>
        <p className="text-sm text-gray-400 mb-4">Select which workspace hub opens automatically when launching ReelForge AI.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {landingPages.map((lp) => {
            const active = preferences.defaultLandingPage === lp.id;
            return (
              <button
                key={lp.id}
                onClick={() => onChange({ defaultLandingPage: lp.id })}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  active
                    ? "bg-purple-900/40 border-purple-500 text-white shadow-md"
                    : "bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700"
                }`}
              >
                <div className="font-semibold text-sm mb-1 flex items-center justify-between">
                  {lp.label}
                  {active && <span className="h-2 w-2 rounded-full bg-purple-400" />}
                </div>
                <p className="text-xs text-gray-400">{lp.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <ListFilter className="h-5 w-5 text-purple-400" /> Recent Projects Display Limit
        </h3>
        <p className="text-sm text-gray-400 mb-4">Maximum number of recent analyses shown on the quick-switch bar.</p>
        <div className="flex flex-wrap gap-3">
          {limits.map((l) => {
            const active = preferences.recentProjectsLimit === l;
            return (
              <button
                key={l}
                onClick={() => onChange({ recentProjectsLimit: l })}
                className={`px-6 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 ${
                  active
                    ? "bg-purple-600 border-purple-500 text-white shadow-md"
                    : "bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700"
                }`}
              >
                {l} Projects
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
