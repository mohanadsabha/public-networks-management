import { format, parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { StatisticsDaySectionShell } from "@/components/pages/statistics/StatisticsDaySectionShell";
import {
  StatisticsRecentCellContent,
  StatisticsRecentTable,
  statisticsRecentBodyRowClass,
  statisticsRecentCellClass,
  statisticsRecentHeadCellClass,
  statisticsRecentHeadRowClass,
} from "@/components/pages/statistics/statisticsRecentTable";
import { Skeleton } from "@/components/ui/feedback/Skeleton";
import { LtrText, TablePagination } from "@/components/ui/data";
import { useNewSubscribersByDateQuery } from "@/hooks/useStatistics";
import { cn } from "@/lib/cn";
import { customerProfilePath } from "@/lib/routePaths";
import { STATISTICS_RECENT_PAGE_SIZE } from "@/lib/statisticsRecent";
import { formatStatisticsDateLabel, todayDateKey } from "@/lib/statisticsDayFilter";

function formatTimeOnly(iso: string, lang: string): string {
  const locale = lang.startsWith("ar") ? ar : enUS;
  try {
    return format(parseISO(iso), "HH:mm", { locale });
  } catch {
    return iso;
  }
}

export function StatisticsNewSubscribersSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [selectedDate, setSelectedDate] = useState(todayDateKey);
  const [page, setPage] = useState(1);

  const selectedDateLabel = useMemo(
    () => formatStatisticsDateLabel(selectedDate, lang),
    [selectedDate, lang],
  );

  const { data, isLoading, isFetching } = useNewSubscribersByDateQuery(selectedDate, page);
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setPage(1);
  };

  return (
    <StatisticsDaySectionShell
      title={t("statistics.recent.newSubscribersTitle")}
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      lang={lang}
      ariaLabel={t("statistics.recent.newSubscribersTitle")}
      footer={
        total > 0 && Math.ceil(total / STATISTICS_RECENT_PAGE_SIZE) > 1 ? (
          <TablePagination
            compact
            page={page}
            limit={STATISTICS_RECENT_PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            disabled={isFetching}
          />
        ) : null
      }
    >
      {isLoading ? (
        <RecentTableSkeleton />
      ) : rows.length === 0 ? (
        <p className="px-3 py-8 text-center text-xs text-muted-foreground sm:px-4 sm:py-10 sm:text-sm">
          {t("statistics.recent.emptyNewForDay", { date: selectedDateLabel })}
        </p>
      ) : (
        <div className={cn(isFetching && "opacity-60 transition-opacity")}>
          <StatisticsRecentTable>
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[22%]" />
              <col className="w-[28%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead>
              <tr className={statisticsRecentHeadRowClass}>
                <th className={statisticsRecentHeadCellClass}>{t("statistics.recent.name")}</th>
                <th className={statisticsRecentHeadCellClass}>{t("statistics.recent.lineId")}</th>
                <th className={statisticsRecentHeadCellClass}>{t("statistics.recent.phone")}</th>
                <th className={statisticsRecentHeadCellClass}>{t("statistics.recent.addedAtShort")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.lineId} className={statisticsRecentBodyRowClass}>
                  <td className={statisticsRecentCellClass}>
                    <StatisticsRecentCellContent title={row.fullName}>
                      <Link
                        to={customerProfilePath(row.lineId)}
                        className="truncate font-medium text-primary hover:underline"
                      >
                        {row.fullName}
                      </Link>
                    </StatisticsRecentCellContent>
                  </td>
                  <td className={statisticsRecentCellClass}>
                    <LtrText>
                      <StatisticsRecentCellContent title={row.lineId}>
                        {row.lineId}
                      </StatisticsRecentCellContent>
                    </LtrText>
                  </td>
                  <td className={statisticsRecentCellClass}>
                    <LtrText>
                      <StatisticsRecentCellContent title={row.phone ?? undefined}>
                        {row.phone ?? "—"}
                      </StatisticsRecentCellContent>
                    </LtrText>
                  </td>
                  <td className={statisticsRecentCellClass}>
                    <LtrText>
                      <StatisticsRecentCellContent title={row.createdAt}>
                        {formatTimeOnly(row.createdAt, lang)}
                      </StatisticsRecentCellContent>
                    </LtrText>
                  </td>
                </tr>
              ))}
            </tbody>
          </StatisticsRecentTable>
        </div>
      )}
    </StatisticsDaySectionShell>
  );
}

function RecentTableSkeleton() {
  return (
    <div className="space-y-2.5 px-3 py-4 sm:px-4 sm:py-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
