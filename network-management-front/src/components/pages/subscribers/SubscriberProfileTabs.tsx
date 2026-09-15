import { Banknote, FileText, Gauge, Headphones, History, MessageSquare, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { subscriberProfilePath } from "@/lib/routePaths";
import { cn } from "@/lib/cn";

export type SubscriberProfileTab = "stats" | "username" | "sms" | "pricing" | "invoices" | "support" | "logs";

const ALL_TABS: { id: SubscriberProfileTab; icon: typeof Gauge }[] = [
  { id: "stats", icon: Gauge },
  { id: "username", icon: User },
  { id: "sms", icon: MessageSquare },
  { id: "pricing", icon: Banknote },
  { id: "invoices", icon: FileText },
  { id: "support", icon: Headphones },
  { id: "logs", icon: History },
];

interface SubscriberProfileTabsProps {
  lineId: string;
  visibleTabs?: SubscriberProfileTab[];
}

export function SubscriberProfileTabs({ lineId, visibleTabs }: SubscriberProfileTabsProps) {
  const { t } = useTranslation();

  if (!lineId.trim()) return null;

  const tabs = visibleTabs
    ? ALL_TABS.filter((tab) => visibleTabs.includes(tab.id))
    : ALL_TABS;

  return (
    <nav
      className="flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-muted/25 p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={t("subscribers.profile.formSection")}
    >
      {tabs.map(({ id, icon: Icon }) => (
        <NavLink
          key={id}
          to={subscriberProfilePath(lineId, id)}
          end
          className={({ isActive }) =>
            cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          {t(`subscribers.profile.tabs.${id}`)}
        </NavLink>
      ))}
    </nav>
  );
}
