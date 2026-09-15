import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StoppedTable } from "@/components/pages/stopped";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useStoppedSubscribersQuery } from "@/hooks/useSubscribers";
import { matchesSubscriberSearch } from "@/lib/subscriberUtils";
import { ApiError } from "@/types/api";

export function StoppedPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const { data: apiRows = [], isLoading, isError, error, refetch } = useStoppedSubscribersQuery(search);

  const rows = useMemo(
    () => apiRows.filter((row) => matchesSubscriberSearch(row, search)),
    [apiRows, search],
  );

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <Heading as="h1">{t("stopped.title")}</Heading>
        <Text muted className="mt-2 max-w-2xl">
          {t("stopped.subtitle")}
        </Text>
      </div>

      <section className="rounded-xl border border-border bg-surface">
        <div className="px-4 py-4 sm:px-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Text muted className="text-sm">
              {t("stopped.table.sectionSubtitle", { count: rows.length })}
            </Text>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("subscribers.filters.searchPlaceholder")}
              className="flex h-10 max-w-md flex-1 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border"
              aria-label={t("subscribers.filters.search")}
            />
          </div>

          {isLoading ? (
            <LoadingState layout="table" variant="section" />
          ) : isError ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <Text muted>
                {error instanceof ApiError ? error.message : t("common.unexpectedError")}
              </Text>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                {t("common.retry")}
              </Button>
            </div>
          ) : (
            <StoppedTable rows={rows} />
          )}
        </div>
      </section>
    </div>
  );
}
