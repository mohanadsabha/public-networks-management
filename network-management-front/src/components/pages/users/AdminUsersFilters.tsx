import { useTranslation } from "react-i18next";
import { SearchField } from "@/components/ui/data";

interface AdminUsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function AdminUsersFilters({ search, onSearchChange }: AdminUsersFiltersProps) {
  const { t } = useTranslation();

  return (
    <SearchField
      value={search}
      onChange={onSearchChange}
      placeholder={t("users.filters.searchPlaceholder")}
      ariaLabel={t("users.filters.search")}
    />
  );
}
