import type { SavedProject, StorageStats } from "@/types/project";

export interface IProjectProvider {
  /**
   * Retrieve all saved workspace projects
   */
  getProjects(): Promise<SavedProject[]>;

  /**
   * Retrieve a single project by its unique ID
   */
  getProjectById(id: string): Promise<SavedProject | null>;

  /**
   * Persist a new or updated project
   */
  saveProject(project: SavedProject): Promise<SavedProject>;

  /**
   * Update specific fields of an existing project (e.g. rename)
   */
  updateProject(id: string, updates: Partial<SavedProject>): Promise<SavedProject | null>;

  /**
   * Delete a project permanently by ID
   */
  deleteProject(id: string): Promise<boolean>;

  /**
   * Duplicate an existing project with a new ID and name
   */
  duplicateProject(id: string, newId: string, newName: string): Promise<SavedProject | null>;

  /**
   * Retrieve storage telemetry statistics
   */
  getStorageStats(projects?: SavedProject[]): Promise<StorageStats>;
}
