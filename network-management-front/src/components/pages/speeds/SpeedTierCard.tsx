import { Gauge, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { resolveFairUsageGbForTier } from "@/lib/speedFairUsageStorage";
import type { SpeedTier } from "@/types/speeds";
import { cn } from "@/lib/cn";

interface SpeedTierCardProps {
  tier: SpeedTier;
  selected?: boolean;
  onSelect?: (tier: SpeedTier) => void;
  showActions?: boolean;
  onEdit?: (tier: SpeedTier) => void;
  onDelete?: (tier: SpeedTier) => void;
  onRestore?: (tier: SpeedTier) => void;
  totalCount?: number;
  availableCount?: number;
  className?: string;
}

export function SpeedTierCard({
  tier,
  selected = false,
  onSelect,
  showActions = false,
  onEdit,
  onDelete,
  onRestore,
  totalCount,
  availableCount,
  className,
}: SpeedTierCardProps) {
  const { t } = useTranslation();
  const isDeleted = tier.deleted === true;
  const total = totalCount ?? tier.totalCount ?? 0;
  const available = availableCount ?? tier.availableCount ?? 0;
  const isInteractive = Boolean(onSelect);
  const fairUsageGb = resolveFairUsageGbForTier(tier);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
            )}
          >
            <Gauge className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground">{tier.label}</p>
              {isDeleted ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("speeds.deletedBadge")}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm font-medium text-primary">
              {t("speeds.stats.price", { price: tier.price })}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("speeds.stats.total", { count: total })} ·{" "}
              {t("speeds.stats.available", { count: available })}
            </p>
            {fairUsageGb != null ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("speeds.stats.fairUsage", { gb: fairUsageGb })}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {showActions ? (
        <div className="mt-4 flex justify-end gap-1 border-t border-border pt-3">
          {isDeleted ? (
            <Button size="sm" variant="outline" onClick={() => onRestore?.(tier)}>
              {t("speeds.actions.restore")}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.edit")}
                onClick={() => onEdit?.(tier)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.delete")}
                onClick={() => onDelete?.(tier)}
              >
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </>
          )}
        </div>
      ) : null}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(tier)}
        className={cn(
          "w-full rounded-xl border bg-surface p-4 text-start shadow-card transition-all",
          "hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          selected
            ? "border-primary ring-2 ring-primary/20"
            : "border-border",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-card",
        isDeleted && "opacity-75",
        className,
      )}
    >
      {content}
    </article>
  );
}

interface SpeedTierPickerProps {
  tiers: SpeedTier[];
  selectedId: number | null;
  onSelect: (tier: SpeedTier) => void;
  getCounts?: (speedId: number) => { total: number; available: number };
  className?: string;
}

export function SpeedTierPicker({
  tiers,
  selectedId,
  onSelect,
  getCounts,
  className,
}: SpeedTierPickerProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {tiers.map((tier) => {
        const counts = getCounts?.(tier.id);
        return (
          <SpeedTierCard
            key={tier.id}
            tier={tier}
            selected={selectedId != null && tier.id === selectedId}
            onSelect={onSelect}
            totalCount={counts?.total}
            availableCount={counts?.available}
          />
        );
      })}
    </div>
  );
}
