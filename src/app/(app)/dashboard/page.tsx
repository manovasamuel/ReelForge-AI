"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkspaceService } from "@/services/projects";
import type { SavedProject } from "@/types/project";
import {
  BarChart3,
  TrendingUp,
  Users,
  Plus,
  FolderOpen,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const all = await WorkspaceService.getAll();
        setProjects(all);
      } catch {
        // Silently fail — dashboard still renders
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const recentProjects = projects.slice(0, 5);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your ReelForge workspace and recent activity."
      />

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "—" : projects.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Competitors Tracked</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "—" : projects.reduce((sum, p) => sum + (p.state?.competitors?.length || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scripts Generated</p>
              <p className="text-2xl font-bold text-foreground">
                {loading ? "—" : projects.filter(p => p.state?.scriptPackage != null).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Button
          onClick={() => router.push("/studio/new")}
          className="shadow-none rounded-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/workspace")}
          className="shadow-none rounded-md"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Open Workspace
        </Button>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
          {projects.length > 0 && (
            <Link
              href="/workspace"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 border border-dashed border-border rounded-md">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-transparent" />
          </div>
        ) : recentProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border rounded-md text-center">
            <p className="text-sm text-muted-foreground mb-2">No projects yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/studio/new")}
              className="shadow-none rounded-md"
            >
              <Plus className="mr-1 h-3 w-3" />
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/studio/${project.id}?step=profile`)}
                className="w-full flex items-center justify-between p-4 border border-border rounded-md bg-card hover:bg-accent/30 transition-colors text-left"
              >
                <div>
                  <div className="font-medium text-foreground text-sm">{project.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {project.updatedAt
                      ? `Updated ${new Date(project.updatedAt).toLocaleDateString()}`
                      : "No date"}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
