import { cn } from "@/lib/cn";

interface TableSubscriberCellProps {
  name: string;
  subtitle?: string | null;
  initials: string;
  className?: string;
  compact?: boolean;
}

/** Compact identity cell — capped width so other columns get room. */
export function TableSubscriberCell({
  name,
  subtitle,
  initials,
  className,
  compact = false,
}: TableSubscriberCellProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 font-medium text-muted-foreground",
          compact ? "h-6 w-6 text-[9px]" : "h-7 w-7 text-[10px]",
        )}
      >
        {initials}
      </div>
      <div className="min-w-0 overflow-hidden">
        <p
          className={cn(
            "truncate font-medium leading-tight text-foreground",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {name}
        </p>
        {subtitle ? (
          <p
            className={cn(
              "truncate leading-tight text-muted-foreground",
              compact ? "text-[10px]" : "text-[11px]",
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
