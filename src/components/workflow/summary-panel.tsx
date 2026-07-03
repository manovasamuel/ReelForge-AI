import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, User, Layers, Users, ShieldAlert } from "lucide-react";

interface SummaryPanelProps {
  username?: string;
  industry?: string;
  brandType?: string;
  competitorsCount?: number;
  selectedCompetitor?: string | null;
  isPhase4Complete?: boolean;
  isPhase5Complete?: boolean;
  isPhase6Complete?: boolean;
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
}: SummaryPanelProps) {
  return (
    <Card className="w-full overflow-hidden border-violet-500/30 bg-card/90 shadow-xl shadow-violet-950/20 backdrop-blur-md lg:sticky lg:top-20">
      <div className="h-1 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <h4 className="text-sm font-bold tracking-tight text-foreground">
            Workflow Intelligence
          </h4>
        </div>
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
            <span className="text-muted-foreground">Selected Account</span>
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
              {isPhase6Complete
                ? "Ready for Phase 7"
                : isPhase5Complete
                ? "Ready for Phase 6"
                : isPhase4Complete
                ? "Ready for Phase 5"
                : "Ready for Phase 4"}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-tight text-violet-300/80">
            {isPhase6Complete
              ? "Content intelligence complete. Ready for Script Generation & Pattern Extraction engine."
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
