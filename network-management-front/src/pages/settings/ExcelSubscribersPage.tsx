import { useTranslation } from "react-i18next";
import { ExcelPageShell, SubscribersExcelSection } from "@/components/pages/settings";

export function ExcelSubscribersPage() {
  const { t } = useTranslation();

  return (
    <ExcelPageShell
      backLabel={t("settings.excel.backToExcel")}
      title={t("settings.excel.subscribers.pageTitle")}
      subtitle={t("settings.excel.subscribers.pageSubtitle")}
    >
      <SubscribersExcelSection />
    </ExcelPageShell>
  );
}
