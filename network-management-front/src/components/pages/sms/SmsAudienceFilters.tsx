import { Building2, Hash, Users, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterChipBar, SearchField } from "@/components/ui/data";
import { cn } from "@/lib/cn";
import type { SmsAudienceFilter, SmsRecipientMode } from "@/types/sms";

const SUBSCRIBER_AUDIENCE_FILTERS: SmsAudienceFilter[] = [
  "all",
  "connected",
  "expires1Day",
  "expires2Days",
  "expiresSoon",
  "expired",
  "stopped",
  "withDebt",
];

const MODES: Array<{ id: SmsRecipientMode; icon: typeof Users }> = [
  { id: "subscribers", icon: Users },
  { id: "groups", icon: UsersRound },
  { id: "customers", icon: Building2 },
  { id: "custom", icon: Hash },
];

interface SmsAudienceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  audience: SmsAudienceFilter;
  onAudienceChange: (value: SmsAudienceFilter) => void;
  recipientMode: SmsRecipientMode;
  onRecipientModeChange: (mode: SmsRecipientMode) => void;
  className?: string;
}

export function SmsAudienceFilters({
  search,
  onSearchChange,
  audience,
  onAudienceChange,
  recipientMode,
  onRecipientModeChange,
  className,
}: SmsAudienceFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MODES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onRecipientModeChange(id)}
            className={cn(
              "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:text-sm",
              recipientMode === id
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{t(`sms.recipientMode.${id}`)}</span>
          </button>
        ))}
      </div>

      {recipientMode === "subscribers" || recipientMode === "customers" ? (
        <div className="space-y-4 rounded-xl border border-border/70 bg-gradient-to-br from-muted/20 to-transparent p-4">
          <SearchField
            value={search}
            onChange={onSearchChange}
            placeholder={t("subscribers.filters.searchPlaceholder")}
            ariaLabel={t("subscribers.filters.search")}
          />

          {recipientMode === "subscribers" ? (
            <FilterChipBar
              label={t("sms.filters.label")}
              value={audience}
              onChange={(id) => onAudienceChange(id as SmsAudienceFilter)}
              wrap
              options={SUBSCRIBER_AUDIENCE_FILTERS.map((key) => ({
                id: key,
                label: t(`sms.filters.${key}`),
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("sms.filters.customersHint")}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
