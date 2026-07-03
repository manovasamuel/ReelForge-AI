import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function BrandIntelligenceSkeleton() {
  return (
    <Card className="w-full overflow-hidden border-violet-500/20 bg-card/80 backdrop-blur-md">
      <div className="h-1.5 w-full bg-gradient-to-r from-violet-600/30 via-fuchsia-600/30 to-purple-500/30" />

      <CardHeader className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-3.5 w-64" />
            </div>
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-border/30 bg-muted/10 p-3.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        <Separator className="opacity-30" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            <Skeleton className="h-4 w-44" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4 rounded-xl border border-border/30 bg-muted/10 p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
