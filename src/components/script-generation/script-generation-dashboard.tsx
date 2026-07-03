"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { showToast } from "@/components/ui/toast";
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Film,
  Camera,
  Mic,
  Tv,
  FileText,
  Clock,
  Award,
  Download,
  Share2,
  ArrowRight,
  Eye,
  Video,
  Flame,
  Wrench,
  AlertCircle,
} from "lucide-react";
import type { ReelContentPackage } from "@/types/script-generation";

interface ScriptGenerationDashboardProps {
  pkg: ReelContentPackage;
  onProceedToRepurpose?: () => void;
}

export function ScriptGenerationDashboard({ pkg, onProceedToRepurpose }: ScriptGenerationDashboardProps) {
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [checklistState, setChecklistState] = useState(pkg.checklist);

  function copyToClipboard(text: string, setter: (val: boolean) => void) {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  function handleCopyScript() {
    const text = `HOOK:\n${pkg.hook.firstSentence}\n\nSCENES:\n` +
      pkg.scenes.map((s) => `[Scene ${s.sceneNumber} (${s.duration}) - ${s.title}]\nVO: "${s.voiceover}"\nVisual: ${s.visual}\nText: ${s.textOverlay}`).join("\n\n");
    copyToClipboard(text, setCopiedScript);
  }

  function handleCopyCaption() {
    copyToClipboard(pkg.caption.fullCaption, setCopiedCaption);
  }

  function handleCopyHashtags() {
    copyToClipboard(pkg.hashtags.allTagsString, setCopiedHashtags);
  }

  function handleCopyAll() {
    const text = `=== REEL CONTENT PACKAGE: ${pkg.reelIdea.title} ===\n\n` +
      `STRATEGY: ${pkg.strategy.contentGoal}\n` +
      `HOOK: ${pkg.hook.firstSentence}\n\n` +
      `SCENES:\n` + pkg.scenes.map((s) => `${s.sceneNumber}. "${s.voiceover}" (${s.duration})`).join("\n") +
      `\n\nCAPTION:\n${pkg.caption.fullCaption}\n\nCTA: ${pkg.cta.primaryCTA}`;
    copyToClipboard(text, setCopiedAll);
  }

  function handleProceed() {
    if (onProceedToRepurpose) {
      onProceedToRepurpose();
      return;
    }
    showToast(
      "Repurpose Engine Active",
      "Multi-Platform Repurpose Engine adapts this reel package across platforms."
    );
  }

  function toggleChecklist(key: keyof typeof checklistState) {
    setChecklistState((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ─── 1. STRATEGY BANNER & PRODUCTION SCORE (Additional Req 4) ─── */}
      <Card className="overflow-hidden border-violet-500/40 bg-gradient-to-br from-violet-950/60 via-card/95 to-fuchsia-950/40 shadow-2xl shadow-violet-950/40 backdrop-blur-md">
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500" />
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-600 hover:bg-violet-600 text-white gap-1 px-2.5 py-0.5">
                  <Sparkles className="h-3.5 w-3.5" /> Phase 8 Master Production Package
                </Badge>
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 bg-amber-500/10">
                  Confidence: {pkg.productionScore.confidence}%
                </Badge>
              </div>
              <CardTitle className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
                {pkg.reelIdea.title}
              </CardTitle>
              <CardDescription className="text-violet-300/80 text-sm mt-1">
                {pkg.reelIdea.summary}
              </CardDescription>
            </div>

            {/* Production Score Badge */}
            <div className="flex items-center gap-3 bg-card/80 border border-violet-500/40 rounded-2xl p-4 shadow-lg shrink-0">
              <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-violet-600 to-amber-600 text-white shadow-md">
                <span className="text-2xl font-black">{pkg.productionScore.overallScore}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider opacity-90">Score</span>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-violet-400">Production Rating</div>
                <div className="text-sm font-semibold text-white mt-0.5">{pkg.productionScore.difficulty} Difficulty</div>
                <div className="text-xs text-amber-300 font-medium mt-0.5">
                  {pkg.productionScore.estimatedPerformance}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Separator className="bg-violet-500/20 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-2.5 col-span-2">
              <span className="text-violet-300 font-semibold block uppercase text-[10px]">Content Goal</span>
              <span className="font-bold text-white truncate block mt-0.5">{pkg.strategy.contentGoal}</span>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-2.5 col-span-2">
              <span className="text-violet-300 font-semibold block uppercase text-[10px]">Target Audience</span>
              <span className="font-bold text-white truncate block mt-0.5">{pkg.strategy.targetAudience}</span>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-2.5 col-span-2">
              <span className="text-violet-300 font-semibold block uppercase text-[10px]">Content Pillar</span>
              <span className="font-bold text-white truncate block mt-0.5">{pkg.strategy.contentPillar}</span>
            </div>
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/20 p-2.5 col-span-2">
              <span className="text-violet-300 font-semibold block uppercase text-[10px]">Primary Emotion</span>
              <span className="font-bold text-white truncate block mt-0.5">{pkg.strategy.emotion}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── 2. EXPORT PANEL & TELEPROMPTER TOGGLE (Additional Req 1 & 2) ─── */}
      <Card className="border-violet-500/30 bg-card/90 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-violet-300 mr-2 uppercase tracking-wider">Export Tools:</span>
              <Button size="sm" variant="outline" onClick={handleCopyScript} className="border-violet-500/30 gap-1.5 text-xs">
                {copiedScript ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedScript ? "Script Copied!" : "Copy Script"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyCaption} className="border-violet-500/30 gap-1.5 text-xs">
                {copiedCaption ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCaption ? "Caption Copied!" : "Copy Caption"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyHashtags} className="border-violet-500/30 gap-1.5 text-xs">
                {copiedHashtags ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedHashtags ? "Hashtags Copied!" : "Copy Hashtags"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyAll} className="border-violet-500/40 bg-violet-500/10 text-violet-200 gap-1.5 text-xs">
                {copiedAll ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedAll ? "Package Copied!" : "Copy Complete Package"}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setTeleprompterOpen(!teleprompterOpen)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold gap-1.5 text-xs"
              >
                <Tv className="h-3.5 w-3.5" /> {teleprompterOpen ? "Exit Teleprompter View" : "Launch Teleprompter Mode"}
              </Button>
              <Button size="sm" variant="outline" disabled className="opacity-50 cursor-not-allowed border-dashed text-xs">
                Export PDF (Coming Soon)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DISTRACTION-FREE TELEPROMPTER VIEW (Additional Req 2) */}
      {teleprompterOpen && (
        <Card className="border-amber-500/60 bg-black text-white p-8 shadow-2xl border-2">
          <div className="flex items-center justify-between mb-6 border-b border-white/20 pb-4">
            <div className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-black uppercase tracking-wider text-amber-400">Distraction-Free Teleprompter Reader</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setTeleprompterOpen(false)} className="text-xs text-white/70 hover:text-white">
              Close View ✕
            </Button>
          </div>
          <div className="space-y-6 font-mono text-lg md:text-xl leading-relaxed max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">OPENING HOOK (0:00 - 0:03)</div>
              <p className="font-extrabold text-white text-2xl">{pkg.hook.voiceover}</p>
            </div>
            {pkg.scenes.map((scene) => (
              <div key={scene.sceneNumber} className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-700">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  SCENE {scene.sceneNumber}: {scene.title} ({scene.duration})
                </div>
                <p className="font-semibold text-white">{scene.voiceover}</p>
                <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-amber-300/80">
                  ON SCREEN: [{scene.textOverlay}]
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── 3. PRODUCTION SUMMARY & REEL IDEA (Additional Req 3) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-violet-500/30 bg-card/90 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-violet-200">
              <Camera className="h-4 w-4 text-amber-400" /> Production Studio Summary
            </CardTitle>
            <CardDescription className="text-xs">Estimated filming specs & gear list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-background/60 border border-border/60">
              <span className="text-muted-foreground font-medium">Est. Filming Time:</span>
              <span className="font-bold text-foreground">{pkg.productionSummary.estimatedShootTime}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-background/60 border border-border/60">
              <span className="text-muted-foreground font-medium">Reel Duration:</span>
              <span className="font-bold text-violet-300">{pkg.productionSummary.estimatedReelDuration}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-lg bg-background/60 border border-border/60">
              <span className="text-muted-foreground font-medium">B-Roll Cut Count:</span>
              <span className="font-bold text-foreground">{pkg.productionSummary.bRollCount} clips</span>
            </div>
            <div className="p-2.5 rounded-lg bg-background/60 border border-border/60 space-y-1">
              <span className="text-muted-foreground font-medium block">Equipment Checklist:</span>
              <ul className="list-disc list-inside space-y-0.5 text-foreground font-medium pl-1">
                {pkg.productionSummary.equipmentNeeded.map((eq, idx) => (
                  <li key={idx}>{eq}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-violet-500/30 bg-card/90 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <Badge className="w-fit bg-violet-600 text-white mb-1">Reel Concept & Hook Mechanics</Badge>
            <CardTitle className="text-lg font-bold text-foreground">
              Unique Angle: {pkg.reelIdea.uniqueAngle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/30 space-y-2">
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider block">First 3-Seconds Hook Anatomy:</span>
              <p className="text-base font-extrabold text-white">"{pkg.hook.firstSentence}"</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 text-violet-200/90 border-t border-violet-500/20">
                <div><strong>Visual:</strong> {pkg.hook.openingVisual}</div>
                <div><strong>Overlay:</strong> <span className="text-amber-300 font-mono">{pkg.hook.textOverlay}</span></div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <strong>Expected Outcome:</strong> {pkg.reelIdea.expectedOutcome}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 4. SCENE-BY-SCENE PRODUCTION SCRIPT ─── */}
      <Card className="border-violet-500/30 bg-card/90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Film className="h-5 w-5 text-violet-400" /> Scene-by-Scene Studio Shooting Script
          </CardTitle>
          <CardDescription>Expand each scene for exact visual storyboarding, teleprompter voiceover, and kinetic overlay direction.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="scene-1" className="space-y-3">
            {pkg.scenes.map((scene) => (
              <AccordionItem key={scene.sceneNumber} value={`scene-${scene.sceneNumber}`} className="border border-border/80 rounded-xl px-4 bg-background/50">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-600 text-white font-bold text-xs shrink-0">
                      #{scene.sceneNumber}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-foreground block">{scene.title}</span>
                      <span className="text-xs text-violet-400 font-mono">{scene.duration} • {scene.transition}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2 space-y-4 border-t border-border/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-card/80 border border-border/60 space-y-1">
                      <span className="text-violet-400 font-bold uppercase tracking-wider block">Teleprompter Voiceover:</span>
                      <p className="text-sm font-semibold text-foreground leading-relaxed">"{scene.voiceover}"</p>
                    </div>
                    <div className="p-3 rounded-lg bg-card/80 border border-border/60 space-y-1">
                      <span className="text-amber-400 font-bold uppercase tracking-wider block">Kinetic Text Overlay:</span>
                      <p className="text-sm font-mono font-bold text-amber-200">{scene.textOverlay}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground p-3 rounded-lg bg-violet-950/20 border border-violet-500/20">
                    <div><strong className="text-foreground">Visual Directives:</strong> {scene.visual}</div>
                    <div><strong className="text-foreground">Camera Specs:</strong> {scene.camera}</div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* ─── 5. FULL CAPTION & CTA VARIANTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-violet-500/30 bg-card/90 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-400" /> Full Instagram Caption Copy
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={handleCopyCaption} className="text-xs h-7 px-2 text-violet-300">
                {copiedCaption ? "Copied!" : "Copy Copy"}
              </Button>
            </div>
            <CardDescription className="text-xs">Structured PAS format designed for maximum retention & save velocity.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-xl bg-background/80 border border-border/80 text-xs text-foreground font-sans whitespace-pre-wrap leading-relaxed max-h-[320px] overflow-y-auto">
              {pkg.caption.fullCaption}
            </pre>
          </CardContent>
        </Card>

        <Card className="border-violet-500/30 bg-card/90 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-400" /> High-Converting CTA Variants
            </CardTitle>
            <CardDescription className="text-xs">Copy tailored conversion prompts for caption and comments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-950/30 space-y-1">
              <span className="text-violet-300 font-bold uppercase tracking-wider block">Primary Lead Magnet CTA:</span>
              <p className="font-semibold text-foreground text-sm">{pkg.cta.primaryCTA}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
              <span className="text-muted-foreground font-bold uppercase tracking-wider block">Alternative Save/Bookmark CTA:</span>
              <p className="font-medium text-foreground">{pkg.cta.alternativeCTA}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-1">
              <span className="text-amber-400 font-bold uppercase tracking-wider block">First Pinned Comment Prompt:</span>
              <p className="font-medium text-amber-100">{pkg.cta.pinnedComment}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 6. HASHTAGS & POSTING RECOMMENDATIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-violet-500/30 bg-card/90 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-foreground">15 Strategically Grouped Hashtags</CardTitle>
              <Button size="sm" variant="ghost" onClick={handleCopyHashtags} className="text-xs h-7 px-2 text-violet-300">
                {copiedHashtags ? "Copied!" : "Copy All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pkg.hashtags.groups.map((grp, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">{grp.category} (5 tags):</span>
                <div className="flex flex-wrap gap-1.5">
                  {grp.tags.map((t, i) => (
                    <Badge key={i} variant="outline" className="bg-violet-500/10 text-violet-200 border-violet-500/30 text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-violet-500/30 bg-card/90 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" /> Posting Timing & Cover Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-xl border border-border/60 bg-background/50">
              <span className="text-muted-foreground font-semibold block uppercase text-[10px]">Optimal Publish Window</span>
              <span className="text-sm font-bold text-foreground mt-0.5 block">{pkg.postingRecommendation.bestTime}</span>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-background/50">
              <span className="text-muted-foreground font-semibold block uppercase text-[10px]">Reel Grid Cover Directive</span>
              <p className="font-medium text-foreground mt-0.5 leading-relaxed">{pkg.postingRecommendation.coverStyle}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 7. INTERACTIVE CONTENT CHECKLIST ─── */}
      <Card className="border-violet-500/30 bg-card/90 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" /> Studio Production Readiness Checklist
          </CardTitle>
          <CardDescription className="text-xs">Click items to mark them completed as you film and publish.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: "hookReady", label: "Hook Teleprompter Ready" },
              { key: "captionReady", label: "Caption Copy Verified" },
              { key: "ctaReady", label: "Lead Magnet CTA Active" },
              { key: "hashtagsReady", label: "15 Hashtags Formatted" },
              { key: "coverReady", label: "Grid Cover Image Designed" },
              { key: "postReady", label: "Final Video Exported" },
            ].map((item) => {
              const isChecked = checklistState[item.key as keyof typeof checklistState];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleChecklist(item.key as keyof typeof checklistState)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? "border-green-500/40 bg-green-500/10 text-green-200"
                      : "border-border/60 bg-background/40 text-muted-foreground"
                  }`}
                >
                  <div className={`h-5 w-5 rounded-md flex items-center justify-center border ${isChecked ? "bg-green-600 border-green-500 text-white" : "border-muted-foreground"}`}>
                    {isChecked && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── PRIMARY CTA BUTTON ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-900/40 via-card to-fuchsia-900/40 shadow-2xl">
        <div>
          <h3 className="text-lg font-bold text-white">Instagram Reel Package Compiled</h3>
          <p className="text-sm text-violet-200/80">
            Your 5-scene shooting script and strategy package are finalized. Ready to repurpose for omnichannel distribution?
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleProceed}
          className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold shadow-lg shadow-violet-950/50 gap-2 px-8 py-6 text-base shrink-0"
        >
          Proceed to Repurpose Engine <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
