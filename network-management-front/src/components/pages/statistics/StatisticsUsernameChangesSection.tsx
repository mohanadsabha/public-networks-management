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
import { useUsernameChangesByDateQuery } from "@/hooks/useStatistics";
import { cn } from "@/lib/cn";
import { formatStatisticsDateLabel, todayDateKey } from "@/lib/statisticsDayFilter";
import { subscriberProfilePath } from "@/lib/routePaths";
import { STATISTICS_RECENT_PAGE_SIZE } from "@/lib/statisticsRecent";

function formatTimeOnly(iso: string, lang: string): string {
  const locale = lang.startsWith("ar") ? ar : enUS;
  try {
    return format(parseISO(iso), "HH:mm", { locale });
  } catch {
    return iso;
  }
}

export function StatisticsUsernameChangesSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [selectedDate, setSelectedDate] = useState(todayDateKey);
  const [page, setPage] = useState(1);

  const selectedDateLabel = useMemo(
    () => formatStatisticsDateLabel(selectedDate, lang),
    [selectedDate, lang],
  );

  const { data, isLoading, isFetching } = useUsernameChangesByDateQuery(selectedDate, page);
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setPage(1);
  };

  return (
    <StatisticsDaySectionShell
      title={t("statistics.recent.usernameChangesTitle")}
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
      lang={lang}
      ariaLabel={t("statistics.recent.usernameChangesTitle")}
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
        <ChangesTableSkeleton />
      ) : rows.length === 0 ? (
        <p className="px-3 py-8 text-center text-xs text-muted-foreground sm:px-4 sm:py-10 sm:text-sm">
          {t("statistics.recent.emptyChangesForDay", { date: selectedDateLabel })}
        </p>
      ) : (
        <div className={cn(isFetching && "opacity-60 transition-opacity")}>
          <StatisticsRecentTable>
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[30%]" />
              <col className="w-[30%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead>
              <tr className={statisticsRecentHeadRowClass}>
                <th className={statisticsRecentHeadCellClass}>{t("statistics.recent.name")}</th>
                <th className={statisticsRecentHeadCellClass}>{t("statistics.recent.oldUsername")}</th>
                <th className={statisticsRecentHeadCellClass}>
                  {t("statistics.recent.currentUsername")}
                </th>
                <th className={statisticsRecentHeadCellClass}>{t("statistics.recent.changedAtShort")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={statisticsRecentBodyRowClass}>
                  <td className={statisticsRecentCellClass}>
                    <StatisticsRecentCellContent title={row.fullName}>
                      <Link
                        to={row.lineId ? subscriberProfilePath(row.lineId, "stats") : "#"}
                        className="truncate font-medium text-primary hover:underline"
                      >
                        {row.fullName}
                      </Link>
                    </StatisticsRecentCellContent>
                  </td>
                  <td className={statisticsRecentCellClass}>
                    <LtrText>
                      <StatisticsRecentCellContent title={row.oldUsername}>
                        {row.oldUsername}
                      </StatisticsRecentCellContent>
                    </LtrText>
                  </td>
                  <td className={statisticsRecentCellClass}>
                    <LtrText>
                      <StatisticsRecentCellContent title={row.currentUsername}>
                        {row.currentUsername}
                      </StatisticsRecentCellContent>
                    </LtrText>
                  </td>
                  <td className={statisticsRecentCellClass}>
                    <LtrText>
                      <StatisticsRecentCellContent title={row.changedAt}>
                        {formatTimeOnly(row.changedAt, lang)}
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

function ChangesTableSkeleton() {
  return (
    <div className="space-y-2.5 px-3 py-4 sm:px-4 sm:py-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
