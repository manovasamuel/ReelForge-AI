"use client";

import React, { useState, useEffect } from "react";
import { AppSettings, StorageUsageDetails } from "@/types/settings";
import { SettingsService } from "@/services/settings";
import { AppearanceSection } from "./appearance-section";
import { ProvidersSection } from "./providers-section";
import { WorkspaceSection } from "./workspace-section";
import { ExportSection } from "./export-section";
import { StorageSection } from "./storage-section";
import { AboutSection } from "./about-section";
import { Moon, Database, Home, FileText, HardDrive, Info, Settings as SettingsIcon } from "lucide-react";

type SettingsTab = "appearance" | "providers" | "workspace" | "export" | "storage" | "about";

export function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [storageDetails, setStorageDetails] = useState<StorageUsageDetails | null>(null);

  const reloadData = () => {
    setSettings(SettingsService.getSettings());
    setStorageDetails(SettingsService.getStorageDetails());
  };

  useEffect(() => {
    reloadData();
  }, []);

  if (!settings || !storageDetails) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    const updated = SettingsService.saveSettings(partial);
    setSettings(updated);
    setStorageDetails(SettingsService.getStorageDetails());
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "appearance", label: "Appearance & Theme", icon: <Moon className="h-4 w-4" /> },
    { id: "providers", label: "Pipeline Providers", icon: <Database className="h-4 w-4" /> },
    { id: "workspace", label: "Workspace & Auto-Save", icon: <Home className="h-4 w-4" /> },
    { id: "export", label: "Export Formatting", icon: <FileText className="h-4 w-4" /> },
    { id: "storage", label: "Storage & Data", icon: <HardDrive className="h-4 w-4" /> },
    { id: "about", label: "About & Developer", icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
            <SettingsIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              Settings & Provider Studio
              <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full">
                v1.3.0
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Configure deterministic social intelligence backends, studio themes, and browser storage telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="p-3 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl space-y-1 sticky top-6">
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-left ${
                  active
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 p-6 bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-xl min-h-[500px]">
          {activeTab === "appearance" && (
            <AppearanceSection
              preferences={settings.appearance}
              onChange={(appearance) => handleUpdateSettings({ appearance: { ...settings.appearance, ...appearance } })}
            />
          )}

          {activeTab === "providers" && (
            <ProvidersSection
              preferences={settings.providers}
              onChange={(providers) => handleUpdateSettings({ providers: { ...settings.providers, ...providers } })}
            />
          )}

          {activeTab === "workspace" && (
            <WorkspaceSection
              preferences={settings.workspace}
              onChange={(workspace) => handleUpdateSettings({ workspace: { ...settings.workspace, ...workspace } })}
            />
          )}

          {activeTab === "export" && (
            <ExportSection
              preferences={settings.export}
              onChange={(exp) => handleUpdateSettings({ export: { ...settings.export, ...exp } })}
            />
          )}

          {activeTab === "storage" && (
            <StorageSection
              details={storageDetails}
              onClearWorkspace={() => {
                const res = SettingsService.clearWorkspaceProjects();
                reloadData();
                return res;
              }}
              onClearHistory={() => {
                const res = SettingsService.clearExportHistory();
                reloadData();
                return res;
              }}
              onResetEverything={() => {
                const res = SettingsService.resetAllStorage();
                reloadData();
                return res;
              }}
            />
          )}

          {activeTab === "about" && (
            <AboutSection
              developer={settings.developer}
              onExportBackup={() => SettingsService.downloadSettingsBackup()}
              onImportBackup={(json) => {
                const res = SettingsService.importSettingsJson(json);
                reloadData();
                return res;
              }}
              onRestoreDefaults={() => {
                SettingsService.resetSettings();
                reloadData();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
