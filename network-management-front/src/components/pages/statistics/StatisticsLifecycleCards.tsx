import {
  AlertTriangle,
  BarChart3,
  PlusCircle,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Heading, Text } from "@/components/ui/typography";
import { percentOf } from "@/lib/statisticsAnalytics";
import type { SubscriptionSummary } from "@/types/statistics";
import { cn } from "@/lib/cn";

interface StatisticsLifecycleCardsProps {
  summary: SubscriptionSummary;
}

type LifecycleCardKey = "total" | "new" | "disabled" | "suspended";

const CARD_STYLES: Array<{
  key: LifecycleCardKey;
  icon: typeof BarChart3;
  className: string;
  to?: string;
}> = [
  { key: "total", icon: BarChart3, className: "border-primary/20 bg-primary/5" },
  { key: "new", icon: PlusCircle, className: "border-accent/20 bg-accent/5" },
  { key: "disabled", icon: XCircle, className: "border-danger/20 bg-danger/5", to: "/expiring" },
  { key: "suspended", icon: AlertTriangle, className: "border-warning/20 bg-warning/5", to: "/stopped" },
];

export function StatisticsLifecycleCards({ summary }: StatisticsLifecycleCardsProps) {
  const { t } = useTranslation();

  const values: Record<LifecycleCardKey, number> = {
    total: summary.total,
    new: summary.new,
    disabled: summary.disabled,
    suspended: summary.suspended,
  };

  const labels: Record<LifecycleCardKey, string> = {
    total: t("statistics.lifecycle.total"),
    new: t("statistics.lifecycle.new"),
    disabled: t("statistics.lifecycle.disabled"),
    suspended: t("statistics.lifecycle.suspended"),
  };

  return (
    <section className="space-y-4">
      <div>
        <Heading as="h2" className="text-lg">
          {t("statistics.lifecycle.sectionTitle")}
        </Heading>
        <Text muted className="mt-1 text-sm">
          {t("statistics.lifecycle.sectionSubtitle")}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_STYLES.map(({ key, icon: Icon, className, to }) => {
          const value = values[key];
          const pct = key === "total" ? "100%" : percentOf(value, summary.total);

          const body = (
            <div
              className={cn(
                "flex h-full flex-col rounded-xl border px-4 py-4 transition-colors sm:px-5 sm:py-5",
                className,
                to && "hover:border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{labels[key]}</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{value}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface/80 text-foreground">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <span className="mt-3 inline-flex w-fit rounded-full bg-surface/90 px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {pct}
              </span>
            </div>
          );

          return to ? (
            <Link key={key} to={to} className="block">
              {body}
            </Link>
          ) : (
            <div key={key}>{body}</div>
          );
        })}
      </div>
    </section>
  );
}
