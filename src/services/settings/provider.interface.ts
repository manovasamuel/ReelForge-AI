import { AppSettings, StorageUsageDetails } from "@/types/settings";

export interface ISettingsProvider {
  /**
   * Reads and returns current application settings from persistent storage.
   * If no settings exist, initializes default settings with version "1.3.0".
   */
  getSettings(): AppSettings;

  /**
   * Merges partial settings changes into storage and returns the updated AppSettings object.
   */
  saveSettings(partialSettings: Partial<AppSettings>): AppSettings;

  /**
   * Resets application settings to clean defaults.
   */
  resetSettings(): AppSettings;

  /**
   * Calculates granular storage usage details across projects, history, and settings.
   */
  getStorageDetails(): StorageUsageDetails;

  /**
   * Clears all saved projects from the workspace repository.
   */
  clearWorkspaceProjects(): boolean;

  /**
   * Clears all export history log entries.
   */
  clearExportHistory(): boolean;

  /**
   * Resets entire storage (projects, export log, and settings).
   */
  resetAllStorage(): boolean;

  /**
   * Exports current application settings as a formatted JSON string for backups.
   */
  exportSettingsJson(): string;

  /**
   * Validates and imports settings from a JSON string backup.
   */
  importSettingsJson(jsonString: string): AppSettings;
}
