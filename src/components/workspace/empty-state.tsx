"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderGit2, Box, Plus, Layers } from "lucide-react";

interface EmptyWorkspaceStateProps {
  onCreateNew: () => void;
}

export function EmptyWorkspaceState({ onCreateNew }: EmptyWorkspaceStateProps) {
  return (
    <Card className="border-border bg-card shadow-none p-8 md:p-12 text-center">
      <CardContent className="space-y-6 max-w-lg mx-auto pt-4 relative z-10">
        <div className="mx-auto w-16 h-16 rounded-md bg-muted border border-border flex items-center justify-center">
          <FolderGit2 className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted border border-border text-xs font-medium text-foreground">
            ReelForge AI Workspace
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            No saved projects yet.
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your workspace repository stores all your omnichannel intelligence reports, competitor breakdowns, Content DNA blueprints, and shooting scripts locally in your browser.
          </p>
        </div>

        <div className="pt-2">
          <Button
            size="lg"
            onClick={onCreateNew}
            className="font-medium px-8 py-6 text-base gap-2 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" /> Create Analysis
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border text-left text-xs">
          <div className="p-3 rounded-md bg-muted border border-border">
            <span className="font-medium text-foreground block">Cloud Workspace</span>
            <span className="text-[11px] text-muted-foreground">Supabase Persistence</span>
          </div>
          <div className="p-3 rounded-md bg-muted border border-border">
            <span className="font-medium text-foreground block">Complete State</span>
            <span className="text-[11px] text-muted-foreground">Phases 1–9 saved</span>
          </div>
          <div className="p-3 rounded-md bg-muted border border-border">
            <span className="font-medium text-foreground block">Zero Re-Run</span>
            <span className="text-[11px] text-muted-foreground">Instant restore</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
