"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Share2,
  Copy,
  Check,
  Globe,
  MessageSquare,
  Users,
  Video,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import type { RepurposeReport, PlatformContentMetrics } from "@/types/repurpose";

interface RepurposeDashboardProps {
  report: RepurposeReport;
}

function MetricsBar({ metrics, onCopy, copied }: { metrics: PlatformContentMetrics; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-md border border-border bg-muted mb-6">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-violet-200 font-semibold">
          <FileText className="h-3.5 w-3.5 text-foreground" />
          <span>Word Count: <strong className="text-white">{metrics.wordCount}</strong></span>
        </div>
        <span className="text-foreground">•</span>
        <div className="flex items-center gap-1.5 text-violet-200 font-semibold">
          <span>Characters: <strong className="text-white">{metrics.characterCount}</strong></span>
        </div>
        <span className="text-foreground">•</span>
        <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
          <Clock className="h-3.5 w-3.5 text-amber-400" />
          <span>Est. Reading Time: <strong className="text-white">{metrics.readingTimeSeconds}s</strong></span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onCopy}
        className="bg-muted hover:bg-muted text-white font-bold gap-1.5 text-xs h-8 shrink-0"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-300" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied Platform Package!" : "Copy Full Platform Text"}
      </Button>
    </div>
  );
}

export function RepurposeDashboard({ report }: RepurposeDashboardProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedTab(key);
    setTimeout(() => setCopiedTab(null), 2000);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* HEADER BANNER */}
      <Card className="overflow-hidden border-border bg-muted via-card/95 shadow-none">
        <div className="h-1.5 w-full bg-muted" />
        <CardHeader className="pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-muted hover:bg-muted text-white gap-1 px-2.5 py-0.5">
                  <Sparkles className="h-3.5 w-3.5" /> Phase 9 Omnichannel Engine
                </Badge>
                <Badge variant="outline" className="border-border text-foreground bg-muted">
                  6 Formats Generated
                </Badge>
              </div>
              <CardTitle className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight bg-muted from-white bg-clip-text text-transparent">
                Multi-Platform Repurpose Studio
              </CardTitle>
              <CardDescription className="text-foreground text-sm mt-1">
                Deterministic transformation adapting your master Reel package into native formats across 6 platforms.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* PLATFORM TABS */}
      <Card className="border-border bg-card shadow-none">
        <CardContent className="pt-6">
          <Tabs defaultValue="instagram" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-background border border-border/80 gap-1 rounded-md mb-6">
              <TabsTrigger value="instagram" className="gap-2 py-2.5 data-[state=active]:bg-muted data-[state=active]:text-white text-xs">
                <Share2 className="h-4 w-4" /> Instagram
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="gap-2 py-2.5 data-[state=active]:bg-muted data-[state=active]:text-white text-xs">
                <FileText className="h-4 w-4" /> LinkedIn
              </TabsTrigger>
              <TabsTrigger value="x" className="gap-2 py-2.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs">
                <Globe className="h-4 w-4" /> X (Twitter)
              </TabsTrigger>
              <TabsTrigger value="threads" className="gap-2 py-2.5 data-[state=active]:bg-neutral-700 data-[state=active]:text-white text-xs">
                <MessageSquare className="h-4 w-4" /> Threads
              </TabsTrigger>
              <TabsTrigger value="facebook" className="gap-2 py-2.5 data-[state=active]:bg-muted data-[state=active]:text-white text-xs">
                <Users className="h-4 w-4" /> Facebook
              </TabsTrigger>
              <TabsTrigger value="youtube" className="gap-2 py-2.5 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs">
                <Video className="h-4 w-4" /> Shorts
              </TabsTrigger>
            </TabsList>

            {/* 1. INSTAGRAM TAB */}
            <TabsContent value="instagram" className="space-y-4">
              <MetricsBar
                metrics={report.instagram.metrics}
                copied={copiedTab === "ig"}
                onCopy={() => copyText("ig", `${report.instagram.title}\n\n${report.instagram.caption}\n\n${report.instagram.cta}\n\n${report.instagram.hashtags}`)}
              />
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-md border border-border/80 bg-background space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Instagram Caption</span>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">{report.instagram.caption}</pre>
                </div>
                <div className="p-4 rounded-md border border-border bg-muted space-y-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Lead Magnet CTA</span>
                  <p className="text-xs font-semibold text-white">{report.instagram.cta}</p>
                </div>
              </div>
            </TabsContent>

            {/* 2. LINKEDIN TAB */}
            <TabsContent value="linkedin" className="space-y-4">
              <MetricsBar
                metrics={report.linkedIn.metrics}
                copied={copiedTab === "li"}
                onCopy={() => copyText("li", `${report.linkedIn.longFormPost}\n\n${report.linkedIn.cta}\n\n${report.linkedIn.hashtags.join(" ")}`)}
              />
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-md border border-border bg-muted space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Professional Opening Hook</span>
                  <p className="font-extrabold text-white text-base">"{report.linkedIn.professionalHook}"</p>
                </div>
                <div className="p-4 rounded-md border border-border/80 bg-background space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Long-Form Thought Leadership Post</span>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">{report.linkedIn.longFormPost}</pre>
                </div>
                <div className="p-4 rounded-md border border-border bg-muted space-y-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Engagement CTA</span>
                  <p className="text-xs font-semibold text-white">{report.linkedIn.cta}</p>
                </div>
              </div>
            </TabsContent>

            {/* 3. X (TWITTER) TAB */}
            <TabsContent value="x" className="space-y-4">
              <MetricsBar
                metrics={report.x.metrics}
                copied={copiedTab === "x"}
                onCopy={() => copyText("x", `${report.x.thread.map((t) => t.content).join("\n\n")}\n\n${report.x.cta}`)}
              />
              <div className="space-y-3">
                {report.x.thread.map((tweet) => (
                  <div key={tweet.tweetNumber} className="p-4 rounded-md border border-border/80 bg-background space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                      <span>Tweet #{tweet.tweetNumber} / 5</span>
                    </div>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{tweet.content}</p>
                  </div>
                ))}
                <div className="p-4 rounded-md border border-zinc-700 bg-zinc-900/60 space-y-1">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Conversion Reply CTA</span>
                  <p className="text-xs font-semibold text-white">{report.x.cta}</p>
                </div>
              </div>
            </TabsContent>

            {/* 4. THREADS TAB */}
            <TabsContent value="threads" className="space-y-4">
              <MetricsBar
                metrics={report.threads.metrics}
                copied={copiedTab === "th"}
                onCopy={() => copyText("th", `${report.threads.conversationalPost}\n\n${report.threads.cta}`)}
              />
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-md border border-border/80 bg-background space-y-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Conversational Threads Post</span>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">{report.threads.conversationalPost}</pre>
                </div>
                <div className="p-4 rounded-md border border-neutral-700 bg-neutral-900/60 space-y-1">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">Conversational Reply CTA</span>
                  <p className="text-xs font-semibold text-white">{report.threads.cta}</p>
                </div>
              </div>
            </TabsContent>

            {/* 5. FACEBOOK TAB */}
            <TabsContent value="facebook" className="space-y-4">
              <MetricsBar
                metrics={report.facebook.metrics}
                copied={copiedTab === "fb"}
                onCopy={() => copyText("fb", `${report.facebook.communityPost}\n\n${report.facebook.cta}`)}
              />
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-md border border-border/80 bg-background space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Community Style Post</span>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">{report.facebook.communityPost}</pre>
                </div>
                <div className="p-4 rounded-md border border-border bg-muted space-y-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Group Discussion CTA</span>
                  <p className="text-xs font-semibold text-white">{report.facebook.cta}</p>
                </div>
              </div>
            </TabsContent>

            {/* 6. YOUTUBE SHORTS TAB */}
            <TabsContent value="youtube" className="space-y-4">
              <MetricsBar
                metrics={report.youtubeShorts.metrics}
                copied={copiedTab === "yt"}
                onCopy={() => copyText("yt", `${report.youtubeShorts.title}\n\n${report.youtubeShorts.description}\n\n${report.youtubeShorts.cta}`)}
              />
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-md border border-red-500/30 bg-red-950/20 space-y-1">
                  <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">YouTube Shorts Title</span>
                  <p className="font-extrabold text-white text-base">{report.youtubeShorts.title}</p>
                </div>
                <div className="p-4 rounded-md border border-border/80 bg-background space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Description & Timestamps</span>
                  <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-foreground">{report.youtubeShorts.description}</pre>
                </div>
                <div className="p-4 rounded-md border border-red-500/30 bg-red-950/20 space-y-1">
                  <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">Pinned Comment & Subscribe CTA</span>
                  <p className="text-xs font-semibold text-white">{report.youtubeShorts.cta}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
