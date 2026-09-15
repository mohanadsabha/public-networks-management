import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const statisticsRecentTableWrapClass = "w-full overflow-hidden";

export const statisticsRecentTableClass =
  "w-full table-fixed border-collapse text-[11px] leading-snug sm:text-xs";

export const statisticsRecentHeadRowClass = "border-b border-border bg-muted/30";

export const statisticsRecentHeadCellClass =
  "px-1.5 py-1.5 text-start align-middle font-semibold text-muted-foreground sm:px-2";

export const statisticsRecentBodyRowClass =
  "border-b border-border/70 last:border-0 transition-colors hover:bg-muted/15";

export const statisticsRecentCellClass =
  "min-w-0 max-w-0 px-1.5 py-1.5 align-middle text-start sm:px-2";

export function StatisticsRecentTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={statisticsRecentTableWrapClass}>
      <table className={cn(statisticsRecentTableClass, className)}>{children}</table>
    </div>
  );
}

export function StatisticsRecentCellContent({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <span className={cn("block truncate", className)} title={title}>
      {children}
    </span>
  );
}
