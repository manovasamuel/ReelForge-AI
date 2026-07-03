import { getSettingsProvider } from "./providers";
import { AppSettings, StorageUsageDetails } from "@/types/settings";

export class SettingsService {
  private static get provider() {
    return getSettingsProvider();
  }

  public static getSettings(): AppSettings {
    return this.provider.getSettings();
  }

  public static saveSettings(partialSettings: Partial<AppSettings>): AppSettings {
    return this.provider.saveSettings(partialSettings);
  }

  public static resetSettings(): AppSettings {
    return this.provider.resetSettings();
  }

  public static getStorageDetails(): StorageUsageDetails {
    return this.provider.getStorageDetails();
  }

  public static clearWorkspaceProjects(): boolean {
    return this.provider.clearWorkspaceProjects();
  }

  public static clearExportHistory(): boolean {
    return this.provider.clearExportHistory();
  }

  public static resetAllStorage(): boolean {
    return this.provider.resetAllStorage();
  }

  public static exportSettingsJson(): string {
    return this.provider.exportSettingsJson();
  }

  public static importSettingsJson(jsonString: string): AppSettings {
    return this.provider.importSettingsJson(jsonString);
  }

  /**
   * Triggers a browser download file containing the exported settings JSON.
   */
  public static downloadSettingsBackup(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const json = this.exportSettingsJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reelforge-settings-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error("Failed to download settings backup:", e);
      return false;
    }
  }
}
