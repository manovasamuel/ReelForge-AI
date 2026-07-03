"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FolderOpen,
  Edit2,
  Copy,
  Trash2,
  Check,
  X,
  Calendar,
  ExternalLink,
  Sparkles,
  Layers,
} from "lucide-react";
import type { SavedProject } from "@/types/project";

interface ProjectCardProps {
  project: SavedProject;
  onOpen: (project: SavedProject) => void;
  onRename: (id: string, newName: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({
  project,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.name);

  function handleSaveRename() {
    if (editedName.trim() && editedName !== project.name) {
      onRename(project.id, editedName.trim());
    }
    setIsEditing(false);
  }

  // Count completed phases in the snapshot
  const completedPhases: string[] = [];
  if (project.state.profile) completedPhases.push("Ingestion");
  if (project.state.brandReport) completedPhases.push("Brand");
  if (project.state.competitors && project.state.competitors.length > 0) completedPhases.push("Discovery");
  if (project.state.competitorAnalysis) completedPhases.push("Analysis");
  if (project.state.contentCollection) completedPhases.push("Collection");
  if (project.state.contentIntelligence) completedPhases.push("Intelligence");
  if (project.state.contentDNA) completedPhases.push("DNA Blueprint");
  if (project.state.scriptPackage) completedPhases.push("Script Studio");
  if (project.state.repurposePackage) completedPhases.push("Multi-Platform");

  const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="group overflow-hidden border-violet-500/30 bg-card/80 hover:bg-card/95 transition-all duration-300 shadow-xl shadow-violet-950/20 backdrop-blur-md flex flex-col justify-between">
      <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-70 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveRename();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  className="h-8 text-sm font-bold bg-background/80 border-violet-500/50 text-white"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-400" onClick={handleSaveRename}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group/title">
                <CardTitle className="text-base font-bold text-white truncate" title={project.name}>
                  {project.name}
                </CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover/title:opacity-100 transition-opacity text-muted-foreground hover:text-white"
                  onClick={() => {
                    setEditedName(project.name);
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-violet-300 truncate">
                {project.state.profile ? `@${project.state.profile.username}` : project.instagramUrl}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="h-3 w-3 text-amber-400" />
                {formattedDate}
              </span>
            </div>
          </div>

          <Badge variant="outline" className="border-violet-500/40 text-violet-300 bg-violet-500/10 text-[10px] shrink-0">
            {completedPhases.length}/9 Phases
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* Completed workflow phases tags */}
        <div className="flex flex-wrap gap-1.5 min-h-[48px] content-start">
          {completedPhases.map((phase) => (
            <Badge
              key={phase}
              variant="secondary"
              className="bg-background/60 border border-border/40 text-muted-foreground text-[10px] px-2 py-0.5"
            >
              <Sparkles className="h-2.5 w-2.5 text-fuchsia-400 mr-1" />
              {phase}
            </Badge>
          ))}
          {completedPhases.length === 0 && (
            <span className="text-xs text-muted-foreground italic">No phases completed</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(project.id)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-white hover:bg-violet-500/10"
              title="Duplicate Project"
            >
              <Copy className="h-3.5 w-3.5 mr-1 text-violet-400" /> Duplicate
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(project.id)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Delete Project"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1 text-destructive" /> Delete
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => onOpen(project)}
            className="h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs gap-1.5 px-3.5 shadow-md shadow-violet-950/40"
          >
            <FolderOpen className="h-3.5 w-3.5" /> Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
