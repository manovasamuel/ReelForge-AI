import type { IProjectProvider } from "../provider.interface";
import type { SavedProject, StorageStats } from "@/types/project";
import { CloudProjectProvider } from "./cloud.provider";
import { LocalProjectProvider } from "./local.provider";

/**
 * Hybrid project provider that attempts cloud persistence via Supabase first,
 * and automatically falls back to browser localStorage during local development,
 * offline mode, or when the database client is unconfigured/unavailable.
 */
export class HybridProjectProvider implements IProjectProvider {
  private cloud = new CloudProjectProvider();
  private local = new LocalProjectProvider();

  private isOfflineOrLocalOnly(): boolean {
    if (typeof window === "undefined") return true;
    if (process.env.NEXT_PUBLIC_STORAGE_PROVIDER === "local") return true;
    if (!navigator.onLine) return true;
    return false;
  }

  public async getProjects(): Promise<SavedProject[]> {
    if (this.isOfflineOrLocalOnly()) {
      return this.local.getProjects();
    }
    try {
      return await this.cloud.getProjects();
    } catch (error) {
      console.warn("Cloud provider getProjects failed or unavailable, falling back to local:", error);
      return this.local.getProjects();
    }
  }

  public async getProjectById(id: string): Promise<SavedProject | null> {
    if (this.isOfflineOrLocalOnly()) {
      return this.local.getProjectById(id);
    }
    try {
      return await this.cloud.getProjectById(id);
    } catch (error) {
      console.warn("Cloud provider getProjectById failed or unavailable, falling back to local:", error);
      return this.local.getProjectById(id);
    }
  }

  public async saveProject(project: SavedProject): Promise<SavedProject> {
    if (this.isOfflineOrLocalOnly()) {
      return this.local.saveProject(project);
    }
    try {
      return await this.cloud.saveProject(project);
    } catch (error) {
      console.warn("Cloud provider saveProject failed or unavailable, falling back to local:", error);
      return this.local.saveProject(project);
    }
  }

  public async updateProject(id: string, updates: Partial<SavedProject>): Promise<SavedProject | null> {
    if (this.isOfflineOrLocalOnly()) {
      return this.local.updateProject(id, updates);
    }
    try {
      return await this.cloud.updateProject(id, updates);
    } catch (error) {
      console.warn("Cloud provider updateProject failed or unavailable, falling back to local:", error);
      return this.local.updateProject(id, updates);
    }
  }

  public async deleteProject(id: string): Promise<boolean> {
    if (this.isOfflineOrLocalOnly()) {
      return this.local.deleteProject(id);
    }
    try {
      return await this.cloud.deleteProject(id);
    } catch (error) {
      console.warn("Cloud provider deleteProject failed or unavailable, falling back to local:", error);
      return this.local.deleteProject(id);
    }
  }

  public async duplicateProject(id: string, newId: string, newName: string): Promise<SavedProject | null> {
    if (this.isOfflineOrLocalOnly()) {
      return this.local.duplicateProject(id, newId, newName);
    }
    try {
      return await this.cloud.duplicateProject(id, newId, newName);
    } catch (error) {
      console.warn("Cloud provider duplicateProject failed or unavailable, falling back to local:", error);
      return this.local.duplicateProject(id, newId, newName);
    }
  }

  public async getStorageStats(projectsInput?: SavedProject[]): Promise<StorageStats> {
    if (this.isOfflineOrLocalOnly()) {
      return this.local.getStorageStats(projectsInput);
    }
    try {
      return await this.cloud.getStorageStats(projectsInput);
    } catch (error) {
      console.warn("Cloud provider getStorageStats failed or unavailable, falling back to local:", error);
      return this.local.getStorageStats(projectsInput);
    }
  }
}
