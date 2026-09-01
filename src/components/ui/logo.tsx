import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  badgeClassName?: string;
  showText?: boolean;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  badgeClassName,
  showText = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn(
        "flex shrink-0 items-center justify-center text-foreground",
        iconClassName
      )}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn("h-8 w-8", iconClassName)}
        >
          {/* Abstract Stem */}
          <path d="M5 3h5l-3 18H2z" />
          {/* Abstract Chevron / Play */}
          <path d="M11 3l12 9-15 9 6-9z" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn("text-sm font-bold tracking-tight text-foreground", textClassName)}>
            ReelForge
          </span>
          <span className={cn("text-[10px] font-medium uppercase tracking-widest text-muted-foreground leading-none mt-0.5", badgeClassName)}>
            AI
          </span>
        </div>
      )}
    </div>
  );
}
