import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ContentIntelligenceSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Aggregate Benchmarks Skeleton */}
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </Card>

      {/* Report Cards Skeleton */}
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card key={idx} className="p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <div className="flex gap-4 items-center">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-12 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-12 w-32 rounded-xl" />
                <Skeleton className="h-12 w-32 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-4 border-t">
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
