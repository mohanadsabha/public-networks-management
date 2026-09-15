import {
  AlertTriangle,
  Clock,
  PauseCircle,
  UserCheck,
  UserPlus,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/ui/data";
import { usePermissions } from "@/hooks/usePermissions";
import type { StatisticsOverview } from "@/types/statistics";

interface StatisticsOverviewCardsProps {
  overview: StatisticsOverview;
  weekNewSubscribers: number;
  weekUsernamesAdded: number;
  connectedActiveSubscribers?: number | null;
}

export function StatisticsOverviewCards({
  overview,
  weekNewSubscribers,
  weekUsernamesAdded,
  connectedActiveSubscribers = null,
}: StatisticsOverviewCardsProps) {
  const { t } = useTranslation();
  const { can } = usePermissions();

  const cards = [
    {
      label: t("statistics.overview.totalRecords"),
      value: overview.totalRecords,
      hint: t("statistics.overview.totalRecordsHint"),
      icon: Users,
      iconClassName: "bg-primary/10 text-primary",
      to: "/customers",
      permission: "customers.view",
    },
    {
      label: t("statistics.overview.totalSubscribers"),
      value: overview.activeSubscribers,
      hint: t("statistics.overview.totalSubscribersHint"),
      icon: UserCheck,
      iconClassName: "bg-accent/10 text-accent",
      to: "/subscribers",
    },
    {
      label: t("statistics.overview.connectedSubscribers"),
      value:
        connectedActiveSubscribers === null
          ? "—"
          : connectedActiveSubscribers.toLocaleString(),
      hint:
        connectedActiveSubscribers === null
          ? t("statistics.overview.connectedUnavailableHint")
          : t("statistics.overview.connectedSubscribersHint"),
      icon: connectedActiveSubscribers === null ? WifiOff : Wifi,
      iconClassName:
        connectedActiveSubscribers === null
          ? "bg-muted/30 text-muted-foreground"
          : "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      to: "/online-users",
      permission: "online_users.view",
    },
    {
      label: t("statistics.overview.availableUsernames"),
      value: overview.totalAvailableUsernames,
      hint: t("statistics.overview.availableUsernamesHint"),
      icon: Wifi,
      iconClassName: "bg-success/10 text-success",
      to: "/available-usernames",
    },
    {
      label: t("statistics.overview.customersOnly"),
      value: overview.customersOnly,
      hint: t("statistics.overview.customersOnlyHint"),
      icon: UserPlus,
      iconClassName: "bg-muted/20 text-muted-foreground",
      to: "/customers",
      permission: "customers.view",
    },
    {
      label: t("statistics.overview.expiringSoon"),
      value: overview.expiringSubscribers,
      hint: t("statistics.overview.expiringSoonHint"),
      icon: Clock,
      iconClassName: "bg-warning/10 text-warning",
      to: "/expiring",
    },
    {
      label: t("statistics.overview.expired"),
      value: overview.expiredSubscribers,
      hint: t("statistics.overview.expiredHint"),
      icon: AlertTriangle,
      iconClassName: "bg-danger/10 text-danger",
      to: "/expiring",
    },
    {
      label: t("statistics.overview.stopped"),
      value: overview.stoppedSubscribers,
      hint: t("statistics.overview.stoppedHint"),
      icon: PauseCircle,
      iconClassName: "bg-warning/10 text-warning",
      to: "/stopped",
      permission: "disabled.view",
    },
  ];

  const visibleCards = cards.filter(
    (card) => !card.permission || can(card.permission),
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {visibleCards.map((card) => {
        const content = (
          <StatCard
            label={card.label}
            value={card.value}
            hint={
              card.to === "/subscribers"
                ? `+${weekNewSubscribers} / ${t("statistics.activity.sectionTitle")}`
                : card.to === "/available-usernames"
                  ? `+${weekUsernamesAdded} / ${t("statistics.activity.sectionTitle")}`
                  : card.hint
            }
            icon={card.icon}
            iconClassName={card.iconClassName}
          />
        );

        return (
          <Link key={card.label} to={card.to} className="block transition-opacity hover:opacity-90">
            {content}
          </Link>
        );
      })}
    </div>
  );
}
