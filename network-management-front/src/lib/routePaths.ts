import type { SubscriberProfileTab } from "@/components/pages/subscribers/SubscriberProfileTabs";

export function subscriberProfilePath(lineId: string, tab?: SubscriberProfileTab): string {
  const encoded = encodeURIComponent(lineId);
  return tab ? `/subscribers/${encoded}/${tab}` : `/subscribers/${encoded}/stats`;
}

export function customerProfilePath(lineId: string): string {
  return `/customers/${encodeURIComponent(lineId)}`;
}

/** URL segment is speed Mbps (e.g. `/available-usernames/4`), not tier id */
export function availableUsernamesPath(speedValue: number): string {
  return `/available-usernames/${speedValue}`;
}

export type SmsSection = "send" | "groups" | "logs" | "templates";

export function smsPath(section: SmsSection = "send"): string {
  return section === "send" ? "/sms" : `/sms/${section}`;
}

export const SUBSCRIBER_PROFILE_TABS: SubscriberProfileTab[] = [
  "stats",
  "username",
  "sms",
  "pricing",
  "invoices",
  "support",
  "logs",
];

export const VIEWER_SUBSCRIBER_PROFILE_TABS: SubscriberProfileTab[] = ["stats", "username"];

export function subscriberProfileTabsForRole(isViewer: boolean): SubscriberProfileTab[] {
  return isViewer ? VIEWER_SUBSCRIBER_PROFILE_TABS : SUBSCRIBER_PROFILE_TABS;
}

export function isSubscriberProfileTabAllowed(tab: SubscriberProfileTab, isViewer: boolean): boolean {
  return subscriberProfileTabsForRole(isViewer).includes(tab);
}

export function parseSubscriberProfileTab(value: string | undefined): SubscriberProfileTab | null {
  if (value && SUBSCRIBER_PROFILE_TABS.includes(value as SubscriberProfileTab)) {
    return value as SubscriberProfileTab;
  }
  return null;
}
