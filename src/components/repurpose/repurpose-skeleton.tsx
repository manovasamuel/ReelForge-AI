import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RepurposeSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Card className="border-violet-500/20 bg-card/60">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      </Card>

      <Card className="border-violet-500/20 bg-card/60">
        <CardContent className="pt-6 space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}
