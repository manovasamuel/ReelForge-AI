import { ISettingsProvider } from "../provider.interface";
import { AppSettings, StorageUsageDetails } from "@/types/settings";

const SETTINGS_STORAGE_KEY = "reelforge_settings_v1.3";
const PROJECTS_STORAGE_KEY = "reelforge_projects";
const EXPORT_HISTORY_KEY = "reelforge_export_history";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  version: "1.3.0",
  appearance: {
    theme: "dark",
    accentColor: "purple",
  },
  workspace: {
    autoSave: true,
    defaultLandingPage: "studio",
    recentProjectsLimit: 10,
  },
  export: {
    defaultFormat: "markdown",
    includeCoverPage: true,
    includeMetadata: true,
  },
  providers: {
    instagramProvider: "mock",
    aiProvider: "disabled",
  },
  developer: {
    buildType: "Development",
    storageEngine: "Browser localStorage (Client-Side Only)",
    activeProviders: ["MockInstagramProvider", "MockBrandIntelligenceProvider", "MockCompetitorProvider", "MockScriptProvider", "LocalExportProvider"],
    workspaceVersion: "1.3.0",
    mockMode: true,
    featureFlags: [
      { key: "deterministic_engine", label: "Deterministic Heuristic Engine", enabled: true },
      { key: "teleprompter_mode", label: "Studio Teleprompter Reading View", enabled: true },
      { key: "print_stylesheet", label: "HTML+Print PDF Generator", enabled: true },
      { key: "real_ai_llm", label: "External LLM Synthesis (OpenAI/Gemini)", enabled: false },
      { key: "cloud_sync", label: "Cloud Workspace Sync", enabled: false },
    ],
  },
};

export class LocalSettingsProvider implements ISettingsProvider {
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  public getSettings(): AppSettings {
    if (typeof window === "undefined") {
      return DEFAULT_APP_SETTINGS;
    }
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        this.saveSettings(DEFAULT_APP_SETTINGS);
        return DEFAULT_APP_SETTINGS;
      }
      const parsed = JSON.parse(raw);
      // Ensure default structure exists for migrated/partial settings
      return {
        ...DEFAULT_APP_SETTINGS,
        ...parsed,
        appearance: { ...DEFAULT_APP_SETTINGS.appearance, ...(parsed.appearance || {}) },
        workspace: { ...DEFAULT_APP_SETTINGS.workspace, ...(parsed.workspace || {}) },
        export: { ...DEFAULT_APP_SETTINGS.export, ...(parsed.export || {}) },
        providers: { ...DEFAULT_APP_SETTINGS.providers, ...(parsed.providers || {}) },
        developer: { ...DEFAULT_APP_SETTINGS.developer, ...(parsed.developer || {}) },
      };
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  }

  public saveSettings(partialSettings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...partialSettings,
      appearance: { ...current.appearance, ...(partialSettings.appearance || {}) },
      workspace: { ...current.workspace, ...(partialSettings.workspace || {}) },
      export: { ...current.export, ...(partialSettings.export || {}) },
      providers: { ...current.providers, ...(partialSettings.providers || {}) },
      developer: { ...current.developer, ...(partialSettings.developer || {}) },
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist settings to localStorage:", e);
      }
    }
    return updated;
  }

  public resetSettings(): AppSettings {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS));
      } catch (e) {
        console.error("Failed to reset settings:", e);
      }
    }
    return DEFAULT_APP_SETTINGS;
  }

  public getStorageDetails(): StorageUsageDetails {
    let totalProjects = 0;
    let projectsSizeBytes = 0;
    let historyCount = 0;
    let historySizeBytes = 0;
    let settingsSizeBytes = 0;

    if (typeof window !== "undefined") {
      try {
        const projectsRaw = localStorage.getItem(PROJECTS_STORAGE_KEY) || "[]";
        projectsSizeBytes = new Blob([projectsRaw]).size;
        const projects = JSON.parse(projectsRaw);
        if (Array.isArray(projects)) totalProjects = projects.length;

        const historyRaw = localStorage.getItem(EXPORT_HISTORY_KEY) || "[]";
        historySizeBytes = new Blob([historyRaw]).size;
        const history = JSON.parse(historyRaw);
        if (Array.isArray(history)) historyCount = history.length;

        const settingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY) || "";
        settingsSizeBytes = new Blob([settingsRaw]).size;
      } catch (e) {
        console.error("Failed calculating storage details:", e);
      }
    }

    const totalSizeBytes = projectsSizeBytes + historySizeBytes + settingsSizeBytes;

    return {
      totalProjects,
      projectsSizeBytes,
      projectsSizeFormatted: this.formatBytes(projectsSizeBytes),
      historyCount,
      historySizeBytes,
      historySizeFormatted: this.formatBytes(historySizeBytes),
      settingsSizeBytes,
      settingsSizeFormatted: this.formatBytes(settingsSizeBytes),
      totalSizeBytes,
      totalSizeFormatted: this.formatBytes(totalSizeBytes),
    };
  }

  public clearWorkspaceProjects(): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(PROJECTS_STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  public clearExportHistory(): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(EXPORT_HISTORY_KEY);
      return true;
    } catch {
      return false;
    }
  }

  public resetAllStorage(): boolean {
    if (typeof window === "undefined") return false;
    try {
      localStorage.removeItem(PROJECTS_STORAGE_KEY);
      localStorage.removeItem(EXPORT_HISTORY_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      this.saveSettings(DEFAULT_APP_SETTINGS);
      return true;
    } catch {
      return false;
    }
  }

  public exportSettingsJson(): string {
    const settings = this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  public importSettingsJson(jsonString: string): AppSettings {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid settings backup payload");
      }
      return this.saveSettings(parsed);
    } catch (e) {
      console.error("Failed to import settings:", e);
      throw e;
    }
  }
}
