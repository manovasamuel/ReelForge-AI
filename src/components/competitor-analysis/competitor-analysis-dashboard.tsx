"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { CompetitorProfileAnalysis } from "@/types/competitor-analysis";
import {
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Heart,
  MessageCircle,
  Film,
  Layers,
  FileText,
  BrainCircuit,
  Compass,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitorAnalysisDashboardProps {
  analysis: CompetitorProfileAnalysis;
}

export function CompetitorAnalysisDashboard({ analysis }: CompetitorAnalysisDashboardProps) {
  const {
    businessSummary,
    accountOverview,
    performanceMetrics,
    brandPosition,
    contentPillars,
    captionAnalysis,
    audiencePsychology,
    strengths,
    weaknesses,
    recommendations,
    overallIntelligenceScore,
  } = analysis;

  const formattedFollowers =
    accountOverview.followers >= 1_000_000
      ? `${(accountOverview.followers / 1_000_000).toFixed(1)}M`
      : accountOverview.followers >= 1000
      ? `${(accountOverview.followers / 1000).toFixed(1)}K`
      : accountOverview.followers.toLocaleString();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. BUSINESS SUMMARY (Additional Requirement 1) */}
      <Card className="border-violet-500/40 bg-gradient-to-br from-violet-950/30 via-card/90 to-card/90 p-6 shadow-xl shadow-violet-950/20 backdrop-blur-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
              <Compass className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Business Summary Blueprint
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Industry</p>
              <p className="mt-1 text-sm font-bold text-foreground">{businessSummary.industry}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Market Position</p>
              <p className="mt-1 text-sm font-bold text-violet-300">{businessSummary.marketPosition}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Primary Audience</p>
              <p className="mt-1 text-sm font-bold text-foreground">{businessSummary.primaryAudience}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Core Differentiator</p>
              <p className="mt-1 text-xs font-semibold text-foreground leading-tight">{businessSummary.coreDifferentiator}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Content Maturity</p>
              <p className="mt-1 text-sm font-bold text-fuchsia-300">{businessSummary.contentMaturity}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. ACCOUNT OVERVIEW */}
      <Card className="border-border/60 bg-card/80 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-violet-500/40">
              <Image
                src={accountOverview.profilePictureUrl}
                alt={accountOverview.username}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">@{accountOverview.username}</h3>
                {accountOverview.verifiedStatus && (
                  <Badge className="bg-violet-600 text-[10px] text-white">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{accountOverview.displayName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Followers</p>
              <p className="text-lg font-bold text-foreground">{formattedFollowers}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Following</p>
              <p className="text-lg font-bold text-foreground">{accountOverview.following.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Posts</p>
              <p className="text-lg font-bold text-foreground">{accountOverview.totalPosts.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Account Age</p>
              <p className="text-lg font-bold text-violet-300">{accountOverview.estimatedAccountAge}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. PERFORMANCE METRICS */}
      <div>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <TrendingUp className="h-4 w-4 text-violet-400" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Est. Engagement Rate</p>
            <p className="mt-1 text-2xl font-black text-violet-400">{performanceMetrics.estimatedEngagementRate}%</p>
          </Card>
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Avg Likes</p>
            <p className="mt-1 flex items-center gap-1.5 text-xl font-bold text-foreground">
              <Heart className="h-4 w-4 text-rose-400" />
              {performanceMetrics.avgLikes.toLocaleString()}
            </p>
          </Card>
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Avg Comments</p>
            <p className="mt-1 flex items-center gap-1.5 text-xl font-bold text-foreground">
              <MessageCircle className="h-4 w-4 text-sky-400" />
              {performanceMetrics.avgComments.toLocaleString()}
            </p>
          </Card>
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Monthly Growth</p>
            <p className="mt-1 text-xl font-bold text-emerald-400">{performanceMetrics.estimatedMonthlyGrowth}</p>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Posting Frequency</p>
            <p className="mt-1 text-base font-bold text-foreground">{performanceMetrics.postingFrequency}</p>
          </Card>
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Reels Volume</p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={performanceMetrics.reelPercentage} className="h-2 flex-1" />
              <span className="text-sm font-bold">{performanceMetrics.reelPercentage}%</span>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Carousels Volume</p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={performanceMetrics.carouselPercentage} className="h-2 flex-1" />
              <span className="text-sm font-bold">{performanceMetrics.carouselPercentage}%</span>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/70 p-4">
            <p className="text-xs font-medium text-muted-foreground">Images Volume</p>
            <div className="mt-2 flex items-center gap-2">
              <Progress value={performanceMetrics.imagePercentage} className="h-2 flex-1" />
              <span className="text-sm font-bold">{performanceMetrics.imagePercentage}%</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. BRAND POSITION */}
      <Card className="border-border/60 bg-card/80 p-6 backdrop-blur-md">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <Award className="h-4 w-4 text-fuchsia-400" />
          Brand Positioning Matrix
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Industry & Brand Type</span>
            <p className="text-sm font-bold text-foreground">{brandPosition.industry}</p>
            <Badge variant="outline" className="border-violet-500/30 text-[11px] text-violet-300">
              {brandPosition.brandType}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Target Audience & Age</span>
            <p className="text-sm font-bold text-foreground">{brandPosition.targetAudience}</p>
            <p className="text-xs text-muted-foreground">{brandPosition.audienceAge}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Brand Tone & Style</span>
            <p className="text-sm font-bold text-foreground">{brandPosition.brandTone}</p>
            <p className="text-xs text-muted-foreground leading-tight">{brandPosition.contentStyle}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Price & Market Position</span>
            <p className="text-sm font-bold text-foreground">{brandPosition.pricePosition}</p>
            <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
              {brandPosition.marketPosition}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 5. CONTENT PILLARS */}
      <div>
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <Layers className="h-4 w-4 text-violet-400" />
          Primary Content Pillars
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contentPillars.map((pillar, idx) => (
            <Card key={idx} className="border-border/50 bg-card/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{pillar.name}</span>
                <Badge className="bg-violet-500/15 text-violet-300 font-bold">{pillar.estimatedPercentage}%</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Confidence Score</span>
                  <span>{pillar.confidenceScore}%</span>
                </div>
                <Progress value={pillar.confidenceScore} className="h-1.5" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 6. CAPTION ANALYSIS */}
      <Card className="border-border/60 bg-card/80 p-6 backdrop-blur-md">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <FileText className="h-4 w-4 text-sky-400" />
          Caption Strategy & Copywriting
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Avg Caption Length</p>
            <p className="mt-1 text-sm font-bold text-foreground">{captionAnalysis.averageCaptionLength}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Emoji Usage</p>
            <p className="mt-1 text-sm font-bold text-foreground">{captionAnalysis.emojiUsage}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">CTA Frequency</p>
            <p className="mt-1 text-sm font-bold text-violet-300">{captionAnalysis.ctaFrequency}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Hashtag Density</p>
            <p className="mt-1 text-sm font-bold text-foreground">{captionAnalysis.hashtagUsage}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Writing Style</p>
            <p className="mt-1 text-sm font-bold text-foreground">{captionAnalysis.writingStyle}</p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Storytelling Arc</p>
            <p className="mt-1 text-sm font-bold text-fuchsia-300">{captionAnalysis.storytellingLevel}</p>
          </div>
        </div>
      </Card>

      {/* 7. AUDIENCE PSYCHOLOGY */}
      <Card className="border-border/60 bg-card/80 p-6 backdrop-blur-md">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
          <BrainCircuit className="h-4 w-4 text-fuchsia-400" />
          Audience Psychology & Drivers
        </h4>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Primary Motivation</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{audiencePsychology.primaryMotivation}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Buying Intent</p>
              <p className="text-sm font-bold text-violet-300 mt-0.5">{audiencePsychology.buyingIntent}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Emotional Triggers</p>
              <div className="flex flex-wrap gap-1.5">
                {audiencePsychology.emotionalTriggers.map((t, i) => (
                  <span key={i} className="rounded-md bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200 border border-violet-500/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Decision Drivers & Proof</p>
              <div className="flex flex-wrap gap-1.5">
                {audiencePsychology.decisionDrivers.map((d, i) => (
                  <span key={i} className="rounded-md bg-fuchsia-500/10 px-2.5 py-1 text-xs text-fuchsia-200 border border-fuchsia-500/20">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Pain Points Addressed</p>
              <div className="flex flex-wrap gap-1.5">
                {audiencePsychology.painPoints.map((p, i) => (
                  <span key={i} className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 8 & 9. STRENGTHS AND WEAKNESSES */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-emerald-500/30 bg-emerald-950/10 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wide">
            <CheckCircle2 className="h-4 w-4" />
            Competitive Strengths
          </h4>
          <ul className="space-y-2.5">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-medium text-emerald-200/90 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-amber-500/30 bg-amber-950/10 p-6">
          <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-amber-400 uppercase tracking-wide">
            <AlertTriangle className="h-4 w-4" />
            Competitive Weaknesses & Blind Spots
          </h4>
          <ul className="space-y-2.5">
            {weaknesses.map((wk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-medium text-amber-200/90 leading-relaxed">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>{wk}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 10. RECOMMENDATIONS (Additional Requirement 2) */}
      <Card className="border-violet-500/30 bg-gradient-to-r from-violet-950/20 via-card/80 to-card/80 p-6">
        <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-violet-300 uppercase tracking-wide">
          <Lightbulb className="h-4 w-4 text-amber-400 animate-pulse" />
          Strategic Recommendations & Action Plan
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-card/60 p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-300 font-bold text-xs">
                {idx + 1}
              </div>
              <span className="text-xs font-semibold text-foreground leading-snug">{rec}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 11. OVERALL INTELLIGENCE SCORE */}
      <Card className="overflow-hidden border-violet-500/50 bg-gradient-to-br from-violet-950/40 via-card to-card p-8 shadow-2xl shadow-violet-950/30">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/40">
              Composite Benchmark
            </Badge>
            <h3 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Overall Intelligence Score
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Synthesized rating aggregating brand maturity, content consistency, engagement quality, and audience retention strength.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-violet-500/60 bg-violet-950/50 shadow-inner">
              <span className="text-3xl font-black text-white">{overallIntelligenceScore.overallScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Score</span>
            </div>
          </div>
        </div>

        <Separator className="my-6 opacity-30" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Brand Maturity</span>
            <div className="flex items-center gap-2">
              <Progress value={overallIntelligenceScore.brandMaturity} className="h-1.5 flex-1" />
              <span className="text-xs font-bold">{overallIntelligenceScore.brandMaturity}%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Growth Potential</span>
            <div className="flex items-center gap-2">
              <Progress value={overallIntelligenceScore.growthPotential} className="h-1.5 flex-1" />
              <span className="text-xs font-bold">{overallIntelligenceScore.growthPotential}%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Content Quality</span>
            <div className="flex items-center gap-2">
              <Progress value={overallIntelligenceScore.contentQuality} className="h-1.5 flex-1" />
              <span className="text-xs font-bold">{overallIntelligenceScore.contentQuality}%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Consistency</span>
            <div className="flex items-center gap-2">
              <Progress value={overallIntelligenceScore.consistency} className="h-1.5 flex-1" />
              <span className="text-xs font-bold">{overallIntelligenceScore.consistency}%</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">AI Confidence</span>
            <div className="flex items-center gap-2">
              <Progress value={overallIntelligenceScore.confidence} className="h-1.5 flex-1" />
              <span className="text-xs font-bold text-violet-400">{overallIntelligenceScore.confidence}%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
