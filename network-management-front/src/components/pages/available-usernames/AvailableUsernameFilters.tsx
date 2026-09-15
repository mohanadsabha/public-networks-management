import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { SpeedPoolCounts } from "@/types/availableUsername";

export type UsernameStatusFilter = "all" | "new" | "in_cooldown" | "owner";

interface AvailableUsernameFiltersProps {
  value: UsernameStatusFilter;
  onChange: (value: UsernameStatusFilter) => void;
  counts: SpeedPoolCounts;
}

export function AvailableUsernameFilters({
  value,
  onChange,
  counts,
}: AvailableUsernameFiltersProps) {
  const { t } = useTranslation();

  const filters: Array<{
    id: UsernameStatusFilter;
    label: string;
    count: number;
  }> = [
    { id: "all", label: t("availableUsernames.filters.all"), count: counts.total },
    { id: "new", label: t("availableUsernames.filters.new"), count: counts.new },
    {
      id: "in_cooldown",
      label: t("availableUsernames.filters.inCooldown"),
      count: counts.inCooldown,
    },
    { id: "owner", label: t("availableUsernames.filters.owner"), count: counts.owner },
  ];

  return (
    <div
      className={cn(
        "-mx-1 overflow-x-auto overscroll-x-contain px-1",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "sm:mx-0 sm:overflow-visible sm:px-0",
      )}
    >
      <div
        className={cn(
          "flex w-max min-w-full flex-nowrap gap-2 pb-0.5",
          "sm:w-auto sm:flex-wrap",
        )}
        role="tablist"
        aria-label={t("availableUsernames.form.status")}
      >
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={value === filter.id}
            onClick={() => onChange(filter.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              value === filter.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            <span className="whitespace-nowrap">{filter.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                value === filter.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background/80 text-muted-foreground",
              )}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
