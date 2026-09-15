import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityLogsFilters, ActivityLogsTable } from "@/components/pages/activity-logs";
import { Button } from "@/components/ui/buttons";
import { TablePagination } from "@/components/ui/data/TablePagination";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useActivityLogsQuery } from "@/hooks/useActivityLogs";
import { ApiError } from "@/types/api";

const PAGE_SIZE = 25;
const USE_MOCK = import.meta.env.VITE_USE_ACTIVITY_LOGS_MOCK === "true";

export function ActivityLogsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isError, error, isFetching, refetch } = useActivityLogsQuery({
    page,
    limit: PAGE_SIZE,
    name: debouncedSearch || undefined,
  });

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const showInitialLoading = isLoading && rows.length === 0;
  const isBackgroundRefresh = isFetching && !showInitialLoading;
  const errorMessage = error instanceof ApiError ? error.message : t("common.unexpectedError");
  const isNotFound = error instanceof ApiError && (error.status === 404 || error.status === 501);

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <Heading as="h1">{t("activityLogs.title")}</Heading>
        {USE_MOCK ? (
          <p className="mt-2 text-xs text-warning">{t("activityLogs.mockHint")}</p>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <ActivityLogsFilters search={search} onSearchChange={setSearch} />
        </div>

        <div className="px-4 py-4 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Text muted className="text-sm">
              {t("activityLogs.table.sectionSubtitle", { count: rows.length })}
            </Text>
            {isBackgroundRefresh ? (
              <Text muted className="text-xs">
                {t("common.loading")}
              </Text>
            ) : null}
          </div>

          {showInitialLoading ? (
            <LoadingState layout="table" variant="section" />
          ) : isError && rows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <Text muted>{isNotFound ? t("activityLogs.notConfigured") : errorMessage}</Text>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                {t("common.retry")}
              </Button>
            </div>
          ) : (
            <>
              <ActivityLogsTable rows={rows} hasSearch={Boolean(debouncedSearch)} />
              <TablePagination
                page={page}
                limit={data?.limit ?? PAGE_SIZE}
                total={total}
                onPageChange={setPage}
                disabled={isFetching}
                className="mt-4"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
