import { useMemo, useState } from "react";
import { RefreshCw, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OnlineUsersFilters, OnlineUsersTable } from "@/components/pages/online-users";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useOnlineUsersQuery } from "@/hooks/useOnlineUsers";
import { useSubscribersQuery } from "@/hooks/useSubscribers";
import {
  applyOnlineUserGroupFilter,
  buildOnlineUserDuplicateGroups,
  countOnlineUsersWithoutSubscriber,
  enrichOnlineUsersWithSubscribers,
  filterOnlineUsers,
  filterOnlineUsersWithoutSubscriber,
  type OnlineUserGroupFilter,
} from "@/lib/onlineUsersUtils";
import { formatSnapshotDateTime } from "@/lib/formatSnapshotDateTime";
import { MIKROTIK_FEATURES_ENABLED } from "@/lib/vpnConfig";
import { ApiError } from "@/types/api";

export function OnlineUsersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<OnlineUserGroupFilter>(null);
  const [withoutSubscriberOnly, setWithoutSubscriberOnly] = useState(false);

  const { data: apiRows = [], isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useOnlineUsersQuery();
  const { data: subscribers = [] } = useSubscribersQuery({ limit: 500, includePaused: true });

  const showInitialLoading = isLoading && apiRows.length === 0;
  const isBackgroundRefresh = isFetching && !showInitialLoading;

  const enrichedRows = useMemo(
    () => enrichOnlineUsersWithSubscribers(apiRows, subscribers),
    [apiRows, subscribers],
  );

  const duplicateGroups = useMemo(
    () => buildOnlineUserDuplicateGroups(enrichedRows),
    [enrichedRows],
  );

  const withoutSubscriberCount = useMemo(
    () => countOnlineUsersWithoutSubscriber(enrichedRows),
    [enrichedRows],
  );

  const rows = useMemo(() => {
    const searched = filterOnlineUsers(enrichedRows, search);
    const grouped = applyOnlineUserGroupFilter(searched, groupFilter);
    return filterOnlineUsersWithoutSubscriber(grouped, withoutSubscriberOnly);
  }, [enrichedRows, search, groupFilter, withoutSubscriberOnly]);

  const hasActiveFilters = Boolean(search.trim() || groupFilter || withoutSubscriberOnly);
  const lastSnapshot = apiRows[0]?.lastUpdated
    ? formatSnapshotDateTime(apiRows[0].lastUpdated)
    : null;
  const errorMessage =
    error instanceof ApiError
      ? error.message
      : t("onlineUsers.mikrotikError");
  const isNotConfigured = errorMessage.toLowerCase().includes("not configured");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading as="h1">{t("onlineUsers.title")}</Heading>
          <Text muted className="mt-2 max-w-2xl">
            {t("onlineUsers.subtitle")}
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Wifi className="h-4 w-4" aria-hidden />
            {t("onlineUsers.liveCount", { count: apiRows.length })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isBackgroundRefresh}
            disabled={showInitialLoading || !MIKROTIK_FEATURES_ENABLED}
          >
            <RefreshCw className="h-4 w-4" />
            {t("onlineUsers.refresh")}
          </Button>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <OnlineUsersFilters
            search={search}
            onSearchChange={setSearch}
            groupFilter={groupFilter}
            onGroupFilterChange={setGroupFilter}
            duplicateGroups={duplicateGroups}
            filteredCount={rows.length}
            withoutSubscriberOnly={withoutSubscriberOnly}
            onWithoutSubscriberChange={setWithoutSubscriberOnly}
            withoutSubscriberCount={withoutSubscriberCount}
          />
        </div>

        <div className="px-4 py-4 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Text muted className="text-sm">
              {t("onlineUsers.table.sectionSubtitle", { count: rows.length })}
            </Text>
            <Text muted className="text-xs">
              {lastSnapshot
                ? `${t("onlineUsers.lastUpdated")}: ${lastSnapshot}`
                : dataUpdatedAt
                  ? `${t("onlineUsers.lastUpdated")}: ${formatSnapshotDateTime(new Date(dataUpdatedAt).toISOString())}`
                  : null}
            </Text>
          </div>

          {showInitialLoading ? (
            <LoadingState layout="table" variant="section" />
          ) : !MIKROTIK_FEATURES_ENABLED ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <Text muted>{t("onlineUsers.vpnDisabled")}</Text>
            </div>
          ) : isError && apiRows.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <Text muted>
                {isNotConfigured ? t("onlineUsers.notConfigured") : errorMessage}
              </Text>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                {t("common.retry")}
              </Button>
            </div>
          ) : (
            <OnlineUsersTable
              rows={rows}
              hasSearch={hasActiveFilters}
              onFilterByLine={(packageLine) => setGroupFilter({ kind: "line", packageLine })}
            />
          )}
        </div>
      </section>
    </div>
  );
}
