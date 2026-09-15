import { useTranslation } from "react-i18next";
import { FilterChipBar, FilterGroup, ListFiltersPanel, SearchField } from "@/components/ui/data";
import type { SubscriberListStatusFilter } from "@/lib/subscriberUtils";
import { cn } from "@/lib/cn";

export type SubscriberStatusFilter = SubscriberListStatusFilter;

interface SubscriberFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: SubscriberStatusFilter;
  onStatusChange: (value: SubscriberStatusFilter) => void;
  speedMbps: number | "all";
  onSpeedChange: (value: number | "all") => void;
  speedOptions: number[];
  className?: string;
}

export function SubscriberFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  speedMbps,
  onSpeedChange,
  speedOptions,
  className,
}: SubscriberFiltersProps) {
  const { t } = useTranslation();

  const statusFilters: SubscriberStatusFilter[] = ["all", "active", "paused", "no_subscription"];

  return (
    <ListFiltersPanel
      className={cn(className)}
      search={
        <SearchField
          size="compact"
          value={search}
          onChange={onSearchChange}
          placeholder={t("subscribers.filters.searchPlaceholder")}
          ariaLabel={t("subscribers.filters.search")}
          className="max-w-none sm:max-w-sm lg:max-w-md"
        />
      }
    >
      <FilterGroup label={t("subscribers.filters.status")}>
        <FilterChipBar
          size="compact"
          value={status}
          onChange={(id) => onStatusChange(id as SubscriberStatusFilter)}
          options={statusFilters.map((value) => ({
            id: value,
            label: t(`subscribers.filters.status_${value}`),
          }))}
        />
      </FilterGroup>

      <FilterGroup label={t("subscribers.filters.speed")}>
        <FilterChipBar
          size="compact"
          value={speedMbps === "all" ? "all" : String(speedMbps)}
          onChange={(id) => onSpeedChange(id === "all" ? "all" : Number(id))}
          options={[
            { id: "all", label: t("common.all") },
            ...speedOptions.map((mbps) => ({
              id: String(mbps),
              label: `${mbps}M`,
            })),
          ]}
        />
      </FilterGroup>
    </ListFiltersPanel>
  );
}
