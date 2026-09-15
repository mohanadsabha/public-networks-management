import type { ReactNode } from "react";
import { StatisticsDayFilter } from "@/components/pages/statistics/StatisticsDayFilter";
import { cn } from "@/lib/cn";

interface StatisticsDaySectionShellProps {
  title: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  lang: string;
  ariaLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function StatisticsDaySectionShell({
  title,
  selectedDate,
  onDateChange,
  lang,
  ariaLabel,
  children,
  footer,
  className,
}: StatisticsDaySectionShellProps) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4">
        <h2 className="min-w-0 text-sm font-semibold text-foreground sm:text-base">{title}</h2>
        <StatisticsDayFilter
          selectedDate={selectedDate}
          onChange={onDateChange}
          lang={lang}
          ariaLabel={ariaLabel}
        />
      </div>

      <div className="min-w-0 flex-1">{children}</div>

      {footer ? (
        <div className="border-t border-border px-3 py-2 sm:px-4">{footer}</div>
      ) : null}
    </section>
  );
}
