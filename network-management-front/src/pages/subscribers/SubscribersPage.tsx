import { RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  SubscriberFormModal,
  SubscribersTable,
  SubscriptionFilters,
  type SubscriberFormValues,
} from "@/components/pages/subscribers";
import { ConfirmDialog } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useOnlineUsersQuery } from "@/hooks/useOnlineUsers";
import { useSubscriberListMutations, useSubscribersQuery } from "@/hooks/useSubscribers";
import { useSpeedsQuery } from "@/hooks/useSpeeds";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { isOnSubscribersList } from "@/lib/customerUtils";
import { buildOnlineIpByUsername, buildOnlineUsernameSet } from "@/lib/onlineUsersUtils";
import { MIKROTIK_FEATURES_ENABLED } from "@/lib/vpnConfig";
import {
  type SubscriberListStatusFilter,
  filterSubscribers,
  getDistinctSpeeds,
  mergeSpeedFilterOptions,
  sortByExpiryUrgency,
} from "@/lib/subscriberUtils";
import { ApiError } from "@/types/api";
import type { Subscriber } from "@/types/subscriber";

type Dialog =
  | { type: "edit"; row: Subscriber }
  | { type: "delete"; row: Subscriber }
  | { type: "deleteBulk" };

export function SubscribersPage() {
  const { t } = useTranslation();
  const { canManage, canViewPasswords } = useRoleAccess();
  const { can } = usePermissions();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriberListStatusFilter>("all");
  const [speedMbps, setSpeedMbps] = useState<number | "all">("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dialog, setDialog] = useState<Dialog | null>(null);

  const { data: speeds = [] } = useSpeedsQuery();
  const listParams = {
    suspended: false as const,
    expired: false as const,
    includePaused: true as const,
    search: search.trim() || undefined,
  };

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscribersQuery({
    ...listParams,
    speed: speedMbps === "all" ? undefined : speedMbps,
  });

  const { data: rowsForSpeedOptions = [] } = useSubscribersQuery(listParams, {
    enabled: speedMbps !== "all",
  });

  const { updateMutation, deleteMutation } = useSubscriberListMutations();

  const {
    data: onlineUsers = [],
    refetch: refetchOnlineUsers,
    isFetching: isOnlineRefreshing,
  } = useOnlineUsersQuery({
    enabled: MIKROTIK_FEATURES_ENABLED,
    refetchIntervalMs: false,
  });
  const onlineIpByUsername = useMemo(() => buildOnlineIpByUsername(onlineUsers), [onlineUsers]);
  const onlineUsernames = useMemo(() => buildOnlineUsernameSet(onlineUsers), [onlineUsers]);

  const filteredRows = useMemo(() => {
    const onList = rows.filter((row) => isOnSubscribersList(row));
    const matched = filterSubscribers(onList, { search, status, speedMbps, onlineUsernames });
    return sortByExpiryUrgency(matched);
  }, [rows, search, status, speedMbps, onlineUsernames]);

  const speedOptions = useMemo(
    () =>
      mergeSpeedFilterOptions(
        speeds.map((s) => s.valueMbps),
        getDistinctSpeeds(speedMbps === "all" ? rows : rowsForSpeedOptions),
      ),
    [speeds, rows, rowsForSpeedOptions, speedMbps],
  );

  const isSubmitting = updateMutation.isPending || deleteMutation.isPending;

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    else setSelectedIds(new Set());
  };

  const handleEdit = async (values: SubscriberFormValues) => {
    if (dialog?.type !== "edit") return;
    try {
      await updateMutation.mutateAsync({
        id: dialog.row.id,
        values: {
          fullName: values.fullName,
          facilityType: values.facilityType,
          phone: values.phone || null,
          notes: values.notes || null,
        },
      });
      toast.success(t("subscribers.form.updateSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async () => {
    if (dialog?.type !== "delete") return;
    try {
      await deleteMutation.mutateAsync(dialog.row.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(dialog.row.id);
        return next;
      });
      toast.success(t("subscribers.form.deleteSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteBulk = async () => {
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
      setSelectedIds(new Set());
      toast.success(t("subscribers.form.deleteBulkSuccess", { count: ids.length }));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading as="h1">{t("subscribers.title")}</Heading>
          <Text muted className="mt-2 max-w-2xl">
            {t("subscribers.subtitle")}
          </Text>
        </div>

        {MIKROTIK_FEATURES_ENABLED ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchOnlineUsers()}
            isLoading={isOnlineRefreshing}
            className="shrink-0 self-start"
          >
            <RefreshCw className="h-4 w-4" />
            {t("subscribers.actions.refreshOnline")}
          </Button>
        ) : null}
      </div>

      <section className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border/70 bg-muted/10 px-2 py-2.5 sm:px-3 lg:px-3">
          <SubscriptionFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            speedMbps={speedMbps}
            onSpeedChange={setSpeedMbps}
            speedOptions={speedOptions}
          />
        </div>

        <div className="px-2 py-3 sm:px-3 sm:py-4 lg:px-3">
          <Text muted className="mb-3 text-sm">
            {t("subscribers.table.sectionSubtitle", { count: filteredRows.length })}
          </Text>

          {canManage && selectedIds.size > 0 ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <Text className="text-sm">
                {t("subscribers.table.selectedCount", { count: selectedIds.size })}
              </Text>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  {t("common.cancel")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDialog({ type: "deleteBulk" })}>
                  <Trash2 className="h-4 w-4" />
                  {t("subscribers.actions.deleteSelected", { count: selectedIds.size })}
                </Button>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingState
              layout="subscribers-table"
              variant="section"
              showCheckboxes={canManage}
              showPasswordColumn={canViewPasswords}
            />
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
            <SubscribersTable
              rows={filteredRows}
              onlineIpByUsername={onlineIpByUsername}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              showCheckboxes={canManage}
              onEdit={canManage ? (row) => setDialog({ type: "edit", row }) : undefined}
              onDelete={canManage ? (row) => setDialog({ type: "delete", row }) : undefined}
            />
          )}
        </div>
      </section>

      <Text muted className="text-xs">
        {t("subscribers.registryHint")}
        {can("customers.view") ? (
          <>
            {" "}
            <Link to="/customers" className="font-medium text-foreground underline-offset-2 hover:underline">
              {t("nav.items.customers")}
            </Link>
          </>
        ) : null}
        {" · "}
        {t("subscribers.expiringPageHint")}{" "}
        <Link to="/expiring" className="font-medium text-foreground underline-offset-2 hover:underline">
          {t("nav.items.expiring")}
        </Link>
        {can("disabled.view") ? (
          <>
            {" · "}
            {t("subscribers.stoppedPageHint")}{" "}
            <Link to="/stopped" className="font-medium text-foreground underline-offset-2 hover:underline">
              {t("nav.items.canceled")}
            </Link>
          </>
        ) : null}
      </Text>

      <SubscriberFormModal
        open={dialog?.type === "edit"}
        mode="edit"
        initial={dialog?.type === "edit" ? dialog.row : undefined}
        onClose={() => setDialog(null)}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title={t("subscribers.form.deleteTitle")}
        message={t("subscribers.form.deleteMessage", {
          lineId: dialog?.type === "delete" ? dialog.row.lineId : "",
        })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "deleteBulk"}
        onClose={() => setDialog(null)}
        onConfirm={handleDeleteBulk}
        title={t("subscribers.form.deleteBulkTitle")}
        message={t("subscribers.form.deleteBulkMessage", { count: selectedIds.size })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
        variant="danger"
      />

    </div>
  );
}
