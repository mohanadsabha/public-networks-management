import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SpeedTierCard, SpeedFormModal, type SpeedFormValues } from "@/components/pages/speeds";
import { ConfirmDialog } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { SPEEDS_QUERY_KEY, useSpeedMutations, useSpeedsQuery } from "@/hooks/useSpeeds";
import { useQueryClient } from "@tanstack/react-query";
import { getActiveSpeedTiers } from "@/lib/mapSpeedTiers";
import { setStoredFairUsageGb } from "@/lib/speedFairUsageStorage";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { ApiError } from "@/types/api";
import type { SpeedTier } from "@/types/speeds";

type SpeedDialog =
  | { type: "add" }
  | { type: "edit"; tier: SpeedTier }
  | { type: "delete"; tier: SpeedTier };

export function SpeedsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { canManage } = useRoleAccess();
  const { data: tiers = [], isLoading, isError, error, refetch } = useSpeedsQuery();
  const activeTiers = useMemo(() => getActiveSpeedTiers(tiers), [tiers]);
  const { createMutation, updateMutation, deleteMutation } = useSpeedMutations();
  const [dialog, setDialog] = useState<SpeedDialog | null>(null);

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const handleCreate = async (values: SpeedFormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        valueMbps: values.valueMbps,
        price: values.price,
      });
      setStoredFairUsageGb(created.id, values.fairUsageGb);
      await queryClient.invalidateQueries({ queryKey: SPEEDS_QUERY_KEY });
      toast.success(t("speeds.form.createSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleUpdate = async (values: SpeedFormValues) => {
    if (dialog?.type !== "edit") return;

    try {
      await updateMutation.mutateAsync({
        id: dialog.tier.id,
        valueMbps: values.valueMbps,
        price: values.price,
      });
      setStoredFairUsageGb(dialog.tier.id, values.fairUsageGb);
      await queryClient.invalidateQueries({ queryKey: SPEEDS_QUERY_KEY });
      toast.success(t("speeds.form.updateSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async () => {
    if (dialog?.type !== "delete") return;

    try {
      await deleteMutation.mutateAsync(dialog.tier.id);
      toast.success(t("speeds.form.deleteSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const deleteTier = dialog?.type === "delete" ? dialog.tier : null;
  const linkedCount = deleteTier?.activeLinkedCount ?? deleteTier?.totalCount ?? 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-4 lg:flex lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <Heading as="h1">{t("speeds.title")}</Heading>
          <Text muted className="mt-2">
            {t("speeds.subtitle")}
          </Text>
        </div>

        {canManage ? (
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setDialog({ type: "add" })}>
            <Plus className="h-4 w-4" />
            {t("speeds.actions.add")}
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingState layout="speed-tiers" variant="section" />
      ) : isError ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-card">
          <Text muted>
            {error instanceof ApiError ? error.message : t("common.unexpectedError")}
          </Text>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            {t("common.retry")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activeTiers.map((tier) => (
            <SpeedTierCard
              key={tier.id}
              tier={tier}
              showActions={canManage}
              totalCount={tier.totalCount}
              availableCount={tier.availableCount}
              onEdit={() => setDialog({ type: "edit", tier })}
              onDelete={() => setDialog({ type: "delete", tier })}
            />
          ))}
        </div>
      )}

      <Text muted className="text-sm">{t("speeds.hint")}</Text>

      <SpeedFormModal
        open={dialog?.type === "add"}
        mode="add"
        onClose={() => setDialog(null)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <SpeedFormModal
        open={dialog?.type === "edit"}
        mode="edit"
        initialTier={dialog?.type === "edit" ? dialog.tier : undefined}
        onClose={() => setDialog(null)}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title={t("speeds.form.deleteTitle")}
        message={
          linkedCount > 0
            ? t("speeds.form.deleteMessageWithUsernames", {
                speed: deleteTier?.label ?? "",
                count: linkedCount,
              })
            : t("speeds.form.deleteMessage", { speed: deleteTier?.label ?? "" })
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
      />
    </div>
  );
}
