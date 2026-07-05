"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  PlusCircle,
  Clock,
  HardDrive,
  Sparkles,
  Database,
  BarChart2,
  FileText,
} from "lucide-react";
import type { StorageStats } from "@/types/project";

export type WorkspaceSection = "all" | "recent" | "new";

interface WorkspaceSidebarProps {
  activeSection: WorkspaceSection;
  onSelectSection: (section: WorkspaceSection) => void;
  stats: StorageStats;
}

export function WorkspaceSidebar({
  activeSection,
  onSelectSection,
  stats,
}: WorkspaceSidebarProps) {
  return (
    <Card className="w-full overflow-hidden border-violet-500/30 bg-card/90 shadow-xl shadow-violet-950/20 backdrop-blur-md">
      <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-violet-400" />
            <CardTitle className="text-sm font-bold tracking-tight text-white">
              Workspace Navigation
            </CardTitle>
          </div>
          <Badge variant="outline" className="border-fuchsia-500/40 text-fuchsia-300 bg-fuchsia-500/10 text-[10px]">
            v1.1.0
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 text-xs pb-5">
        {/* Navigation actions */}
        <div className="space-y-1.5">
          <Button
            variant={activeSection === "new" ? "default" : "ghost"}
            onClick={() => onSelectSection("new")}
            className={`w-full justify-start gap-2.5 font-semibold text-xs ${
              activeSection === "new"
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-950/50"
                : "text-muted-foreground hover:text-white hover:bg-violet-500/10"
            }`}
          >
            <PlusCircle className="h-4 w-4 text-violet-300 shrink-0" />
            New Analysis
          </Button>

          <Button
            variant={activeSection === "all" ? "default" : "ghost"}
            onClick={() => onSelectSection("all")}
            className={`w-full justify-start gap-2.5 font-semibold text-xs ${
              activeSection === "all"
                ? "bg-violet-600/30 border border-violet-500/40 text-white"
                : "text-muted-foreground hover:text-white hover:bg-violet-500/10"
            }`}
          >
            <FolderOpen className="h-4 w-4 text-fuchsia-400 shrink-0" />
            All Projects
            <Badge variant="secondary" className="ml-auto bg-violet-500/20 text-violet-300 text-[10px] px-1.5 py-0">
              {stats.totalProjects}
            </Badge>
          </Button>

          <Button
            variant={activeSection === "recent" ? "default" : "ghost"}
            onClick={() => onSelectSection("recent")}
            className={`w-full justify-start gap-2.5 font-semibold text-xs ${
              activeSection === "recent"
                ? "bg-violet-600/30 border border-violet-500/40 text-white"
                : "text-muted-foreground hover:text-white hover:bg-violet-500/10"
            }`}
          >
            <Clock className="h-4 w-4 text-amber-400 shrink-0" />
            Recent Projects
          </Button>
        </div>

        <Separator className="opacity-30" />

        {/* Storage Usage Telemetry */}
        <div className="space-y-3 rounded-xl border border-border/60 bg-background/50 p-3.5">
          <div className="flex items-center justify-between font-bold text-foreground">
            <span className="flex items-center gap-1.5 text-xs">
              <HardDrive className="h-3.5 w-3.5 text-violet-400" />
              Storage Telemetry
            </span>
            <span className="text-[10px] text-muted-foreground">Supabase Cloud</span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Projects</span>
              <span className="font-bold text-white">{stats.totalProjects}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="font-bold text-violet-300">{stats.totalStorageUsedFormatted}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg Project Size</span>
              <span className="font-medium text-foreground">{stats.averageProjectSizeFormatted}</span>
            </div>

            <Separator className="opacity-20 my-1.5" />

            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block">Largest Project</span>
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground truncate max-w-[130px]" title={stats.largestProjectName}>
                  {stats.largestProjectName}
                </span>
                <span className="text-fuchsia-300 shrink-0">{stats.largestProjectSizeFormatted}</span>
              </div>
            </div>

            {stats.lastSaved && (
              <div className="pt-1.5 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Last Saved:</span>
                <span className="text-foreground">
                  {new Date(stats.lastSaved).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* App Version Card */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-xs">ReelForge AI</span>
              <span className="text-[10px] text-muted-foreground block">Workspace Edition</span>
            </div>
          </div>
          <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-[10px]">
            v1.1.0
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
