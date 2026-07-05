import { getProjectProvider } from "./providers";
import type { SavedProject, ProjectSortOption, StorageStats } from "@/types/project";

export class WorkspaceService {
  private static get provider() {
    return getProjectProvider();
  }

  /**
   * Get all projects with optional search filtering and sorting
   */
  public static async getAll(search?: string, sort: ProjectSortOption = "newest"): Promise<SavedProject[]> {
    let projects = await this.provider.getProjects();

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
  public static async getById(id: string): Promise<SavedProject | null> {
    return this.provider.getProjectById(id);
  }

  /**
   * Save a new or existing project
   */
  public static async save(project: SavedProject): Promise<SavedProject> {
    return this.provider.saveProject(project);
  }

  /**
   * Update project fields
   */
  public static async update(id: string, updates: Partial<SavedProject>): Promise<SavedProject | null> {
    return this.provider.updateProject(id, updates);
  }

  /**
   * Rename a project
   */
  public static async rename(id: string, newName: string): Promise<SavedProject | null> {
    if (!newName.trim()) return null;
    return this.provider.updateProject(id, { name: newName.trim() });
  }

  /**
   * Delete a project permanently
   */
  public static async delete(id: string): Promise<boolean> {
    return this.provider.deleteProject(id);
  }

  /**
   * Duplicate a project
   */
  public static async duplicate(id: string): Promise<SavedProject | null> {
    const original = await this.provider.getProjectById(id);
    if (!original) return null;

    const newId = crypto.randomUUID();
    const newName = `${original.name} (Copy)`;
    return this.provider.duplicateProject(id, newId, newName);
  }

  /**
   * Get storage statistics
   */
  public static async getStats(): Promise<StorageStats> {
    return this.provider.getStorageStats();
  }
}
