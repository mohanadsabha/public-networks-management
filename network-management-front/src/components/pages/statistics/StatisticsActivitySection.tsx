import { Gauge, RefreshCw, UserPlus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Heading, Text } from "@/components/ui/typography";
import type { StatisticsThisWeek } from "@/types/statistics";
import { cn } from "@/lib/cn";

interface StatisticsActivitySectionProps {
  thisWeek: StatisticsThisWeek;
  newThisMonth: number;
}

export function StatisticsActivitySection({
  thisWeek,
  newThisMonth,
}: StatisticsActivitySectionProps) {
  const { t } = useTranslation();

  const metrics = [
    {
      label: t("statistics.activity.newSubscribers"),
      value: thisWeek.newSubscribers,
      icon: UserPlus,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      label: t("statistics.activity.usernamesAdded"),
      value: thisWeek.availableUsernamesAdded,
      icon: Users,
      iconClassName: "bg-accent/10 text-accent",
    },
    {
      label: t("statistics.activity.speedChanges"),
      value: thisWeek.speedChanges,
      icon: Gauge,
      iconClassName: "bg-warning/10 text-warning",
    },
    {
      label: t("statistics.activity.usernameChanges"),
      value: thisWeek.usernameChanges,
      icon: RefreshCw,
      iconClassName: "bg-success/10 text-success",
    },
  ] as const;

  return (
    <section className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <Heading as="h2" className="text-lg">
          {t("statistics.activity.sectionTitle")}
        </Heading>
        <Text muted className="mt-1 text-sm">
          {t("statistics.activity.sectionSubtitle")} · {t("statistics.activity.thisMonth", { count: newThisMonth })}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center gap-4 bg-surface px-4 py-5 sm:px-6">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                metric.iconClassName,
              )}
            >
              <metric.icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
