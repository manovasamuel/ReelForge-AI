"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FolderOpen, Edit2, Copy, Trash2, Check, X, Calendar, ExternalLink, Box, Layers } from "lucide-react";
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
    <Card className="group overflow-hidden border-border bg-card hover:bg-accent/10 transition-colors duration-200 flex flex-col justify-between shadow-none">

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
                  className="h-8 text-sm font-bold bg-background border-border text-white"
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
              <span className="font-medium text-foreground truncate">
                {project.state.profile ? `@${project.state.profile.username}` : project.instagramUrl}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px]">
                <Calendar className="h-3 w-3 text-amber-400" />
                {formattedDate}
              </span>
            </div>
          </div>

          <Badge variant="outline" className="border-border text-muted-foreground bg-muted text-[10px] shrink-0">
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
              className="bg-muted border border-border text-foreground text-[10px] px-2 py-0.5"
            >
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
              className="h-8 px-2 text-xs text-muted-foreground hover:text-white hover:bg-muted"
              title="Duplicate Project"
            >
              <Copy className="h-3.5 w-3.5 mr-1 text-foreground" /> Duplicate
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
            className="h-8 text-xs gap-1.5 px-4 font-medium"
          >
            Open Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
