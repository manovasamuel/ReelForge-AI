import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { BrandIntelligenceReport } from "@/types/brand-intelligence";
import { Box, Target, Users, Volume2, Palette, Layers, Calendar, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandIntelligenceCardProps {
  report: BrandIntelligenceReport;
}

export function BrandIntelligenceCard({ report }: BrandIntelligenceCardProps) {
  return (
    <Card className="w-full overflow-hidden border-border bg-card shadow-none">
      {/* Top primary gradient banner */}
      <div className="h-1.5 w-full bg-muted" />

      <CardHeader className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted ring-1 ring-border">
              <Box className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Brand Intelligence Report
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Strategic brand positioning and content strategy blueprint
              </p>
            </div>
          </div>

          {/* Market position tag */}
          <div className="flex items-center gap-1.5 self-start rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground sm:self-center">
            <Award className="h-3.5 w-3.5 text-foreground" />
            {report.estimatedMarketPosition}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Industry & Core Badges section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-muted p-3.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-foreground" />
              Industry
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted">
                {report.industry}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground/80">{report.subIndustry}</span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-muted p-3.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-foreground" />
              Target Audience
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted">
                {report.estimatedAudienceAge}
              </Badge>
            </div>
            <span className="line-clamp-1 text-[11px] text-muted-foreground/80" title={report.targetAudience}>
              {report.targetAudience}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-muted p-3.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Volume2 className="h-3.5 w-3.5 text-foreground" />
              Brand Tone
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted">
                {report.brandTone}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground/80">Brand Voice</span>
          </div>

          <div className="flex flex-col gap-1.5 rounded-md border border-border/50 bg-muted p-3.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Palette className="h-3.5 w-3.5 text-foreground" />
              Content Style
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant="secondary" className="bg-muted text-foreground hover:bg-muted">
                {report.contentStyle}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground/80">Format & Aesthetic</span>
          </div>
        </div>

        <Separator className="opacity-40" />

        {/* Pillars and Strategy grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Content Pillars list */}
          <div className="space-y-3 md:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Target className="h-4 w-4 text-foreground" />
              Primary Content Pillars
            </h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {report.primaryContentPillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-muted px-3.5 py-3 transition-colors hover:border-border"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium leading-snug text-foreground sm:text-sm">
                    {pillar}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Metrics Column */}
          <div className="flex flex-col justify-between space-y-4 rounded-md border border-border/40 bg-muted p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                  Brand Type
                </span>
                <span className="font-semibold text-foreground">{report.brandType}</span>
              </div>
              <Separator className="opacity-30" />
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-foreground" />
                  Posting Frequency
                </span>
                <span className="font-semibold text-foreground">{report.postingFrequency}</span>
              </div>
            </div>

            {/* Confidence Score Progress */}
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">AI Confidence</span>
                <span className="font-bold text-foreground">{report.confidenceScore}%</span>
              </div>
              <Progress value={report.confidenceScore} className="h-2 bg-muted" />
              <p className="text-[10px] text-muted-foreground/70">
                Confidence based on available profile indicators & bio richness.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
