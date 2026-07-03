"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { ContentIntelligenceReport } from "@/types/content-intelligence";
import {
  Sparkles,
  Zap,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Repeat,
  Lightbulb,
  Film,
  Camera,
  Calendar,
} from "lucide-react";

interface IntelligenceReportCardProps {
  report: ContentIntelligenceReport;
  index: number;
}

export function IntelligenceReportCard({ report, index }: IntelligenceReportCardProps) {
  const {
    hook,
    captionIntelligence,
    visual,
    engagement,
    psychology,
    virality,
    winningFactors,
    failureFactors,
    reusability,
    whyItWorked,
  } = report;

  const formattedDate = new Date(report.publishDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();

  return (
    <Card className="overflow-hidden border-violet-500/40 bg-gradient-to-br from-card via-card/95 to-violet-950/10 shadow-2xl backdrop-blur-xl">
      {/* Top Banner Row */}
      <div className="flex flex-col gap-4 border-b border-border/60 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white font-black text-sm shadow-md">
            #{index + 1}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
              <Image src={report.thumbnailUrl} alt={report.caption.slice(0, 30)} fill sizes="60px" className="object-cover" unoptimized />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30 capitalize text-[10px]">
                  {report.type}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>
              <p className="mt-1 line-clamp-1 max-w-md text-xs font-medium text-foreground">{report.caption}</p>
            </div>
          </div>
        </div>

        {/* Virality & Reusability Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-3.5 py-2">
            <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />
            <div>
              <p className="text-[10px] uppercase font-bold text-violet-300">Virality Score</p>
              <p className="text-base font-black text-white leading-none">{virality.viralityScore} / 100</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-3.5 py-2">
            <Repeat className="h-4 w-4 text-fuchsia-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-fuchsia-300">Reusability Score</p>
              <p className="text-base font-black text-white leading-none">{reusability.score} / 100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-3">
        {/* Column 1: Hook & Visual Intelligence */}
        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border/50 bg-card/60 p-4.5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-400">
              <Zap className="h-4 w-4" />
              Hook Teardown
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Hook Type:</span>
                <p className="font-bold text-foreground mt-0.5">{hook.hookType}</p>
              </div>
              <div>
                <div className="flex justify-between text-muted-foreground mb-1">
                  <span>Hook Retention Strength</span>
                  <span className="font-bold text-violet-300">{hook.hookStrength}%</span>
                </div>
                <Progress value={hook.hookStrength} className="h-1.5" />
              </div>
              <div>
                <span className="text-muted-foreground">Pattern Interrupt:</span>
                <p className="font-medium text-foreground mt-0.5 leading-snug">{hook.patternInterrupt}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-2.5">
                <span className="text-[10px] font-bold text-violet-300 uppercase">First 3 Seconds Anatomy:</span>
                <p className="mt-1 text-xs text-foreground/90 leading-relaxed">{hook.first3Seconds}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/50 bg-card/60 p-4.5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Camera className="h-4 w-4" />
              Visual & Editing Architecture
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div>
                <span className="text-muted-foreground">Editing Pace:</span>
                <p className="font-bold text-foreground mt-0.5">{visual.editingPace}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Camera Style:</span>
                <p className="font-medium text-foreground mt-0.5">{visual.cameraStyle}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Text Overlay:</span>
                <p className="font-medium text-foreground mt-0.5">{visual.textOverlay}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Color Grading:</span>
                <p className="font-medium text-foreground mt-0.5">{visual.colorStyle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Caption & Psychology Metrics */}
        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border/50 bg-card/60 p-4.5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-400">
              <FileText className="h-4 w-4" />
              Caption & Copywriting Mechanics
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Length:</span>
                  <p className="font-semibold text-foreground">{captionIntelligence.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Emojis:</span>
                  <p className="font-semibold text-foreground">{captionIntelligence.emojiUsage}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Call To Action (CTA):</span>
                <p className="font-bold text-violet-300 mt-0.5">{captionIntelligence.cta}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Storytelling Arc:</span>
                <p className="font-medium text-foreground mt-0.5">{captionIntelligence.storytelling}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Readability Level:</span>
                <p className="font-medium text-foreground mt-0.5">{captionIntelligence.readability}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/50 bg-card/60 p-4.5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <BrainCircuit className="h-4 w-4" />
              Psychological Drivers Radar
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Curiosity</span>
                  <span className="font-bold">{psychology.curiosity}%</span>
                </div>
                <Progress value={psychology.curiosity} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Emotion</span>
                  <span className="font-bold">{psychology.emotion}%</span>
                </div>
                <Progress value={psychology.emotion} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Authority</span>
                  <span className="font-bold">{psychology.authority}%</span>
                </div>
                <Progress value={psychology.authority} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Social Proof</span>
                  <span className="font-bold">{psychology.socialProof}%</span>
                </div>
                <Progress value={psychology.socialProof} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Scarcity</span>
                  <span className="font-bold">{psychology.scarcity}%</span>
                </div>
                <Progress value={psychology.scarcity} className="h-1" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Relatability</span>
                  <span className="font-bold text-violet-400">{psychology.relatability}%</span>
                </div>
                <Progress value={psychology.relatability} className="h-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Engagement, Winning/Failure Factors & Reusability */}
        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border/50 bg-card/60 p-4.5">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Eye className="h-4 w-4" />
              Engagement Conversion Efficiency
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-muted/30 p-2">
                <span className="text-[10px] text-muted-foreground">Views</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{formatNum(engagement.views)}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <span className="text-[10px] text-muted-foreground">Likes</span>
                <p className="text-sm font-bold text-rose-400 mt-0.5">{formatNum(engagement.likes)}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                <span className="text-[10px] text-muted-foreground">Comments</span>
                <p className="text-sm font-bold text-sky-400 mt-0.5">{formatNum(engagement.comments)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-emerald-300">
                  <Bookmark className="h-3.5 w-3.5" />
                  Save Rate
                </span>
                <span className="font-bold text-white">{engagement.estimatedSaveRate}%</span>
              </div>
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-violet-300">
                  <Share2 className="h-3.5 w-3.5" />
                  Share Rate
                </span>
                <span className="font-bold text-white">{engagement.estimatedShareRate}%</span>
              </div>
            </div>
          </div>

          {/* Reusability Benchmark (Additional Requirement 3) */}
          <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-fuchsia-300">Reusability Assessment</span>
              <Badge className="bg-fuchsia-600 text-white font-bold">{reusability.score}% Match</Badge>
            </div>
            <p className="font-semibold text-white">{reusability.reusabilityLevel}</p>
            <p className="text-[11px] text-fuchsia-200/80">
              Confidence: <span className="font-bold">{reusability.confidence}%</span>. Script Generator will map this hook structure directly into Phase 7 briefs.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Winning Factors, Failure Factors & Why It Worked */}
      <div className="grid grid-cols-1 gap-6 border-t border-border/60 bg-muted/20 p-6 md:grid-cols-3">
        {/* Winning Factors (Additional Requirement 1) */}
        <div className="space-y-2.5">
          <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Winning Performance Factors
          </h5>
          <ul className="space-y-1.5">
            {winningFactors.map((wf, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-emerald-200/90 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{wf}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Failure Factors (Additional Requirement 2) */}
        <div className="space-y-2.5">
          <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            Failure & Blind Spot Factors
          </h5>
          <ul className="space-y-1.5">
            {failureFactors.map((ff, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-amber-200/90 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{ff}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why It Worked */}
        <div className="space-y-2.5">
          <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-violet-300">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Why It Worked (Core Insight)
          </h5>
          <ul className="space-y-1.5">
            {whyItWorked.map((wiw, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                <span>{wiw}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
