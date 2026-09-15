import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LtrText } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import {
  canGoToNewerDay,
  canGoToOlderDay,
  formatStatisticsDateLabel,
  shiftStatisticsDate,
} from "@/lib/statisticsDayFilter";

interface StatisticsDayFilterProps {
  selectedDate: string;
  onChange: (date: string) => void;
  lang: string;
  ariaLabel: string;
  className?: string;
}

export function StatisticsDayFilter({
  selectedDate,
  onChange,
  lang,
  ariaLabel,
  className,
}: StatisticsDayFilterProps) {
  const { t } = useTranslation();
  const dateLabel = formatStatisticsDateLabel(selectedDate, lang);
  const canGoOlder = canGoToOlderDay(selectedDate);
  const canGoNewer = canGoToNewerDay(selectedDate);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border/60 bg-muted/25",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-s-lg text-muted-foreground transition-colors",
          "hover:bg-muted/60 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          "disabled:pointer-events-none disabled:opacity-35",
        )}
        disabled={!canGoOlder}
        onClick={() => onChange(shiftStatisticsDate(selectedDate, -1))}
        aria-label={t("statistics.recent.previousDay")}
      >
        <ChevronLeft className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" aria-hidden />
      </button>

      <div className="border-x border-border/50 px-2 py-1 text-center text-[11px] font-medium leading-none text-foreground sm:min-w-[4.75rem] sm:text-xs">
        <LtrText>{dateLabel}</LtrText>
      </div>

      <button
        type="button"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-e-lg text-muted-foreground transition-colors",
          "hover:bg-muted/60 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          "disabled:pointer-events-none disabled:opacity-35",
        )}
        disabled={!canGoNewer}
        onClick={() => onChange(shiftStatisticsDate(selectedDate, 1))}
        aria-label={t("statistics.recent.nextDay")}
      >
        <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" aria-hidden />
      </button>
    </div>
  );
}
