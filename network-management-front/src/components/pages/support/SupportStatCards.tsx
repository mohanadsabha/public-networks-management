import { CheckCircle2, Clock3, Headphones, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "@/components/ui/data";
import type { SupportStats } from "@/types/supportTicket";

interface SupportStatCardsProps {
  stats: SupportStats;
}

export function SupportStatCards({ stats }: SupportStatCardsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      label: t("support.stats.open"),
      value: stats.openCount,
      hint: t("support.stats.openHint"),
      icon: Headphones,
      iconClassName: "bg-warning/10 text-warning",
    },
    {
      label: t("support.stats.inProgress"),
      value: stats.inProgressCount,
      hint: t("support.stats.inProgressHint"),
      icon: Clock3,
      iconClassName: "bg-primary/10 text-primary",
    },
    {
      label: t("support.stats.resolvedToday"),
      value: stats.resolvedTodayCount,
      hint: t("support.stats.resolvedTodayHint", { created: stats.createdTodayCount }),
      icon: CheckCircle2,
      iconClassName: "bg-success/10 text-success",
    },
    {
      label: t("support.stats.resolvedWeek"),
      value: stats.resolvedWeekCount,
      hint: t("support.stats.avgResolution", { hours: stats.avgResolutionHours }),
      icon: Timer,
      iconClassName: "bg-accent/10 text-accent",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
