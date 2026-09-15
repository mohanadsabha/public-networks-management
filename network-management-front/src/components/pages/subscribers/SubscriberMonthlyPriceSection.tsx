import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/cn";
import type { SubscriberProfilePatch } from "@/hooks/useSubscribers";

interface SubscriberMonthlyPriceSectionProps {
  monthlyPrice: number;
  canManage?: boolean;
  onSave?: (patch: SubscriberProfilePatch) => void | Promise<void>;
  isSubmitting?: boolean;
}

function formatPriceField(price: number): string {
  if (!Number.isFinite(price) || price < 0) return "";
  return String(price);
}

export function SubscriberMonthlyPriceSection({
  monthlyPrice,
  canManage = false,
  onSave,
  isSubmitting = false,
}: SubscriberMonthlyPriceSectionProps) {
  const { t } = useTranslation();
  const [priceInput, setPriceInput] = useState(formatPriceField(monthlyPrice));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPriceInput(formatPriceField(monthlyPrice));
    setError(null);
  }, [monthlyPrice]);

  const handleSave = async () => {
    if (!onSave) return;
    const raw = priceInput.trim();
    if (raw === "") {
      setError(t("subscribers.profile.monthlyPriceRequired"));
      return;
    }
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError(t("subscribers.profile.monthlyPriceInvalid"));
      return;
    }
    if (parsed === monthlyPrice) return;
    setError(null);
    await onSave({ monthlyPrice: parsed });
  };

  const dirty = priceInput.trim() !== formatPriceField(monthlyPrice);

  return (
    <section className="rounded-xl border border-border bg-surface px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {t("subscribers.profile.monthlyPriceSectionTitle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("subscribers.profile.monthlyPriceHint")}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              dir="ltr"
              disabled={!canManage || isSubmitting}
              value={priceInput}
              onChange={(e) => {
                setPriceInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canManage && dirty) {
                  e.preventDefault();
                  void handleSave();
                }
              }}
              aria-label={t("subscribers.profile.monthlyPriceLabel")}
              className={cn(
                "h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 text-end text-base font-semibold tabular-nums text-foreground",
                "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                "disabled:cursor-not-allowed disabled:opacity-60",
                error ? "border-danger" : "border-border",
              )}
            />
            <span className="shrink-0 text-sm font-medium text-muted-foreground">₪</span>
            {canManage && onSave && dirty ? (
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={handleSave}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {t("common.save")}
              </Button>
            ) : null}
          </div>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
