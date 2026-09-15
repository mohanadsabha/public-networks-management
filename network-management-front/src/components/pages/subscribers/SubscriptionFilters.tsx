import { useTranslation } from "react-i18next";
import { FilterChipBar, FilterGroup, ListFiltersPanel, SearchField } from "@/components/ui/data";
import type { SubscriberListStatusFilter } from "@/lib/subscriberUtils";
import { cn } from "@/lib/cn";

interface SubscriptionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: SubscriberListStatusFilter;
  onStatusChange: (value: SubscriberListStatusFilter) => void;
  speedMbps: number | "all";
  onSpeedChange: (value: number | "all") => void;
  speedOptions: number[];
  className?: string;
}

const STATUS_FILTERS: SubscriberListStatusFilter[] = ["all", "active", "active_connected", "paused", "no_subscription"];

/** Active subscriptions list — search, status, speed */
export function SubscriptionFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  speedMbps,
  onSpeedChange,
  speedOptions,
  className,
}: SubscriptionFiltersProps) {
  const { t } = useTranslation();

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
          onChange={(id) => onStatusChange(id as SubscriberListStatusFilter)}
          options={STATUS_FILTERS.map((value) => ({
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
