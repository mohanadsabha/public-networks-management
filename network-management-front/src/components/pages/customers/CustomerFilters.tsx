import { useTranslation } from "react-i18next";
import { SearchField } from "@/components/ui/data";
import { cn } from "@/lib/cn";

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export function CustomerFilters({ search, onSearchChange, className }: CustomerFiltersProps) {
  const { t } = useTranslation();

  return (
    <SearchField
      size="compact"
      value={search}
      onChange={onSearchChange}
      placeholder={t("customers.filters.searchPlaceholder")}
      ariaLabel={t("customers.filters.search")}
      className={cn("max-w-none sm:max-w-sm lg:max-w-md", className)}
    />
  );
}
