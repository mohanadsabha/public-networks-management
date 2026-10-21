import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SpeedTierPicker } from "@/components/pages/speeds";
import {
  AssignUsernameToSubscriberModal,
  AvailableUsernameFilters,
  AvailableUsernameFormModal,
  AvailableUsernamesTable,
  type AvailableUsernameFormValues,
  type UsernameStatusFilter,
} from "@/components/pages/available-usernames";
import { ConfirmDialog } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { DataTableSkeleton, LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useAllSpeedPoolCounts } from "@/hooks/useAllSpeedPoolCounts";
import {
  useAvailableUsernamesQuery,
  useUsernameMutations,
} from "@/hooks/useAvailableUsernames";
import { useSpeedsQuery } from "@/hooks/useSpeeds";
import { getActiveSpeedTiers } from "@/lib/mapSpeedTiers";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  getSpeedPoolCounts,
  getUsernameLifecycleStatus,
  isInAvailablePool,
} from "@/types/availableUsername";
import { availableUsernamesPath } from "@/lib/routePaths";
import { ApiError } from "@/types/api";
import type { AvailableUsername } from "@/types/availableUsername";
import type { SpeedTier } from "@/types/speeds";

type UsernameDialog =
  | { type: "add" }
  | { type: "edit"; row: AvailableUsername }
  | { type: "delete"; row: AvailableUsername }
  | { type: "assign"; row: AvailableUsername }
  | { type: "reset"; row: AvailableUsername }
  | { type: "deleteAll" };

export function AvailableUsernamesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { speedValue: speedValueParam } = useParams<{ speedValue?: string }>();
  const { canManage } = useRoleAccess();
  const { data: allSpeedTiers = [], isLoading: speedsLoading, isError: speedsError, refetch: refetchSpeeds } =
    useSpeedsQuery();

  const speedTiers = useMemo(() => getActiveSpeedTiers(allSpeedTiers), [allSpeedTiers]);

  const [statusFilter, setStatusFilter] = useState<UsernameStatusFilter>("all");
  const [dialog, setDialog] = useState<UsernameDialog | null>(null);

  const speedValueFromUrl = Number(speedValueParam);
  const matchedSpeed = speedTiers.find((tier) => tier.valueMbps === speedValueFromUrl);
  const activeSpeedId = matchedSpeed?.id ?? speedTiers[0]?.id ?? 0;

  const { countsBySpeedId } = useAllSpeedPoolCounts(speedTiers, speedTiers.length > 0);

  const {
    data: rows = [],
    isLoading: rowsLoading,
    isError: rowsError,
    error: rowsQueryError,
    refetch: refetchRows,
  } = useAvailableUsernamesQuery(activeSpeedId, speedTiers.length > 0);

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteAllMutation,
    resetCycleMutation,
  } = useUsernameMutations(activeSpeedId);

  const selectedTier =
    speedTiers.find((tier) => tier.id === activeSpeedId) ?? speedTiers[0];

  const poolListOptions = useMemo(
    () =>
      selectedTier
        ? { speedMbps: selectedTier.valueMbps, includeAssignedRenewal: true as const }
        : undefined,
    [selectedTier],
  );

  const poolRows = useMemo(
    () => rows.filter((row) => isInAvailablePool(row, new Date(), poolListOptions)),
    [rows, poolListOptions],
  );

  const poolCounts = useMemo(
    () => getSpeedPoolCounts(rows, activeSpeedId, selectedTier?.valueMbps),
    [rows, activeSpeedId, selectedTier?.valueMbps],
  );

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return poolRows;
    return poolRows.filter((row) => getUsernameLifecycleStatus(row) === statusFilter);
  }, [poolRows, statusFilter]);

  const getSpeedCounts = (speedId: number) => {
    const fromPool = countsBySpeedId.get(speedId);
    if (fromPool) {
      return fromPool;
    }
    const tier = speedTiers.find((item) => item.id === speedId);
    return {
      total: tier?.totalCount ?? 0,
      available: tier?.availableCount ?? 0,
    };
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    deleteAllMutation.isPending ||
    resetCycleMutation.isPending;

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const handleCreate = async (values: AvailableUsernameFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(t("availableUsernames.form.createSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleUpdate = async (values: AvailableUsernameFormValues) => {
    if (dialog?.type !== "edit") return;

    try {
      await updateMutation.mutateAsync({ id: dialog.row.id, values });
      toast.success(t("availableUsernames.form.updateSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async () => {
    if (dialog?.type !== "delete") return;

    try {
      await deleteMutation.mutateAsync(dialog.row.id);
      toast.success(t("availableUsernames.form.deleteSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedTier) return;

    try {
      const result = await deleteAllMutation.mutateAsync();
      toast.success(
        t("availableUsernames.form.deleteAllSuccess", {
          speed: selectedTier.label,
          count: result.deleted,
        }),
      );
      setDialog(null);
      setStatusFilter("all");
    } catch (err) {
      showError(err);
    }
  };

  const handleResetCycle = async () => {
    if (dialog?.type !== "reset") return;
    try {
      await resetCycleMutation.mutateAsync(dialog.row.id);
      toast.success(t("availableUsernames.form.resetCycleSuccess", { username: dialog.row.username }));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  if (speedsLoading) {
    return <LoadingState layout="available-usernames" variant="page" />;
  }

  if (speedsError || speedTiers.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <Text muted>{t("availableUsernames.emptyForSpeed", { speed: "" })}</Text>
        <Button variant="outline" onClick={() => refetchSpeeds()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  if (!speedValueParam) {
    return <Navigate to={availableUsernamesPath(speedTiers[0].valueMbps)} replace />;
  }

  if (speedValueParam && !matchedSpeed) {
    return <Navigate to={availableUsernamesPath(speedTiers[0].valueMbps)} replace />;
  }

  if (!selectedTier) return null;

  const deleteRow = dialog?.type === "delete" ? dialog.row : null;
  const resetRow = dialog?.type === "reset" ? dialog.row : null;
  const listError = rowsError ? rowsQueryError : null;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="min-w-0">
        <Heading as="h1">{t("availableUsernames.title")}</Heading>
        <Text muted className="mt-2">
          {t("availableUsernames.subtitle")}
        </Text>
      </div>

      <div className="space-y-3">
        <Text className="text-sm font-medium text-foreground">
          {t("availableUsernames.pickSpeed")}
        </Text>
        <SpeedTierPicker
          tiers={speedTiers}
          selectedId={activeSpeedId}
          onSelect={(tier: SpeedTier) => {
            navigate(availableUsernamesPath(tier.valueMbps));
            setStatusFilter("all");
          }}
          getCounts={getSpeedCounts}
        />
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Heading as="h2" className="text-lg sm:text-xl">
              {t("availableUsernames.sectionTitle", { speed: selectedTier.label })}
            </Heading>
            <Text muted className="mt-1.5 text-sm">
              {t("availableUsernames.sectionSubtitle", {
                speed: selectedTier.label,
                count: filteredRows.length,
                total: poolCounts.total,
              })}
            </Text>
            <Text muted className="mt-2 text-xs leading-relaxed">
              {t("availableUsernames.lifecycleHint", { days: 30 })}
            </Text>
          </div>

          {canManage ? (
            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                className="min-w-0 text-danger hover:border-danger/50 hover:bg-danger/5"
                onClick={() => setDialog({ type: "deleteAll" })}
                disabled={isSubmitting || poolCounts.total === 0}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                <span className="truncate md:hidden">
                  {t("availableUsernames.actions.deleteAll")}
                </span>
                <span className="hidden truncate md:inline">
                  {t("availableUsernames.actions.deleteAllForSpeed", {
                    speed: selectedTier.label,
                  })}
                </span>
              </Button>
              <Button
                size="sm"
                className="w-full min-w-0 sm:w-auto"
                onClick={() => setDialog({ type: "add" })}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="truncate md:hidden">
                  {t("availableUsernames.actions.add")}
                </span>
                <span className="hidden truncate md:inline">
                  {t("availableUsernames.actions.addForSpeed", { speed: selectedTier.label })}
                </span>
              </Button>
            </div>
          ) : null}
        </div>

        <AvailableUsernameFilters
          value={statusFilter}
          onChange={setStatusFilter}
          counts={poolCounts}
        />

        {rowsLoading ? (
          <DataTableSkeleton rows={7} columns={5} />
        ) : listError ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <Text muted>
              {listError instanceof ApiError ? listError.message : t("common.unexpectedError")}
            </Text>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetchRows()}>
              {t("common.retry")}
            </Button>
          </div>
        ) : filteredRows.length > 0 ? (
          <AvailableUsernamesTable
            rows={filteredRows}
            speedLabel={selectedTier.label}
            speedMbps={selectedTier.valueMbps}
            onEdit={canManage ? (row) => setDialog({ type: "edit", row }) : undefined}
            onDelete={canManage ? (row) => setDialog({ type: "delete", row }) : undefined}
            onAssign={canManage ? (row) => setDialog({ type: "assign", row }) : undefined}
            onReset={canManage ? (row) => setDialog({ type: "reset", row }) : undefined}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
            <Text muted>
              {poolRows.length === 0
                ? t("availableUsernames.emptyForSpeed", { speed: selectedTier.label })
                : t("availableUsernames.emptyForFilter")}
            </Text>
            {canManage && poolRows.length === 0 ? (
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setDialog({ type: "add" })}
              >
                <Plus className="h-4 w-4" />
                {t("availableUsernames.actions.addForSpeed", { speed: selectedTier.label })}
              </Button>
            ) : null}
          </div>
        )}
      </section>

      <AvailableUsernameFormModal
        open={dialog?.type === "add"}
        mode="add"
        speedTier={selectedTier}
        onClose={() => setDialog(null)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <AvailableUsernameFormModal
        open={dialog?.type === "edit"}
        mode="edit"
        speedTier={selectedTier}
        initialRow={dialog?.type === "edit" ? dialog.row : undefined}
        onClose={() => setDialog(null)}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />

      <AssignUsernameToSubscriberModal
        open={dialog?.type === "assign"}
        username={dialog?.type === "assign" ? dialog.row : null}
        speedLabel={selectedTier.label}
        speedMbps={selectedTier.valueMbps}
        onClose={() => setDialog(null)}
        onAssigned={() => refetchRows()}
      />

      <ConfirmDialog
        open={dialog?.type === "reset"}
        onClose={() => setDialog(null)}
        onConfirm={handleResetCycle}
        title={t("availableUsernames.form.resetCycleTitle", { username: resetRow?.username ?? "" })}
        message={t("availableUsernames.form.resetCycleMessage", {
          username: resetRow?.username ?? "",
        })}
        confirmLabel={t("availableUsernames.actions.resetCycle")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title={t("availableUsernames.form.deleteTitle")}
        message={t("availableUsernames.form.deleteMessage", {
          username: deleteRow?.username ?? "",
        })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "deleteAll"}
        onClose={() => setDialog(null)}
        onConfirm={handleDeleteAll}
        title={t("availableUsernames.form.deleteAllTitle", { speed: selectedTier.label })}
        message={t("availableUsernames.form.deleteAllMessage", {
          speed: selectedTier.label,
          count: poolCounts.total,
        })}
        confirmLabel={t("availableUsernames.actions.deleteAll")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
}
