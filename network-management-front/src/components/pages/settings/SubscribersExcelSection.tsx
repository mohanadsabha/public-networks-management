import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ImportSubscribersModal } from "@/components/pages/settings/ImportSubscribersModal";
import { Button } from "@/components/ui/buttons";
import { Card } from "@/components/ui/cards";
import { Text } from "@/components/ui/typography";
import { useSubscriberExcelMutations } from "@/hooks/useSubscribers";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { ApiError } from "@/types/api";

export function SubscribersExcelSection() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const [importOpen, setImportOpen] = useState(false);
  const { importMutation, exportMutation } = useSubscriberExcelMutations();

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
    try {
      const result = await importMutation.mutateAsync(file);
      if (result.updated > 0 && result.imported > 0) {
        toast.success(
          t("settings.excel.subscribers.importSuccessMixed", {
            imported: result.imported,
            updated: result.updated,
            skipped: result.skipped,
          }),
        );
      } else if (result.updated > 0) {
        toast.success(
          t("settings.excel.subscribers.importSuccessUpdated", {
            count: result.updated,
            skipped: result.skipped,
          }),
        );
      } else {
        toast.success(
          t("settings.excel.subscribers.importSuccess", {
            count: result.imported,
            skipped: result.skipped,
          }),
        );
      }
      setImportOpen(false);
    } catch (err) {
      showError(err);
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
      toast.success(t("settings.excel.subscribers.exportSuccess"));
    } catch (err) {
      showError(err);
    }
  };

  const isBusy = importMutation.isPending || exportMutation.isPending;

  return (
    <section className="space-y-4">
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="space-y-3">
          <div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {t("settings.excel.subscribers.columnsHint")}
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            {t("settings.excel.subscribers.lineIdHint")}
          </div>
        </div>

        {canManage ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setImportOpen(true)}
              disabled={isBusy}
              isLoading={importMutation.isPending}
            >
              <Upload className="h-4 w-4 shrink-0" />
              {t("settings.excel.subscribers.importAction")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleExport}
              disabled={isBusy}
              isLoading={exportMutation.isPending}
            >
              <Download className="h-4 w-4 shrink-0" />
              {t("settings.excel.subscribers.exportAction")}
            </Button>
          </div>
        ) : (
          <Text muted className="text-sm">
            {t("settings.excel.subscribers.adminOnly")}
          </Text>
        )}
      </Card>

      <ImportSubscribersModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        isSubmitting={importMutation.isPending}
      />
    </section>
  );
}
