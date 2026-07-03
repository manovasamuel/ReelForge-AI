"use client";

import { CompetitorCard } from "./competitor-card";
import type { Competitor } from "@/types/competitor";
import { Users, ShieldCheck, TrendingUp, Sparkles, CheckCircle } from "lucide-react";

interface CompetitorListProps {
  competitors: Competitor[];
  onSelectCompetitor?: (username: string, selected: boolean) => void;
}

export function CompetitorList({ competitors, onSelectCompetitor }: CompetitorListProps) {
  if (!competitors || competitors.length === 0) return null;

  // Calculate compact statistics (Improvement 4)
  const total = competitors.length;
  const avgSimilarity = Math.round(
    competitors.reduce((acc, c) => acc + c.similarityScore, 0) / total
  );
  const highestConfidence = Math.max(...competitors.map((c) => c.confidenceScore));

  return (
    <div className="space-y-6 rounded-2xl border border-violet-500/30 bg-card/50 p-6 backdrop-blur-md animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/40">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                Top 10 Competitors Discovered
              </h3>
              <p className="text-xs text-muted-foreground">
                High-converting accounts sharing audience overlap & content style
              </p>
            </div>
          </div>
        </div>

        {/* Compact Statistic Chips (Improvement 4) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground">
            <Users className="h-3.5 w-3.5 text-violet-400" />
            <span>Total: {total} Accounts</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-fuchsia-400" />
            <span>Avg Match: {avgSimilarity}%</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Peak Confidence: {highestConfidence}%</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-300">
            <CheckCircle className="h-3.5 w-3.5 text-violet-400" />
            <span>Status: Complete</span>
          </div>
        </div>
      </div>

      {/* Grid of Competitors */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {competitors.map((comp, index) => (
          <CompetitorCard
            key={comp.id}
            competitor={comp}
            rank={index + 1}
            onSelect={onSelectCompetitor}
          />
        ))}
      </div>
    </div>
  );
}
