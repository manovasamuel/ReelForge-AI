import { PageContainer, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Global Analytics"
        description="Monitor platform-wide performance and AI execution metrics."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projects Analyzed</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-fuchsia-500/10 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Competitors Tracked</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Content Generated</p>
              <p className="text-2xl font-bold text-foreground">0</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="mt-8 flex items-center justify-center h-64 border border-dashed border-border/50 rounded-xl bg-muted/20">
        <p className="text-muted-foreground">Detailed Analytics (Coming Soon)</p>
      </div>
    </PageContainer>
  );
}
