import { Download, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ImportUsernameHistoryModal } from "@/components/pages/settings/ImportUsernameHistoryModal";
import { Button } from "@/components/ui/buttons";
import { Card } from "@/components/ui/cards";
import { Text } from "@/components/ui/typography";
import { useUsernameHistoryExcelMutations } from "@/hooks/useSubscribers";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { ApiError } from "@/types/api";

export function UsernameHistoryExcelSection() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const [importOpen, setImportOpen] = useState(false);
  const { importMutation, exportMutation } = useUsernameHistoryExcelMutations();

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
      toast.success(
        t("settings.excel.usernameHistory.importSuccess", {
          count: result.imported,
          skipped: result.skipped,
        }),
      );
      setImportOpen(false);
    } catch (err) {
      showError(err);
    }
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync();
      toast.success(t("settings.excel.usernameHistory.exportSuccess"));
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
            {t("settings.excel.usernameHistory.columnsHint")}
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            {t("settings.excel.usernameHistory.lineIdHint")}
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
              {t("settings.excel.usernameHistory.importAction")}
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
              {t("settings.excel.usernameHistory.exportAction")}
            </Button>
          </div>
        ) : (
          <Text muted className="text-sm">
            {t("settings.excel.usernameHistory.adminOnly")}
          </Text>
        )}
      </Card>

      <ImportUsernameHistoryModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        isSubmitting={importMutation.isPending}
      />
    </section>
  );
}
