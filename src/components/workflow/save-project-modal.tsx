"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, Save, X, Sparkles, CheckCircle2 } from "lucide-react";

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectName: string) => void;
  defaultName?: string;
  completedPhasesCount: number;
}

export function SaveProjectModal({
  isOpen,
  onClose,
  onSave,
  defaultName = "ReelForge Analysis",
  completedPhasesCount,
}: SaveProjectModalProps) {
  const [projectName, setProjectName] = useState(defaultName);

  if (!isOpen) return null;

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (projectName.trim()) {
      onSave(projectName.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="w-full max-w-md rounded-2xl border border-violet-500/40 bg-card/95 p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Save Project to Workspace</h3>
              <span className="text-[11px] text-muted-foreground">Persist application state to your cloud workspace</span>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Project Name
            </label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., @nike Creator Teardown"
              required
              className="bg-background/80 border-border/80 h-10 text-sm font-medium text-white focus:border-violet-500 rounded-xl"
              autoFocus
            />
          </div>

          <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-violet-200">
                <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
                Snapshot Telemetry
              </span>
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 text-[10px]">
                v1.2.0 Schema
              </Badge>
            </div>
            <p className="text-[11px] text-violet-300/80 leading-relaxed">
              Stores your complete application state including all {completedPhasesCount} completed phases, raw profiles, competitor analysis breakdowns, Content DNA, and generated studio packages.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs gap-1.5 px-5 shadow-lg shadow-violet-950/50"
            >
              <Save className="h-3.5 w-3.5" /> Save Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
