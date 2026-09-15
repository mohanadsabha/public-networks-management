import { useTranslation } from "react-i18next";
import { Heading, Text } from "@/components/ui/typography";
import type { AvailableDaysBreakdownRow, AvailableDaysCategory } from "@/types/statistics";
import { cn } from "@/lib/cn";

interface StatisticsPoolSectionProps {
  rows: AvailableDaysBreakdownRow[];
}

const CATEGORY_ORDER: AvailableDaysCategory[] = ["full", "half", "quarter", "low"];

const CATEGORY_BAR: Record<AvailableDaysCategory, string> = {
  full: "bg-success",
  half: "bg-accent",
  quarter: "bg-warning",
  low: "bg-danger",
};

export function StatisticsPoolSection({ rows }: StatisticsPoolSectionProps) {
  const { t } = useTranslation();

  if (rows.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <Heading as="h2" className="text-lg">
          {t("statistics.charts.poolBreakdown")}
        </Heading>
        <Text muted className="mt-1 text-sm">
          {t("statistics.charts.poolBreakdownSub")}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {rows.map((tier) => {
          const total = tier.breakdown.reduce((sum, b) => sum + b.count, 0);
          return (
            <div key={tier.speed} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{tier.label}</p>
                <span className="text-sm tabular-nums text-muted-foreground">{total}</span>
              </div>

              {total === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <div className="space-y-3">
                  {CATEGORY_ORDER.map((category) => {
                    const row = tier.breakdown.find((b) => b.category === category);
                    const count = row?.count ?? 0;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={category}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {t(`statistics.charts.days_${category}`)}
                          </span>
                          <span className="tabular-nums text-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full transition-all", CATEGORY_BAR[category])}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
