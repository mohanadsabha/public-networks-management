import {
  BarChart3,
  ClipboardList,
  Coins,
  Settings,
  Tags,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export interface HomeLinkItem {
  titleKey: string;
  descriptionKey: string;
  to: string;
  permission: string;
  icon: LucideIcon;
  /** Tailwind classes for icon tile */
  accentClass: string;
  /** Optional section: quick | admin */
  section: "quick" | "admin";
}

export const HOME_LINKS: HomeLinkItem[] = [
  {
    titleKey: "home.cards.statistics.title",
    descriptionKey: "home.cards.statistics.description",
    to: "/statistics",
    permission: "subscription_statistics.view",
    icon: BarChart3,
    accentClass: "bg-primary/15 text-primary ring-primary/20",
    section: "quick",
  },
  {
    titleKey: "home.cards.customers.title",
    descriptionKey: "home.cards.customers.description",
    to: "/customers",
    permission: "customers.view",
    icon: Users,
    accentClass: "bg-accent/15 text-accent ring-accent/20",
    section: "quick",
  },
  {
    titleKey: "home.cards.subscribers.title",
    descriptionKey: "home.cards.subscribers.description",
    to: "/subscribers",
    permission: "subscribers.view",
    icon: Users,
    accentClass: "bg-success/15 text-success ring-success/20",
    section: "quick",
  },
  {
    titleKey: "home.cards.onlineUsers.title",
    descriptionKey: "home.cards.onlineUsers.description",
    to: "/online-users",
    permission: "online_users.view",
    icon: Wifi,
    accentClass: "bg-sky-500/15 text-sky-600 ring-sky-500/20 dark:text-sky-400",
    section: "quick",
  },
  {
    titleKey: "home.cards.expiring.title",
    descriptionKey: "home.cards.expiring.description",
    to: "/expiring",
    permission: "expired.view",
    icon: ClipboardList,
    accentClass: "bg-warning/15 text-warning ring-warning/20",
    section: "quick",
  },
  {
    titleKey: "home.cards.availableUsernames.title",
    descriptionKey: "home.cards.availableUsernames.description",
    to: "/available-usernames",
    permission: "available_usernames.view",
    icon: Tags,
    accentClass: "bg-violet-500/15 text-violet-600 ring-violet-500/20 dark:text-violet-400",
    section: "quick",
  },
  {
    titleKey: "home.cards.finance.title",
    descriptionKey: "home.cards.finance.description",
    to: "/finance",
    permission: "finance.view",
    icon: Coins,
    accentClass: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
    section: "admin",
  },
  {
    titleKey: "home.cards.settings.title",
    descriptionKey: "home.cards.settings.description",
    to: "/settings",
    permission: "settings.view",
    icon: Settings,
    accentClass: "bg-muted text-muted-foreground ring-border",
    section: "admin",
  },
];
