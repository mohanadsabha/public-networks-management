import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ExpiringFilters, ExpiringTable } from "@/components/pages/expiring";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useExpiringSubscribersQuery } from "@/hooks/useSubscribers";
import {
  filterExpiringSubscriptions,
  type ExpiringUrgencyFilter,
} from "@/lib/expiringUtils";
import { sortByExpiryUrgency } from "@/lib/subscriberUtils";
import { subscribersService } from "@/services/subscribers.service";
import { ApiError } from "@/types/api";

export function ExpiringPage() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const [search, setSearch] = useState("");
  const [urgency, setUrgency] = useState<ExpiringUrgencyFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const { data: apiRows = [], isLoading, isError, error, refetch } = useExpiringSubscribersQuery(search);

  const rows = useMemo(
    () => sortByExpiryUrgency(filterExpiringSubscriptions(apiRows, { search, urgency })),
    [apiRows, search, urgency],
  );

  useEffect(() => {
    setSelectedIds((prev) => {
      const visible = new Set(rows.map((row) => row.id));
      const next = new Set<number>();
      for (const id of prev) {
        if (visible.has(id)) next.add(id);
      }
      return next;
    });
  }, [rows]);

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(rows.map((row) => row.id)) : new Set());
  };

  const handleExport = async () => {
    const ids =
      selectedIds.size > 0 ? [...selectedIds] : rows.map((row) => row.id);

    if (ids.length === 0) {
      toast.error(t("expiring.table.exportEmpty"));
      return;
    }

    setIsExporting(true);
    try {
      await subscribersService.exportExpiringExcel(ids);
      toast.success(t("expiring.table.exportSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    } finally {
      setIsExporting(false);
    }
  };

  const exportLabel =
    selectedIds.size > 0
      ? t("expiring.table.exportSelectedCount", { count: selectedIds.size })
      : rows.length > 0
        ? t("expiring.table.exportAllCount", { count: rows.length })
        : t("expiring.table.exportSelected");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading as="h1">{t("expiring.title")}</Heading>
          <Text muted className="mt-2 max-w-2xl">
            {t("expiring.subtitle")}
          </Text>
        </div>

        {canManage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={rows.length === 0 || isLoading}
            isLoading={isExporting}
            className="shrink-0"
          >
            <Download className="h-4 w-4" />
            {exportLabel}
          </Button>
        ) : null}
      </div>

      <section className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <ExpiringFilters
            search={search}
            onSearchChange={setSearch}
            urgency={urgency}
            onUrgencyChange={setUrgency}
          />
        </div>

        <div className="px-4 py-4 sm:px-6">
          <Text muted className="mb-4 text-sm">
            {t("expiring.table.sectionSubtitle", { count: rows.length })}
          </Text>

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
            <ExpiringTable
              rows={rows}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
            />
          )}
        </div>
      </section>
    </div>
  );
}
