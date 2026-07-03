"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  SlidersHorizontal,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { ProjectCard } from "./project-card";
import { EmptyWorkspaceState } from "./empty-state";
import type { SavedProject, ProjectSortOption } from "@/types/project";

interface WorkspaceDashboardProps {
  projects: SavedProject[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: ProjectSortOption;
  onSortChange: (sort: ProjectSortOption) => void;
  onOpenProject: (project: SavedProject) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onCreateNew: () => void;
}

export function WorkspaceDashboard({
  projects,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  onOpenProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onCreateNew,
}: WorkspaceDashboardProps) {
  const [projectToDelete, setProjectToDelete] = useState<SavedProject | null>(null);

  function handleConfirmDelete() {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-violet-500/30 bg-card/80 backdrop-blur-md shadow-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project name, @username, or profile URL..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/60 border-border/80 text-foreground placeholder:text-muted-foreground/80 h-10 text-sm rounded-xl focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/60 border border-border/80 text-xs text-muted-foreground shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-violet-400" />
            <span>Sort by:</span>
          </div>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as ProjectSortOption)}
            className="h-10 px-3 py-1 rounded-xl bg-background border border-border/80 text-sm font-semibold text-foreground focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="newest">Newest Created</option>
            <option value="updated">Recently Updated</option>
            <option value="oldest">Oldest Created</option>
            <option value="alphabetical">Alphabetical (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Grid of Projects or Empty State */}
      {projects.length === 0 ? (
        <EmptyWorkspaceState onCreateNew={onCreateNew} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={onOpenProject}
              onRename={onRenameProject}
              onDuplicate={onDuplicateProject}
              onDelete={() => setProjectToDelete(project)}
            />
          ))}
        </div>
      )}

      {/* Irreversible Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-md rounded-2xl border border-destructive/40 bg-card/95 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/15 border border-destructive/40 flex items-center justify-center text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Project Permanently?</h4>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background/60 border border-border/60 text-xs space-y-1">
              <span className="font-bold text-foreground block">{projectToDelete.name}</span>
              <span className="text-muted-foreground block truncate">{projectToDelete.instagramUrl}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectToDelete(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="text-xs font-bold gap-1.5 px-4 shadow-lg shadow-destructive/20"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
