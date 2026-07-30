"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/layout";
import { WorkspaceDashboard } from "@/components/workspace";
import { WorkspaceService } from "@/services/projects";
import type { SavedProject, ProjectSortOption } from "@/types/project";
import { showToast } from "@/components/ui/toast";

export default function WorkspacePage() {
  const router = useRouter();
  
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<ProjectSortOption>("newest");

  async function loadWorkspaceData() {
    const all = await WorkspaceService.getAll();
    setProjects(all);
  }

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  function handleOpenProject(project: SavedProject) {
    router.push(`/studio/${project.id}?step=profile`);
  }

  async function handleRenameProject(id: string, newName: string) {
    await WorkspaceService.rename(id, newName);
    await loadWorkspaceData();
    showToast(`Project Renamed: Renamed to "${newName}".`);
  }

  async function handleDuplicateProject(id: string) {
    const copy = await WorkspaceService.duplicate(id);
    if (copy) {
      await loadWorkspaceData();
      showToast(`Project Duplicated: Created duplicate "${copy.name}".`);
    }
  }

  async function handleDeleteProject(id: string) {
    await WorkspaceService.delete(id);
    await loadWorkspaceData();
    showToast("Project Deleted: Permanent deletion completed.");
  }

  function handleCreateNewAnalysis() {
    router.push("/studio/new");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Workspace"
        description="Manage your saved projects, brand knowledge, and assets."
      />
      <div className="mt-8">
        <WorkspaceDashboard
          projects={projects}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onOpenProject={handleOpenProject}
          onRenameProject={handleRenameProject}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onCreateNew={handleCreateNewAnalysis}
        />
      </div>
    </PageContainer>
  );
}
