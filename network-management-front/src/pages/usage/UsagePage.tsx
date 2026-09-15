import { AlertTriangle, Database, Gauge, Info, RefreshCw, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UsageTable, UsageTopChart } from "@/components/pages/usage";
import { Button } from "@/components/ui/buttons";
import { FilterChipBar, SearchField, StatCard } from "@/components/ui/data";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useSubscribersQuery } from "@/hooks/useSubscribers";
import { formatDataUsageMb } from "@/lib/speedFairUsage";
import {
  buildSubscriberUsageRows,
  matchesUsageLevelFilter,
  matchesUsageSearch,
  sortByConsumption,
  summarizeUsage,
  USAGE_CRITICAL_PERCENT,
  type UsageLevelFilter,
} from "@/lib/usageUtils";
import { ApiError } from "@/types/api";

const LEVEL_FILTERS: UsageLevelFilter[] = ["all", "over", "critical_up", "high_up"];

export function UsagePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<UsageLevelFilter>("all");

  const {
    data: subscribers = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useSubscribersQuery({
    suspended: false,
    expired: false,
    includePaused: true,
    limit: 500,
  });

  const allRows = useMemo(() => sortByConsumption(buildSubscriberUsageRows(subscribers)), [subscribers]);
  const summary = useMemo(() => summarizeUsage(allRows), [allRows]);

  const filteredRows = useMemo(
    () =>
      allRows.filter(
        (row) => matchesUsageLevelFilter(row, level) && matchesUsageSearch(row, search),
      ),
    [allRows, level, search],
  );

  const levelOptions = LEVEL_FILTERS.map((id) => ({
    id,
    label: t(`usage.filters.level_${id}`),
  }));

  const showNotReady = !isLoading && !isError && allRows.length > 0 && summary.totalUsedMb === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading as="h1">{t("usage.title")}</Heading>
          <Text muted className="mt-2 max-w-2xl">
            {t("usage.subtitle")}
          </Text>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          isLoading={isFetching}
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          {t("usage.refresh")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label={t("usage.summary.tracked")}
          value={summary.trackedCount}
          hint={t("usage.summary.trackedHint")}
        />
        <StatCard
          icon={AlertTriangle}
          iconClassName="bg-danger/10 text-danger"
          label={t("usage.summary.over")}
          value={summary.overCount}
          hint={t("usage.summary.overHint")}
        />
        <StatCard
          icon={Gauge}
          iconClassName="bg-warning/10 text-warning"
          label={t("usage.summary.critical")}
          value={summary.criticalCount}
          hint={t("usage.summary.criticalHint", { percent: USAGE_CRITICAL_PERCENT })}
        />
        <StatCard
          icon={Database}
          label={t("usage.summary.totalUsed")}
          value={<span dir="ltr">{formatDataUsageMb(summary.totalUsedMb)}</span>}
          hint={t("usage.summary.totalUsedHint")}
        />
      </div>

      {showNotReady ? (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <Text muted className="text-sm">
            {t("usage.notReady")}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState layout="table" variant="section" />
      ) : isError ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <Text muted>{error instanceof ApiError ? error.message : t("common.unexpectedError")}</Text>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            {t("common.retry")}
          </Button>
        </div>
      ) : allRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
          <Text className="font-medium">{t("usage.table.empty")}</Text>
          <Text muted className="mx-auto mt-2 max-w-md text-sm">
            {t("usage.table.emptyHint")}
          </Text>
        </div>
      ) : (
        <>
          <UsageTopChart rows={allRows} />

          <section className="rounded-xl border border-border bg-surface">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder={t("usage.filters.searchPlaceholder")}
                ariaLabel={t("usage.filters.search")}
              />
              <FilterChipBar
                value={level}
                onChange={(id) => setLevel(id as UsageLevelFilter)}
                options={levelOptions}
                wrap
              />
            </div>
            <div className="px-4 py-4 sm:px-6">
              <Text muted className="mb-4 text-sm">
                {t("usage.table.sectionSubtitle", { count: filteredRows.length })}
              </Text>
              <UsageTable rows={filteredRows} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
