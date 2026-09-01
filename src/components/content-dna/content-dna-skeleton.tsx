import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentDNASkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Banner Skeleton */}
      <Card className="border-border bg-card">
        <CardHeader className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border bg-card">
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 rounded-md" />
            ))}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
