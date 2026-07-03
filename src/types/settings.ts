// Domain types for ReelForge AI v1.3 Phase 12 — Settings & Provider Management

export type ThemeMode = "dark" | "light" | "system";
export type AccentColor = "purple" | "blue" | "emerald";
export type DefaultLandingPage = "studio" | "workspace" | "export" | "settings";

export type InstagramProviderType = "mock" | "apify" | "rapidapi" | "brightdata";
export type AIProviderType = "disabled" | "gemini" | "openai" | "claude";

export type ProviderStatus = "Active" | "Available" | "Coming Soon" | "Not Configured";

export interface ProviderItem<T extends string> {
  id: T;
  name: string;
  description: string;
  status: ProviderStatus;
  disabled: boolean;
}

export interface AppearancePreferences {
  theme: ThemeMode;
  accentColor: AccentColor;
}

export interface WorkspacePreferences {
  autoSave: boolean;
  defaultLandingPage: DefaultLandingPage;
  recentProjectsLimit: 5 | 10 | 25 | 50;
}

export interface ExportPreferences {
  defaultFormat: "print" | "markdown" | "html" | "json";
  includeCoverPage: boolean;
  includeMetadata: boolean;
}

export interface ProviderPreferences {
  instagramProvider: InstagramProviderType;
  aiProvider: AIProviderType;
}

export interface DeveloperFeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
}

export interface DeveloperInfo {
  buildType: "Development" | "Staging" | "Production";
  storageEngine: string;
  activeProviders: string[];
  workspaceVersion: string;
  mockMode: boolean;
  featureFlags: DeveloperFeatureFlag[];
}

export interface StorageUsageDetails {
  totalProjects: number;
  projectsSizeBytes: number;
  projectsSizeFormatted: string;
  historyCount: number;
  historySizeBytes: number;
  historySizeFormatted: string;
  settingsSizeBytes: number;
  settingsSizeFormatted: string;
  totalSizeBytes: number;
  totalSizeFormatted: string;
}

export interface AppSettings {
  version: "1.3.0";
  appearance: AppearancePreferences;
  workspace: WorkspacePreferences;
  export: ExportPreferences;
  providers: ProviderPreferences;
  developer: DeveloperInfo;
}
