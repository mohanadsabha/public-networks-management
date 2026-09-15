import { useTranslation } from "react-i18next";
import { SearchField } from "@/components/ui/data";

interface ActivityLogsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ActivityLogsFilters({ search, onSearchChange }: ActivityLogsFiltersProps) {
  const { t } = useTranslation();

  return (
    <SearchField
      value={search}
      onChange={onSearchChange}
      placeholder={t("activityLogs.filters.searchPlaceholder")}
      ariaLabel={t("activityLogs.filters.search")}
    />
  );
}
