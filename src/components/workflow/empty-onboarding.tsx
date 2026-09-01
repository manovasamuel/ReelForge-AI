import { Card, CardContent } from "@/components/ui/card";
import { Box, Search, Layers, Users } from "lucide-react";

export function EmptyOnboarding() {
  return (
    <Card className="w-full border-border/50 bg-card p-6 sm:p-10 animate-in fade-in duration-300">
      <CardContent className="flex flex-col items-center text-center space-y-6 max-w-xl mx-auto p-0">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted ring-1 ring-border">
          <Box className="h-8 w-8 text-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Start Your Intelligence Workflow
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Paste any public Instagram profile URL above to trigger the automated 3-stage intelligence engine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-2">
          <div className="flex flex-col items-center p-4 rounded-md border border-border/40 bg-muted">
            <Search className="h-5 w-5 text-foreground mb-2" />
            <h4 className="text-xs font-bold text-foreground">1. Profile Snapshot</h4>
            <p className="text-[11px] text-muted-foreground mt-1">Ingests follower metrics & recent content.</p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-md border border-border/40 bg-muted">
            <Layers className="h-5 w-5 text-foreground mb-2" />
            <h4 className="text-xs font-bold text-foreground">2. Brand Strategy</h4>
            <p className="text-[11px] text-muted-foreground mt-1">Derives industry, tone & primary pillars.</p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-md border border-border/40 bg-muted">
            <Users className="h-5 w-5 text-foreground mb-2" />
            <h4 className="text-xs font-bold text-foreground">3. Competitor Radar</h4>
            <p className="text-[11px] text-muted-foreground mt-1">Identifies top 10 matching accounts.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
