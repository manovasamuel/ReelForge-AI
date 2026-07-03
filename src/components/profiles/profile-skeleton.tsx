import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * ProfileSkeleton — mirrors the exact layout of ProfileCard.
 * Shown during the API call to prevent layout shift.
 */
export function ProfileSkeleton() {
  return (
    <Card className="w-full overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Top gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-pink-500/30" />

      <CardHeader className="pt-6">
        {/* Avatar + identity row skeleton */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <Skeleton className="h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24" />

          {/* Name block */}
          <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-6">
        {/* Bio skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>

        <Separator className="opacity-30" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/30 bg-muted/10 px-4 py-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>

        {/* Posts count skeleton */}
        <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 px-4 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>

        <Separator className="opacity-30" />

        {/* Latest posts grid skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
