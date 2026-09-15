import { formatDataUsageMb } from "@/lib/speedFairUsage";
import { cn } from "@/lib/cn";

interface DataUsageDisplayProps {
  usedMb: number;
  limitMb?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Gray out when subscription cycle is not active (expired, paused, etc.). */
  inactive?: boolean;
}

const sizeClass = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-2xl font-bold tracking-tight",
} as const;

/** Renders usage vs limit in a stable LTR layout (fixes RTL bidi shuffle). */
export function DataUsageDisplay({
  usedMb,
  limitMb = null,
  className,
  size = "md",
  inactive = false,
}: DataUsageDisplayProps) {
  const usedLabel = formatDataUsageMb(usedMb);
  const hasLimit = limitMb != null && limitMb > 0;
  const tone = inactive ? "text-muted-foreground" : undefined;

  if (!hasLimit) {
    return (
      <span
        dir="ltr"
        className={cn("inline-block tabular-nums", sizeClass[size], tone, className)}
      >
        {usedLabel}
      </span>
    );
  }

  const limitLabel = formatDataUsageMb(limitMb);

  return (
    <span
      dir="ltr"
      className={cn("inline-flex items-baseline gap-1.5 tabular-nums", sizeClass[size], tone, className)}
    >
      <span>{usedLabel}</span>
      <span className={cn("font-normal", inactive ? "text-muted-foreground/70" : "text-muted-foreground")}>
        /
      </span>
      <span>{limitLabel}</span>
    </span>
  );
}
