"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  Target,
  FileText,
  Video,
  Brain,
  Palette,
  Layers,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Copy,
  ArrowRight,
  Flame,
  Award,
  BarChart3,
} from "lucide-react";
import type { ContentDNAReport, SectionConfidence } from "@/types/content-dna";

interface ContentDNADashboardProps {
  report: ContentDNAReport;
  onProceedToScriptGeneration?: () => void;
}

function ConfidenceHeader({ title, meta }: { title: string; meta: SectionConfidence }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-500/20 pb-3 mb-4">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        {title}
      </h3>
      <div className="flex items-center gap-2.5 text-xs bg-violet-950/40 border border-violet-500/30 px-3 py-1.5 rounded-lg shrink-0">
        <span className="text-violet-300 font-medium">Confidence: <strong className="text-violet-100">{meta.confidence}%</strong></span>
        <span className="text-violet-500">•</span>
        <span className="text-violet-300">Sample: <strong className="text-violet-100">{meta.sampleCount} items</strong></span>
        <span className="text-violet-500">•</span>
        <Badge variant="outline" className="bg-violet-500/20 text-violet-200 border-violet-500/40 text-[10px] px-1.5 py-0">
          {meta.reliability}
        </Badge>
      </div>
    </div>
  );
}

export function ContentDNADashboard({
  report,
  onProceedToScriptGeneration,
}: ContentDNADashboardProps) {
  function handleProceed() {
    if (onProceedToScriptGeneration) {
      onProceedToScriptGeneration();
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── 1. EXECUTIVE DNA SNAPSHOT HEADER BANNER ─── */}
      <Card className="overflow-hidden border-violet-500/40 bg-gradient-to-br from-violet-950/60 via-card/95 to-fuchsia-950/40 shadow-2xl shadow-violet-950/40 backdrop-blur-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500" />
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-600 hover:bg-violet-600 text-white gap-1 px-2.5 py-0.5">
                  <Sparkles className="h-3.5 w-3.5" /> Phase 7B Blueprint
                </Badge>
                <Badge variant="outline" className="border-fuchsia-500/40 text-fuchsia-300 bg-fuchsia-500/10">
                  Sample Size: {report.snapshot.sampleSize} Analyzed Items
                </Badge>
              </div>
              <CardTitle className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
                Unified Winning Content DNA Blueprint
              </CardTitle>
              <CardDescription className="text-violet-300/80 text-sm mt-1">
                Deterministic aggregation synthesizing top virality vectors into ONE repeatable studio production standard.
              </CardDescription>
            </div>

            {/* Overall DNA Score Badge */}
            <div className="flex items-center gap-3 bg-card/80 border border-violet-500/40 rounded-2xl p-4 shadow-lg shrink-0">
              <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md">
                <span className="text-2xl font-black">{report.snapshot.overallDNAScore}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider opacity-90">Score</span>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-violet-400">Master Standard</div>
                <div className="text-sm font-semibold text-white mt-0.5">Confidence: {report.dnaScore.confidence}%</div>
                <div className="text-xs text-muted-foreground mt-0.5 max-w-[160px] truncate">
                  {report.dnaScore.topPerformingPattern}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Separator className="bg-violet-500/20 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-3">
              <span className="text-[11px] text-violet-300 uppercase font-semibold block">Avg Virality</span>
              <span className="text-xl font-bold text-white mt-1 block flex items-center gap-1">
                <Flame className="h-4 w-4 text-amber-400" /> {report.snapshot.avgVirality} / 100
              </span>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-3">
              <span className="text-[11px] text-violet-300 uppercase font-semibold block">Avg Reusability</span>
              <span className="text-xl font-bold text-white mt-1 block flex items-center gap-1">
                <Award className="h-4 w-4 text-fuchsia-400" /> {report.snapshot.avgReusability} / 100
              </span>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-3 col-span-2 sm:col-span-1 lg:col-span-1">
              <span className="text-[11px] text-violet-300 uppercase font-semibold block">Dominant Hook</span>
              <span className="text-xs font-bold text-white mt-1 block truncate">
                {report.snapshot.dominantHook}
              </span>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-3">
              <span className="text-[11px] text-violet-300 uppercase font-semibold block">Dominant CTA</span>
              <span className="text-xs font-bold text-white mt-1 block truncate">
                {report.snapshot.dominantCTA}
              </span>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-3 col-span-2 sm:col-span-2 lg:col-span-2">
              <span className="text-[11px] text-violet-300 uppercase font-semibold block">Dominant Psychology</span>
              <span className="text-xs font-bold text-white mt-1 block truncate">
                {report.snapshot.dominantPsychology}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 2. DNA INSIGHTS SECTION ─── */}
      <Card className="border-violet-500/30 bg-card/90 shadow-xl backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-violet-200">
            <Zap className="h-5 w-5 text-amber-400" /> Deterministic DNA Insights
          </CardTitle>
          <CardDescription>Key algorithmic laws derived from cross-referencing your selected item teardowns.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.dnaInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-violet-600/30 text-violet-300 font-bold text-xs shrink-0 mt-0.5">
                  #{idx + 1}
                </div>
                <p className="text-sm text-violet-100 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── 3. WINNING HOOKS LEADERBOARD ─── */}
      <Card className="border-violet-500/30 bg-card/90 shadow-xl">
        <CardContent className="pt-6">
          <ConfidenceHeader title="1. Winning Hook Archetypes Leaderboard" meta={report.winningHooks.confidenceMeta} />
          <div className="space-y-3">
            {report.winningHooks.topHooks.map((hook, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-background/60 hover:border-violet-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-500/20 text-violet-300 font-black text-xs">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-foreground">{hook.hookType}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">Adoption Rate</span>
                    <span className="text-sm font-bold text-violet-300">{hook.frequency}%</span>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <span className="text-[11px] text-muted-foreground block">Avg Virality</span>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold">
                      {hook.avgVirality} / 100
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── 4. WINNING CTA & CAPTION STYLE ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-violet-500/30 bg-card/90 shadow-xl">
          <CardContent className="pt-6">
            <ConfidenceHeader title="2. Winning Call To Action (CTA)" meta={report.winningCTA.confidenceMeta} />
            <div className="space-y-3">
              {report.winningCTA.topCTAs.map((cta, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl border border-border/60 bg-background/50">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{cta.ctaStyle}</span>
                    <span className="text-violet-400">{cta.usagePercentage}%</span>
                  </div>
                  <Progress value={cta.usagePercentage} className="h-2 bg-violet-950/60" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/30 bg-card/90 shadow-xl">
          <CardContent className="pt-6">
            <ConfidenceHeader title="3. Winning Caption Mechanics" meta={report.winningCaptionStyle.confidenceMeta} />
            <dl className="space-y-3 text-sm">
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Optimal Length</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningCaptionStyle.avgLength}</dd>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Emoji & Formatting</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningCaptionStyle.emojiDensity}</dd>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Storytelling Structure</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningCaptionStyle.storytellingStyle}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* ─── 5. WINNING EDITING & VISUAL STYLE ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-violet-500/30 bg-card/90 shadow-xl">
          <CardContent className="pt-6">
            <ConfidenceHeader title="4. Winning Editing Velocity" meta={report.winningEditingStyle.confidenceMeta} />
            <dl className="space-y-3 text-sm">
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Editing Pace & Cut Rate</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningEditingStyle.editingPace}</dd>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Camera Production Style</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningEditingStyle.cameraStyle}</dd>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Kinetic Subtitles & Overlays</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningEditingStyle.textOverlay}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="border-violet-500/30 bg-card/90 shadow-xl">
          <CardContent className="pt-6">
            <ConfidenceHeader title="5. Winning Visual Architecture" meta={report.winningVisualStyle.confidenceMeta} />
            <dl className="space-y-3 text-sm">
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Dominant Color Palette</dt>
                <dd className="flex flex-wrap gap-1.5 mt-1">
                  {report.winningVisualStyle.dominantColors.map((color, idx) => (
                    <Badge key={idx} variant="outline" className="bg-violet-500/10 text-violet-200 border-violet-500/30 text-xs">
                      {color}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Thumbnail & Cover Focus</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningVisualStyle.thumbnailStyle}</dd>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-background/50">
                <dt className="text-xs font-semibold text-violet-400 uppercase">Lighting & Framing</dt>
                <dd className="font-bold text-foreground mt-0.5">{report.winningVisualStyle.lighting} — {report.winningVisualStyle.framing}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* ─── 6. WINNING PSYCHOLOGY RADAR ─── */}
      <Card className="border-violet-500/30 bg-card/90 shadow-xl">
        <CardContent className="pt-6">
          <ConfidenceHeader title="6. Winning Psychological Drivers Radar" meta={report.winningPsychology.confidenceMeta} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Curiosity Gap & Open Loops</span>
                  <span className="text-violet-400">{report.winningPsychology.curiosity}%</span>
                </div>
                <Progress value={report.winningPsychology.curiosity} className="h-2 bg-violet-950/60" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Authority & Expert Proof</span>
                  <span className="text-violet-400">{report.winningPsychology.authority}%</span>
                </div>
                <Progress value={report.winningPsychology.authority} className="h-2 bg-violet-950/60" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Relatability & Empathy</span>
                  <span className="text-violet-400">{report.winningPsychology.relatability}%</span>
                </div>
                <Progress value={report.winningPsychology.relatability} className="h-2 bg-violet-950/60" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Social Proof & Validation</span>
                  <span className="text-violet-400">{report.winningPsychology.socialProof}%</span>
                </div>
                <Progress value={report.winningPsychology.socialProof} className="h-2 bg-violet-950/60" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Scarcity & Urgency</span>
                  <span className="text-violet-400">{report.winningPsychology.scarcity}%</span>
                </div>
                <Progress value={report.winningPsychology.scarcity} className="h-2 bg-violet-950/60" />
              </div>
              <div className="p-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
                <span className="text-xs font-bold text-violet-300 block mb-1">Top Primary Psychological Triggers:</span>
                <ul className="list-disc list-inside text-xs text-violet-100 space-y-1">
                  {report.winningPsychology.topTriggers.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 7. WINNING STRUCTURE & BLUEPRINT EXPORT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-violet-500/30 bg-card/90 shadow-xl">
          <CardContent className="pt-6">
            <ConfidenceHeader title="7. Winning Structural Formula Flow" meta={report.winningStructure.confidenceMeta} />
            <div className="space-y-3">
              {report.winningStructure.steps.map((step) => (
                <div key={step.stepOrder} className="flex items-start gap-3 p-3.5 rounded-xl border border-border/80 bg-background/50">
                  <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-600 text-white font-bold text-xs shrink-0 mt-0.5">
                    {step.stepOrder}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{step.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blueprint Export Read-Only Card (Additional Requirement 3) */}
        <Card className="border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-950/40 via-card/90 to-violet-950/40 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <Badge className="w-fit bg-fuchsia-600 text-white mb-1">Direct Script Input</Badge>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-fuchsia-400" /> Blueprint Export Standard
            </CardTitle>
            <CardDescription className="text-xs text-fuchsia-200/80">
              Read-only structured AST formula ready to be passed into the Phase 8 Script Generator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-fuchsia-500/30 bg-black/60 font-mono text-xs text-fuchsia-200 space-y-2">
              {report.blueprintExport.formulaSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-fuchsia-500 font-bold">{idx + 1}.</span>
                  <span className="font-semibold text-white">{step}</span>
                  {idx < report.blueprintExport.formulaSteps.length - 1 && (
                    <span className="text-fuchsia-400/50 ml-auto">↓</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              {report.blueprintExport.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── 8. AVOID PATTERNS CHECKLIST ─── */}
      <Card className="border-destructive/30 bg-card/90 shadow-xl">
        <CardContent className="pt-6">
          <ConfidenceHeader title="8. Aggregated Friction & Failure Checklist (Avoid Patterns)" meta={report.avoidPatterns.confidenceMeta} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.avoidPatterns.failureChecklist.map((fail, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-xs font-semibold leading-relaxed">{fail}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── PRIMARY CTA BUTTON ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-900/40 via-card to-fuchsia-900/40 shadow-2xl">
        <div>
          <h3 className="text-lg font-bold text-white">Winning Blueprint Synthesized</h3>
          <p className="text-sm text-violet-200/80">
            Your Content DNA master blueprint is verified across 9 structural dimensions. Ready to compile production shooting briefs?
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleProceed}
          className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold shadow-lg shadow-violet-950/50 gap-2 px-8 py-6 text-base shrink-0"
        >
          Generate Script →
        </Button>
      </div>
    </div>
  );
}
