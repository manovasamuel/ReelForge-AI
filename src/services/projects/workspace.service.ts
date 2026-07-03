import { getProjectProvider } from "./providers";
import type { SavedProject, ProjectSortOption, StorageStats } from "@/types/project";

export class WorkspaceService {
  private static get provider() {
    return getProjectProvider();
  }

  /**
   * Get all projects with optional search filtering and sorting
   */
  public static getAll(search?: string, sort: ProjectSortOption = "newest"): SavedProject[] {
    let projects = this.provider.getProjects();

    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      projects = projects.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchUrl = p.instagramUrl.toLowerCase().includes(q);
        const matchUsername = p.state.profile?.username.toLowerCase().includes(q) || false;
        return matchName || matchUrl || matchUsername;
      });
    }

    projects.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return projects;
  }

  /**
   * Get project by ID
   */
  public static getById(id: string): SavedProject | null {
    return this.provider.getProjectById(id);
  }

  /**
   * Save a new or existing project
   */
  public static save(project: SavedProject): SavedProject {
    return this.provider.saveProject(project);
  }

  /**
   * Update project fields
   */
  public static update(id: string, updates: Partial<SavedProject>): SavedProject | null {
    return this.provider.updateProject(id, updates);
  }

  /**
   * Rename a project
   */
  public static rename(id: string, newName: string): SavedProject | null {
    if (!newName.trim()) return null;
    return this.provider.updateProject(id, { name: newName.trim() });
  }

  /**
   * Delete a project permanently
   */
  public static delete(id: string): boolean {
    return this.provider.deleteProject(id);
  }

  /**
   * Duplicate a project
   */
  public static duplicate(id: string): SavedProject | null {
    const original = this.provider.getProjectById(id);
    if (!original) return null;

    const newId = "proj_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    const newName = `${original.name} (Copy)`;
    return this.provider.duplicateProject(id, newId, newName);
  }

  /**
   * Get storage statistics
   */
  public static getStats(): StorageStats {
    return this.provider.getStorageStats();
  }
}
