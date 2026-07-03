import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ProfileErrorProps {
  message: string;
  onRetry: () => void;
}

export function ProfileError({ message, onRetry }: ProfileErrorProps) {
  return (
    <Card className="w-full border-destructive/20 bg-destructive/5 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        {/* Error icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            Could not load profile
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        </div>

        {/* Retry */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-2 border-destructive/20 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}
