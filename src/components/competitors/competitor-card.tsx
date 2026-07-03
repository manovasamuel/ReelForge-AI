"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Competitor } from "@/types/competitor";
import { Users, CheckCircle2, Sparkles, Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/toast";

interface CompetitorCardProps {
  competitor: Competitor;
  rank: number;
  onSelect?: (username: string, selected: boolean) => void;
  onAnalyze?: (competitor: Competitor) => void;
}

export function CompetitorCard({ competitor, rank, onSelect, onAnalyze }: CompetitorCardProps) {
  const [selected, setSelected] = useState(false);

  function handleCardClick() {
    const nextState = !selected;
    setSelected(nextState);
    onSelect?.(competitor.username, nextState);
  }

  function handleAnalyzeClick(e: React.MouseEvent) {
    e.stopPropagation();
    onAnalyze?.(competitor);
  }

  const formattedFollowers =
    competitor.followers >= 1_000_000
      ? `${(competitor.followers / 1_000_000).toFixed(1)}M`
      : competitor.followers >= 1000
      ? `${(competitor.followers / 1000).toFixed(1)}K`
      : competitor.followers.toLocaleString();

  return (
    <Card
      onClick={handleCardClick}
      role="article"
      aria-label={`Competitor #${rank}: @${competitor.username}`}
      className={cn(
        "group relative flex flex-col justify-between cursor-pointer overflow-hidden transition-all duration-200",
        "border bg-card/80 backdrop-blur-md hover:shadow-xl",
        selected
          ? "border-violet-500/80 bg-violet-950/20 ring-1 ring-violet-500/50 shadow-violet-950/30"
          : "border-border/60 hover:border-violet-500/40"
      )}
    >
      {/* Selection check indicator */}
      <div className="absolute right-3.5 top-3.5 z-10">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200",
            selected
              ? "border-violet-500 bg-violet-600 text-white shadow-md shadow-violet-500/30"
              : "border-border/80 bg-muted/40 text-transparent group-hover:border-violet-500/40"
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
        </div>
      </div>

      <CardContent className="flex flex-col flex-1 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Avatar & Rank badge */}
          <div className="relative shrink-0">
            <div className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-violet-500/30 ring-offset-2 ring-offset-card">
              <Image
                src={competitor.profilePictureUrl}
                alt={competitor.username}
                width={56}
                height={56}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>
            <span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-card">
              #{rank}
            </span>
          </div>

          {/* Core Info */}
          <div className="flex flex-1 flex-col gap-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold text-foreground group-hover:text-violet-300 transition-colors">
                @{competitor.username}
              </h4>
              <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300">
                {competitor.similarityScore}% Match
              </Badge>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {competitor.displayName}
            </p>

            {/* Badges row */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Layers className="h-3 w-3 text-violet-400" />
                {competitor.industry}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Users className="h-3 w-3 text-fuchsia-400" />
                {formattedFollowers} Followers
              </span>
            </div>

            {/* Reason match */}
            <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-2.5">
              <p className="text-xs leading-relaxed text-muted-foreground/90">
                <span className="font-semibold text-violet-300">Why: </span>
                {competitor.reasonMatch}
              </p>
            </div>

            {/* Confidence Score bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-violet-400" />
                Confidence:
                <span className="font-bold text-foreground">{competitor.confidenceScore}%</span>
              </div>
              <Progress value={competitor.confidenceScore} className="h-1.5 flex-1 bg-muted" />
            </div>
          </div>
        </div>

        {/* Primary CTA (Improvement 3) */}
        <div className="mt-5 pt-3 border-t border-border/30">
          <Button
            type="button"
            onClick={handleAnalyzeClick}
            className={cn(
              "w-full h-10 gap-2 text-xs font-semibold text-white",
              "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600",
              "shadow-md shadow-violet-500/20 transition-all duration-200",
              "hover:shadow-violet-500/40 hover:brightness-110 active:scale-[0.99]"
            )}
          >
            <span>Analyze Competitor</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
