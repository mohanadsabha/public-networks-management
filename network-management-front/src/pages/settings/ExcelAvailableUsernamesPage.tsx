import { useTranslation } from "react-i18next";
import { AvailableUsernamesExcelSection, ExcelPageShell } from "@/components/pages/settings";

export function ExcelAvailableUsernamesPage() {
  const { t } = useTranslation();

  return (
    <ExcelPageShell
      backLabel={t("settings.excel.backToExcel")}
      title={t("settings.excel.availableUsernames.pageTitle")}
      subtitle={t("settings.excel.availableUsernames.pageSubtitle")}
    >
      <AvailableUsernamesExcelSection />
    </ExcelPageShell>
  );
}
