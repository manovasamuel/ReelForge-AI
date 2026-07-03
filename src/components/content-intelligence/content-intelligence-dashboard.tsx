"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { IntelligenceReportCard } from "./intelligence-report-card";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import { Sparkles, BrainCircuit, Bookmark, Repeat, Zap, Layers } from "lucide-react";

interface ContentIntelligenceDashboardProps {
  reports: ContentIntelligenceReport[];
  onProceedToPhase7?: () => void;
}

export function ContentIntelligenceDashboard({ reports, onProceedToPhase7 }: ContentIntelligenceDashboardProps) {
  const stats = useMemo(() => {
    const total = reports.length;
    if (total === 0) return { total: 0, avgVirality: 0, avgReusability: 0, avgSaveRate: 0, dominantHook: "N/A" };

    const avgVirality = Math.round(reports.reduce((acc, r) => acc + r.virality.viralityScore, 0) / total);
    const avgReusability = Math.round(reports.reduce((acc, r) => acc + r.reusability.score, 0) / total);
    const avgSaveRate = Number((reports.reduce((acc, r) => acc + r.engagement.estimatedSaveRate, 0) / total).toFixed(1));

    // Find most frequent hook type
    const hookCounts: Record<string, number> = {};
    reports.forEach((r) => {
      hookCounts[r.hook.hookType] = (hookCounts[r.hook.hookType] || 0) + 1;
    });
    let dominantHook = "Curiosity Gap";
    let maxCount = -1;
    Object.entries(hookCounts).forEach(([hook, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantHook = hook;
      }
    });

    return { total, avgVirality, avgReusability, avgSaveRate, dominantHook };
  }, [reports]);

  function handleProceed() {
    if (onProceedToPhase7) {
      onProceedToPhase7();
      return;
    }
    showToast(
      "Coming in Phase 7",
      `Script Generation & Pattern Extraction using ${reports.length} analyzed items will be available in Phase 7.`
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. AGGREGATE INTELLIGENCE BENCHMARKS */}
      <Card className="border-violet-500/40 bg-gradient-to-br from-violet-950/30 via-card/90 to-card/90 p-6 shadow-xl shadow-violet-950/20 backdrop-blur-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Batch Content Intelligence Teardown
              </h3>
            </div>
            <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {stats.total} Selected Items Evaluated
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Analyzed Batch Size</p>
              <p className="mt-1 text-lg font-bold text-foreground">{stats.total} Media Items</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Avg Virality Score</p>
              <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-violet-400">
                <Sparkles className="h-4 w-4" />
                {stats.avgVirality} / 100
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Avg Reusability Index</p>
              <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-fuchsia-400">
                <Repeat className="h-4 w-4" />
                {stats.avgReusability} / 100
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Est. Batch Save Rate</p>
              <p className="mt-1 flex items-center gap-1.5 text-lg font-bold text-emerald-400">
                <Bookmark className="h-4 w-4" />
                {stats.avgSaveRate}%
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Dominant Hook Pattern</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-violet-300 leading-tight">
                <Zap className="h-3.5 w-3.5 shrink-0" />
                <span>{stats.dominantHook}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. STACK OF INDIVIDUAL INTELLIGENCE REPORTS */}
      <div className="space-y-8">
        {reports.map((rep, idx) => (
          <IntelligenceReportCard key={rep.id} report={rep} index={idx} />
        ))}
      </div>

      {/* 3. PRIMARY CTA TO PROCEED TO PHASE 7 */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={handleProceed}
          className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:opacity-95 text-white font-bold text-sm px-8 py-6 shadow-xl shadow-violet-950/40 rounded-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <span>Proceed to Phase 7 →</span>
        </Button>
      </div>
    </div>
  );
}
