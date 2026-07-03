import type { IProjectProvider } from "../provider.interface";
import type { SavedProject, StorageStats } from "@/types/project";

const STORAGE_KEY = "reelforge_projects_v1";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export class LocalProjectProvider implements IProjectProvider {
  private getRawProjects(): SavedProject[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as SavedProject[];
    } catch {
      return [];
    }
  }

  private saveRawProjects(projects: SavedProject[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to persist projects to localStorage:", error);
      throw new Error("Storage quota exceeded or storage unavailable.");
    }
  }

  public getProjects(): SavedProject[] {
    return this.getRawProjects();
  }

  public getProjectById(id: string): SavedProject | null {
    const projects = this.getRawProjects();
    return projects.find((p) => p.id === id) || null;
  }

  public saveProject(project: SavedProject): SavedProject {
    const projects = this.getRawProjects();
    const index = projects.findIndex((p) => p.id === project.id);
    const now = new Date().toISOString();

    const toSave: SavedProject = {
      ...project,
      version: "1.1.0",
      updatedAt: now,
    };

    if (index >= 0) {
      projects[index] = toSave;
    } else {
      projects.push(toSave);
    }

    this.saveRawProjects(projects);
    return toSave;
  }

  public updateProject(id: string, updates: Partial<SavedProject>): SavedProject | null {
    const projects = this.getRawProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated: SavedProject = {
      ...projects[index],
      ...updates,
      id: projects[index].id, // Prevent overriding ID
      version: "1.1.0",
      updatedAt: new Date().toISOString(),
    };

    projects[index] = updated;
    this.saveRawProjects(projects);
    return updated;
  }

  public deleteProject(id: string): boolean {
    const projects = this.getRawProjects();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) return false;

    this.saveRawProjects(filtered);
    return true;
  }

  public duplicateProject(id: string, newId: string, newName: string): SavedProject | null {
    const original = this.getProjectById(id);
    if (!original) return null;

    const now = new Date().toISOString();
    const duplicate: SavedProject = {
      ...original,
      id: newId,
      version: "1.1.0",
      name: newName,
      createdAt: now,
      updatedAt: now,
      state: JSON.parse(JSON.stringify(original.state)), // Deep copy state
    };

    const projects = this.getRawProjects();
    projects.push(duplicate);
    this.saveRawProjects(projects);
    return duplicate;
  }

  public getStorageStats(): StorageStats {
    const projects = this.getRawProjects();
    const totalProjects = projects.length;

    if (totalProjects === 0) {
      return {
        totalProjects: 0,
        totalStorageUsedBytes: 0,
        totalStorageUsedFormatted: "0 B",
        largestProjectName: "None",
        largestProjectSizeBytes: 0,
        largestProjectSizeFormatted: "0 B",
        averageProjectSizeBytes: 0,
        averageProjectSizeFormatted: "0 B",
        lastSaved: null,
      };
    }

    let totalBytes = 0;
    let largestName = "";
    let largestBytes = 0;
    let latestTimestamp: number = 0;
    let lastSavedIso: string | null = null;

    for (const p of projects) {
      const serialized = JSON.stringify(p);
      const bytes = new Blob([serialized]).size;
      totalBytes += bytes;

      if (bytes > largestBytes) {
        largestBytes = bytes;
        largestName = p.name;
      }

      const updatedMs = new Date(p.updatedAt).getTime();
      if (updatedMs > latestTimestamp) {
        latestTimestamp = updatedMs;
        lastSavedIso = p.updatedAt;
      }
    }

    const avgBytes = Math.round(totalBytes / totalProjects);

    return {
      totalProjects,
      totalStorageUsedBytes: totalBytes,
      totalStorageUsedFormatted: formatBytes(totalBytes),
      largestProjectName: largestName || "Unnamed Project",
      largestProjectSizeBytes: largestBytes,
      largestProjectSizeFormatted: formatBytes(largestBytes),
      averageProjectSizeBytes: avgBytes,
      averageProjectSizeFormatted: formatBytes(avgBytes),
      lastSaved: lastSavedIso,
    };
  }
}
