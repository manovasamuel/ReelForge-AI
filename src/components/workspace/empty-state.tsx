"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderGit2, Sparkles, Plus, Layers } from "lucide-react";

interface EmptyWorkspaceStateProps {
  onCreateNew: () => void;
}

export function EmptyWorkspaceState({ onCreateNew }: EmptyWorkspaceStateProps) {
  return (
    <Card className="border-violet-500/30 bg-card/60 backdrop-blur-xl shadow-2xl shadow-violet-950/30 p-8 md:p-12 text-center overflow-hidden relative">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/10 via-transparent to-fuchsia-600/10 pointer-events-none" />
      
      <CardContent className="space-y-6 max-w-lg mx-auto pt-4 relative z-10">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/40 flex items-center justify-center shadow-inner">
          <FolderGit2 className="h-10 w-10 text-violet-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-semibold text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
            ReelForge AI v1.1 Workspace
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
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold px-8 py-6 text-base shadow-lg shadow-violet-950/50 gap-2 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" /> Create your first analysis
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/40 text-left text-xs">
          <div className="p-3 rounded-xl bg-background/40 border border-border/40">
            <span className="font-bold text-violet-300 block">100% Local</span>
            <span className="text-[11px] text-muted-foreground">Browser localStorage</span>
          </div>
          <div className="p-3 rounded-xl bg-background/40 border border-border/40">
            <span className="font-bold text-fuchsia-300 block">Complete State</span>
            <span className="text-[11px] text-muted-foreground">Phases 1–9 saved</span>
          </div>
          <div className="p-3 rounded-xl bg-background/40 border border-border/40">
            <span className="font-bold text-amber-300 block">Zero Re-Run</span>
            <span className="text-[11px] text-muted-foreground">Instant restore</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
