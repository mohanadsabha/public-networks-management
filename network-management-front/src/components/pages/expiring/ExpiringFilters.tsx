import { useTranslation } from "react-i18next";
import { FilterChipBar, SearchField } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import type { ExpiringUrgencyFilter } from "@/lib/expiringUtils";

const FILTERS: ExpiringUrgencyFilter[] = ["all", "expired", "oneDay", "twoDays", "soon"];

interface ExpiringFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  urgency: ExpiringUrgencyFilter;
  onUrgencyChange: (value: ExpiringUrgencyFilter) => void;
  className?: string;
}

export function ExpiringFilters({
  search,
  onSearchChange,
  urgency,
  onUrgencyChange,
  className,
}: ExpiringFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <SearchField
        size="compact"
        value={search}
        onChange={onSearchChange}
        placeholder={t("subscribers.filters.searchPlaceholder")}
        ariaLabel={t("subscribers.filters.search")}
        className="max-w-none sm:max-w-sm lg:max-w-md"
      />

      <FilterChipBar
        size="compact"
        label={t("expiring.filters.label")}
        value={urgency}
        onChange={(id) => onUrgencyChange(id as ExpiringUrgencyFilter)}
        options={FILTERS.map((key) => ({
          id: key,
          label: t(`expiring.filters.${key}`),
        }))}
      />
    </div>
  );
}
