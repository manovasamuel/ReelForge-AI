import { Skeleton } from "@/components/ui/skeleton";

export function CompetitorSkeleton() {
  return (
    <div className="space-y-5 rounded-2xl border border-violet-500/20 bg-card/40 p-6 backdrop-blur-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-7 w-36 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-xl border border-border/40 bg-card/60 p-5">
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-44" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-md" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
