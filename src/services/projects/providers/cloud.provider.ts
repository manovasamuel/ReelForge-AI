import type { IProjectProvider } from "../provider.interface";
import type { SavedProject, StorageStats } from "@/types/project";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export class CloudProjectProvider implements IProjectProvider {
  public async getProjects(): Promise<SavedProject[]> {
    const res = await fetch("/api/v2/projects", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Cloud getProjects failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.projects || [];
  }

  public async getProjectById(id: string): Promise<SavedProject | null> {
    const res = await fetch(`/api/v2/projects/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Cloud getProjectById failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.project || null;
  }

  public async saveProject(project: SavedProject): Promise<SavedProject> {
    const res = await fetch("/api/v2/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      throw new Error(`Cloud saveProject failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.project;
  }

  public async updateProject(id: string, updates: Partial<SavedProject>): Promise<SavedProject | null> {
    const res = await fetch(`/api/v2/projects/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", updates }),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Cloud updateProject failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.project || null;
  }

  public async deleteProject(id: string): Promise<boolean> {
    const res = await fetch(`/api/v2/projects/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 404) return false;
    if (!res.ok) {
      throw new Error(`Cloud deleteProject failed with status ${res.status}`);
    }
    return true;
  }

  public async duplicateProject(id: string, newId: string, newName: string): Promise<SavedProject | null> {
    const res = await fetch(`/api/v2/projects/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate", newId, newName }),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Cloud duplicateProject failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.project || null;
  }

  public async getStorageStats(projectsInput?: SavedProject[]): Promise<StorageStats> {
    const projects = projectsInput ?? (await this.getProjects());
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
