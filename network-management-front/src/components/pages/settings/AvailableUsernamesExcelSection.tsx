import { Download, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ImportUsernamesModal } from "@/components/pages/available-usernames";
import { SpeedTierPicker } from "@/components/pages/speeds";
import { Button } from "@/components/ui/buttons";
import { Card } from "@/components/ui/cards";
import { LoadingState } from "@/components/ui/feedback";
import { Text } from "@/components/ui/typography";
import { useAllSpeedPoolCounts } from "@/hooks/useAllSpeedPoolCounts";
import { useUsernameMutations } from "@/hooks/useAvailableUsernames";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useSpeedsQuery } from "@/hooks/useSpeeds";
import { getActiveSpeedTiers } from "@/lib/mapSpeedTiers";
import { ApiError } from "@/types/api";
import type { SpeedTier } from "@/types/speeds";

export function AvailableUsernamesExcelSection() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const { data: allSpeedTiers = [], isLoading, isError, refetch } = useSpeedsQuery();

  const speedTiers = useMemo(() => getActiveSpeedTiers(allSpeedTiers), [allSpeedTiers]);
  const [selectedSpeedId, setSelectedSpeedId] = useState<number>(0);
  const [importOpen, setImportOpen] = useState(false);

  const activeSpeedId = selectedSpeedId || speedTiers[0]?.id || 0;
  const selectedTier = speedTiers.find((tier) => tier.id === activeSpeedId) ?? speedTiers[0];

  const { countsBySpeedId } = useAllSpeedPoolCounts(speedTiers, speedTiers.length > 0);
  const { importMutation, exportMutation } = useUsernameMutations(activeSpeedId);

  const getSpeedCounts = (speedId: number) => {
    const fromPool = countsBySpeedId.get(speedId);
    if (fromPool) return fromPool;
    const tier = speedTiers.find((item) => item.id === speedId);
    return {
      total: tier?.totalCount ?? 0,
      available: tier?.availableCount ?? 0,
    };
  };

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const handleImport = async (file: File) => {
    if (!selectedTier) return;

    try {
      const result = await importMutation.mutateAsync(file);
      if (result.skipped > 0) {
        toast.success(
          t("availableUsernames.form.importSuccessWithSkipped", {
            count: result.imported,
            skipped: result.skipped,
            speed: selectedTier.label,
          }),
        );
      } else {
        toast.success(
          t("availableUsernames.form.importSuccess", {
            count: result.imported,
            speed: selectedTier.label,
          }),
        );
      }
      setImportOpen(false);
    } catch (err) {
      showError(err);
    }
  };

  const handleExport = async () => {
    if (!selectedTier) return;

    try {
      await exportMutation.mutateAsync();
      toast.success(
        t("availableUsernames.form.exportSuccess", { speed: selectedTier.label }),
      );
    } catch (err) {
      showError(err);
    }
  };

  if (isLoading) {
    return <LoadingState layout="speed-tiers" variant="section" />;
  }

  if (isError || speedTiers.length === 0) {
    return (
      <Card className="p-5 sm:p-6">
        <Text muted>{t("settings.excel.availableUsernames.noSpeeds")}</Text>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
      </Card>
    );
  }

  const isBusy = importMutation.isPending || exportMutation.isPending;

  return (
    <section className="space-y-4">
      <Card className="space-y-4 p-4 sm:p-5">
        <Text className="text-sm font-medium text-foreground">
          {t("settings.excel.availableUsernames.pickSpeed")}
        </Text>
        <SpeedTierPicker
          tiers={speedTiers}
          selectedId={activeSpeedId}
          onSelect={(tier: SpeedTier) => setSelectedSpeedId(tier.id)}
          getCounts={getSpeedCounts}
        />

        {selectedTier ? (
          <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {t("availableUsernames.form.importHint", { speed: selectedTier.label })}
          </div>
        ) : null}

        {canManage ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setImportOpen(true)}
              disabled={isBusy || !selectedTier}
              isLoading={importMutation.isPending}
            >
              <Upload className="h-4 w-4 shrink-0" />
              {t("settings.excel.availableUsernames.importAction", {
                speed: selectedTier?.label ?? "",
              })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleExport}
              disabled={isBusy || !selectedTier}
              isLoading={exportMutation.isPending}
            >
              <Download className="h-4 w-4 shrink-0" />
              {t("settings.excel.availableUsernames.exportAction", {
                speed: selectedTier?.label ?? "",
              })}
            </Button>
          </div>
        ) : (
          <Text muted className="text-sm">{t("settings.excel.availableUsernames.adminOnly")}</Text>
        )}
      </Card>

      {selectedTier ? (
        <ImportUsernamesModal
          open={importOpen}
          speedTier={selectedTier}
          onClose={() => setImportOpen(false)}
          onImport={handleImport}
          isSubmitting={importMutation.isPending}
        />
      ) : null}
    </section>
  );
}
