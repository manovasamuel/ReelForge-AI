import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, User, Layers, Users } from "lucide-react";

interface SummaryPanelProps {
  username?: string;
  industry?: string;
  brandType?: string;
  competitorsCount?: number;
  selectedCompetitor?: string | null;
  isPhase4Complete?: boolean;
  isPhase5Complete?: boolean;
  isPhase6Complete?: boolean;
  isPhase7Complete?: boolean;
  isPhase8Complete?: boolean;
  isPhase9Complete?: boolean;
}

export function SummaryPanel({
  username,
  industry,
  brandType,
  competitorsCount = 0,
  selectedCompetitor,
  isPhase4Complete = false,
  isPhase5Complete = false,
  isPhase6Complete = false,
  isPhase7Complete = false,
  isPhase8Complete = false,
  isPhase9Complete = false,
}: SummaryPanelProps) {
  return (
    <Card className="w-full overflow-hidden border-violet-500/30 bg-card/90 shadow-xl shadow-violet-950/20 backdrop-blur-md lg:sticky lg:top-20">
      <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-violet-500/40 text-violet-300 bg-violet-500/10 text-[10px]">
            Live Session
          </Badge>
          <span className="text-[11px] font-medium text-muted-foreground">
            {isPhase9Complete ? "Phase 9 Complete" : isPhase8Complete ? "Phase 8 Complete" : isPhase7Complete ? "Phase 7B Complete" : isPhase6Complete ? "Phase 6 Complete" : isPhase5Complete ? "Phase 5 Complete" : isPhase4Complete ? "Phase 4 Complete" : "Phase 3 Complete"}
          </span>
        </div>
        <CardTitle className="text-base font-bold text-white flex items-center gap-1.5 mt-2 truncate">
          @{username}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-xs pb-5">
        <div className="space-y-2.5">
          {/* Current Profile */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5 text-violet-400" />
              Current Profile
            </span>
            <span className="font-semibold text-foreground">
              {username ? `@${username}` : "Not Selected"}
            </span>
          </div>

          <Separator className="opacity-30" />

          {/* Industry */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-violet-400" />
              Industry
            </span>
            <span className="font-medium text-foreground line-clamp-1 max-w-[140px]" title={industry ?? "Pending"}>
              {industry ?? "Pending"}
            </span>
          </div>

          <Separator className="opacity-30" />

          {/* Brand Type */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Brand Type</span>
            <Badge variant="secondary" className="bg-violet-500/15 text-[10px] text-violet-300">
              {brandType ?? "Pending"}
            </Badge>
          </div>

          <Separator className="opacity-30" />

          {/* Competitors Found */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-fuchsia-400" />
              Competitors Found
            </span>
            <span className="font-bold text-foreground">{competitorsCount}</span>
          </div>

          <Separator className="opacity-30" />

          {/* Selected Competitor */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Selected Target</span>
            <span className="font-semibold text-violet-300">
              {selectedCompetitor ? `@${selectedCompetitor}` : "None Selected"}
            </span>
          </div>
        </div>

        {/* Status Box */}
        <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
            <span className="font-bold text-violet-200">
              {isPhase9Complete
                ? "Multi-Platform Suite Ready"
                : isPhase8Complete
                ? "Ready for Repurpose Engine"
                : isPhase7Complete
                ? "Ready for Script Generation"
                : isPhase6Complete
                ? "Ready for Content DNA"
                : isPhase5Complete
                ? "Ready for Phase 6"
                : isPhase4Complete
                ? "Ready for Phase 5"
                : "Ready for Phase 4"}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-tight text-violet-300/80">
            {isPhase9Complete
              ? "Reel package successfully adapted across Instagram, LinkedIn, X, Threads, Facebook, and YouTube Shorts."
              : isPhase8Complete
              ? "Strategy & 5-scene shooting script compiled. Click Proceed to Repurpose Engine to generate omnichannel formats."
              : isPhase7Complete
              ? "Content DNA blueprint complete. Click Generate Script to compile shooting briefs."
              : isPhase6Complete
              ? "Content intelligence complete. Click Generate Content DNA to synthesize winning blueprint."
              : isPhase5Complete
              ? "Content collection complete. Select items to generate Content Intelligence."
              : isPhase4Complete
              ? "Competitor profile analysis complete. Ready for Content Collection engine."
              : "Profile ingestion, brand intelligence, and competitor discovery are complete."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
