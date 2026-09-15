import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterChipBar, FilterGroup, ListFiltersPanel, SearchField } from "@/components/ui/data";
import { Button } from "@/components/ui/buttons";
import { Text } from "@/components/ui/typography";
import type { OnlineUserDuplicateGroup, OnlineUserGroupFilter } from "@/lib/onlineUsersUtils";
import { onlineUserGroupFilterToChipId } from "@/lib/onlineUsersUtils";

interface OnlineUsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  groupFilter: OnlineUserGroupFilter;
  onGroupFilterChange: (filter: OnlineUserGroupFilter) => void;
  duplicateGroups: OnlineUserDuplicateGroup[];
  filteredCount: number;
  withoutSubscriberOnly: boolean;
  onWithoutSubscriberChange: (value: boolean) => void;
  withoutSubscriberCount: number;
}

export function OnlineUsersFilters({
  search,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  duplicateGroups,
  filteredCount,
  withoutSubscriberOnly,
  onWithoutSubscriberChange,
  withoutSubscriberCount,
}: OnlineUsersFiltersProps) {
  const { t } = useTranslation();
  const activeChipId = onlineUserGroupFilterToChipId(groupFilter);

  const chipOptions = [
    { id: "all", label: t("onlineUsers.filters.groupAll") },
    ...duplicateGroups.map((group) => ({
      id: group.id,
      label: t("onlineUsers.filters.sharedLineChip", { line: group.packageLine }),
      count: group.count,
    })),
  ];

  const activeLabel = groupFilter
    ? t("onlineUsers.filters.activeLine", {
        line: groupFilter.packageLine,
        count: filteredCount,
      })
    : null;

  return (
    <div className="space-y-3">
      <ListFiltersPanel
        search={
          <SearchField
            value={search}
            onChange={onSearchChange}
            placeholder={t("onlineUsers.filters.searchPlaceholder")}
            ariaLabel={t("onlineUsers.filters.search")}
          />
        }
      >
        <FilterGroup label={t("onlineUsers.filters.withoutSubscriber")}>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={withoutSubscriberOnly}
              onChange={(e) => onWithoutSubscriberChange(e.target.checked)}
              className="rounded border-border"
            />
            <span>
              {t("onlineUsers.filters.withoutSubscriber")}
              <span className="ms-1 text-xs text-muted-foreground">
                ({withoutSubscriberCount})
              </span>
            </span>
          </label>
        </FilterGroup>

        {duplicateGroups.length > 0 ? (
          <FilterGroup label={t("onlineUsers.filters.sharedConnections")}>
            <FilterChipBar
              size="compact"
              wrap
              value={activeChipId}
              onChange={(id) => {
                if (id === "all") {
                  onGroupFilterChange(null);
                  return;
                }
                const match = duplicateGroups.find((group) => group.id === id);
                if (!match) {
                  onGroupFilterChange(null);
                  return;
                }
                onGroupFilterChange({ kind: "line", packageLine: match.packageLine });
              }}
              options={chipOptions}
            />
          </FilterGroup>
        ) : null}
      </ListFiltersPanel>

      {activeLabel ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
          <Text className="text-sm font-medium text-foreground">{activeLabel}</Text>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onGroupFilterChange(null)}
            className="h-8 gap-1.5 px-2 text-xs"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            {t("onlineUsers.filters.clearGroup")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
