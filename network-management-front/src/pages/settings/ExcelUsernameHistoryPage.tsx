import { useTranslation } from "react-i18next";
import { ExcelPageShell, UsernameHistoryExcelSection } from "@/components/pages/settings";

export function ExcelUsernameHistoryPage() {
  const { t } = useTranslation();

  return (
    <ExcelPageShell
      backLabel={t("settings.excel.backToExcel")}
      title={t("settings.excel.usernameHistory.pageTitle")}
      subtitle={t("settings.excel.usernameHistory.pageSubtitle")}
    >
      <UsernameHistoryExcelSection />
    </ExcelPageShell>
  );
}
