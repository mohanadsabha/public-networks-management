import {
  Activity,
  BarChart3,
  ClipboardList,
  Coins,
  FileSpreadsheet,
  Gauge,
  Headphones,
  Home,
  MessageSquare,
  Router,
  Settings,
  Shield,
  ShieldAlert,
  Tags,
  UserCog,
  Users,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DashboardNavItem {
  labelKey: `nav.items.${string}`;
  to: string;
  icon: LucideIcon;
  permission?: string;
}

/** Read-only role — sidebar whitelist */
export const viewerNavItems: DashboardNavItem[] = [
  { labelKey: "nav.items.home", to: "/", icon: Home },
  {
    labelKey: "nav.items.statistics",
    to: "/statistics",
    icon: BarChart3,
    permission: "subscription_statistics.view",
  },
  { labelKey: "nav.items.subscribers", to: "/subscribers", icon: Users, permission: "subscribers.view" },
  { labelKey: "nav.items.onlineUsers", to: "/online-users", icon: Wifi, permission: "online_users.view" },
  { labelKey: "nav.items.usage", to: "/usage", icon: Activity, permission: "subscribers.view" },
  { labelKey: "nav.items.expiring", to: "/expiring", icon: ClipboardList, permission: "expired.view" },
  {
    labelKey: "nav.items.availableUsernames",
    to: "/available-usernames",
    icon: Tags,
    permission: "available_usernames.view",
  },
  { labelKey: "nav.items.canceled", to: "/stopped", icon: Users, permission: "disabled.view" },
];

/** Admin / manager — full operations menu (logs & users live under Settings) */
export const adminNavItems: DashboardNavItem[] = [
  { labelKey: "nav.items.home", to: "/", icon: Home },
  {
    labelKey: "nav.items.statistics",
    to: "/statistics",
    icon: BarChart3,
    permission: "subscription_statistics.view",
  },
  { labelKey: "nav.items.customers", to: "/customers", icon: Users, permission: "customers.view" },
  { labelKey: "nav.items.subscribers", to: "/subscribers", icon: Users, permission: "subscribers.view" },
  { labelKey: "nav.items.onlineUsers", to: "/online-users", icon: Wifi, permission: "online_users.view" },
  { labelKey: "nav.items.usage", to: "/usage", icon: Activity, permission: "subscribers.view" },
  { labelKey: "nav.items.expiring", to: "/expiring", icon: ClipboardList, permission: "expired.view" },
  { labelKey: "nav.items.canceled", to: "/stopped", icon: Users, permission: "disabled.view" },
  { labelKey: "nav.items.speeds", to: "/speeds", icon: Gauge, permission: "speeds.view" },
  {
    labelKey: "nav.items.availableUsernames",
    to: "/available-usernames",
    icon: Tags,
    permission: "available_usernames.view",
  },
  { labelKey: "nav.items.sms", to: "/sms", icon: MessageSquare, permission: "sms.view" },
  { labelKey: "nav.items.support", to: "/support", icon: Headphones, permission: "support.view" },
  { labelKey: "nav.items.finance", to: "/finance", icon: Coins, permission: "finance.view" },
  { labelKey: "nav.items.settings", to: "/settings", icon: Settings, permission: "settings.view" },
];

/** @deprecated Use viewerNavItems / adminNavItems */
export const dashboardNavItems = adminNavItems;

export function getDashboardNavItems(isViewer: boolean): DashboardNavItem[] {
  if (isViewer) {
    return viewerNavItems.filter((item) => item.to !== "/customers");
  }
  return adminNavItems;
}

export interface SettingsHubItem {
  titleKey: string;
  descriptionKey: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
  badgeKey?: string;
  /** Hide from settings hub unless the user can perform admin write actions */
  requiresManage?: boolean;
}

export const settingsHubItems: SettingsHubItem[] = [
  {
    titleKey: "settings.hub.logs.title",
    descriptionKey: "settings.hub.logs.description",
    to: "/logs",
    icon: ClipboardList,
    permission: "logs.view",
  },
  {
    titleKey: "settings.hub.data.title",
    descriptionKey: "settings.hub.data.description",
    to: "/settings/data",
    icon: ShieldAlert,
    permission: "settings.view",
    requiresManage: true,
  },
  {
    titleKey: "settings.hub.excel.title",
    descriptionKey: "settings.hub.excel.description",
    to: "/settings/excel",
    icon: FileSpreadsheet,
    permission: "settings.view",
  },
  {
    titleKey: "settings.hub.routers.title",
    descriptionKey: "settings.hub.routers.description",
    to: "/settings/routers",
    icon: Router,
    permission: "settings.view",
  },
  {
    titleKey: "settings.hub.vpn.title",
    descriptionKey: "settings.hub.vpn.description",
    to: "/settings/vpn",
    icon: Shield,
    permission: "settings.view",
  },
  {
    titleKey: "settings.hub.users.title",
    descriptionKey: "settings.hub.users.description",
    to: "/users",
    icon: UserCog,
    permission: "users.view",
  },
];
