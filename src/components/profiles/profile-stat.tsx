import { cn } from "@/lib/utils";

interface ProfileStatProps {
  label: string;
  value: number;
  className?: string;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function ProfileStat({ label, value, className }: ProfileStatProps) {
  return (
    <div className={cn("flex flex-col items-center gap-0.5 text-center", className)}>
      <span className="text-lg font-bold tracking-tight text-foreground">
        {formatNumber(value)}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
