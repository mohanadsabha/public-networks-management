import { differenceInCalendarDays, parseISO } from "date-fns";
import { isOnExpiringPage } from "@/lib/expiringUtils";
import type { Subscriber, SubscriberLifecycleStatus } from "@/types/subscriber";

export function parseDisconnectDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  try {
    const end = parseISO(iso);
    return Number.isNaN(end.getTime()) ? null : end;
  } catch {
    return null;
  }
}

/** True when the exact end datetime has passed (not just the calendar day). */
export function isDisconnectDatePassed(iso: string | null | undefined, now = new Date()): boolean {
  const end = parseDisconnectDate(iso);
  if (!end) return false;
  return end.getTime() < now.getTime();
}

export function buildSpeedLabel(mbps: number): string {
  return `${mbps} Mbps`;
}

/** Package line from display ID — e.g. W04-101 → 4 */
export function parsePackageLineFromLineId(lineId: string): number {
  const match = /^W(\d+)-/i.exec(lineId.trim());
  if (!match) return 0;
  const parsed = parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Unique Mbps values from loaded rows (e.g. 4, 8, 16, 32). */
export function getDistinctSpeeds(rows: { speedMbps: number }[]): number[] {
  return [...new Set(rows.map((r) => r.speedMbps).filter((m) => m > 0))].sort((a, b) => a - b);
}

/** Speed tier catalog + speeds present in subscriber data (for filter chips). */
export function mergeSpeedFilterOptions(tierMbps: number[], dataMbps: number[]): number[] {
  return [...new Set([...tierMbps, ...dataMbps])].filter((m) => m > 0).sort((a, b) => a - b);
}

/** Stopped / موقوف — shown on `/stopped`, not on the main subscribers list */
export function isStoppedSubscriber(subscriber: Subscriber): boolean {
  return subscriber.isSuspended;
}

export function getDaysUntilDisconnect(subscriber: Subscriber, now = new Date()): number | null {
  if (!subscriber.disconnectionDate) return null;
  const end = parseDisconnectDate(subscriber.disconnectionDate);
  if (!end) return null;

  if (isDisconnectDatePassed(subscriber.disconnectionDate, now)) {
    const calendarDays = differenceInCalendarDays(end, now);
    return calendarDays < 0 ? calendarDays : -1;
  }

  return differenceInCalendarDays(end, now);
}

/** Username billing cycle passed (end datetime reached). */
export function isUsernameCycleExpired(subscriber: Subscriber, now = new Date()): boolean {
  if (!subscriber.username || isStoppedSubscriber(subscriber)) return false;
  if (!subscriber.disconnectionDate) return false;
  return isDisconnectDatePassed(subscriber.disconnectionDate, now);
}

export function getSubscriberLifecycleStatus(
  subscriber: Subscriber,
  now = new Date(),
): SubscriberLifecycleStatus {
  if (subscriber.isSuspended) return "suspended";
  if (!subscriber.username) return "no_subscription";
  if (isUsernameCycleExpired(subscriber, now)) return "expired";
  return "active";
}

/** Live billing cycle — usage counters apply (not expired, paused, or stopped). */
export function isSubscriberDataUsageActive(subscriber: Subscriber, now = new Date()): boolean {
  if (isStoppedSubscriber(subscriber) || subscriber.isPaused) return false;
  if (!subscriber.username) return false;
  return getSubscriberLifecycleStatus(subscriber, now) === "active";
}

/** Active subscribers only (excludes stopped / موقوف) */
export function filterActiveSubscribers(rows: Subscriber[]): Subscriber[] {
  return rows.filter((row) => !isStoppedSubscriber(row));
}

/** Matches statistics `activeSubscribers` — has username, not stopped, not in expiring window */
export function isStatisticsActiveSubscriber(subscriber: Subscriber, now = new Date()): boolean {
  if (isStoppedSubscriber(subscriber) || !subscriber.username) return false;
  return !isOnExpiringPage(subscriber, now);
}

export function isSubscriberOnline(
  subscriber: Pick<Subscriber, "username">,
  onlineUsernames: ReadonlySet<string>,
): boolean {
  const key = subscriber.username?.trim().toLowerCase();
  return Boolean(key && onlineUsernames.has(key));
}

/** Active subscribers (statistics definition) currently connected on MikroTik */
export function countConnectedStatisticsActiveSubscribers(
  rows: Subscriber[],
  onlineUsernames: ReadonlySet<string>,
  now = new Date(),
): number {
  let count = 0;
  for (const row of rows) {
    if (!isStatisticsActiveSubscriber(row, now)) continue;
    if (isSubscriberOnline(row, onlineUsernames)) count++;
  }
  return count;
}

/**
 * Order subscribers by expiry urgency: soonest-to-expire (and already expired)
 * first, newest / freshly-renewed (far end date) last. Rows without an end date
 * (e.g. customers with no active subscription) sink to the bottom.
 */
export function compareByExpiryUrgency(
  a: Subscriber,
  b: Subscriber,
  now = new Date(),
): number {
  const daysA = getDaysUntilDisconnect(a, now);
  const daysB = getDaysUntilDisconnect(b, now);

  if (daysA === null && daysB === null) return 0;
  if (daysA === null) return 1;
  if (daysB === null) return -1;
  if (daysA !== daysB) return daysA - daysB;

  // Stable tiebreaker: newer record lower in the list.
  return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
}

export function sortByExpiryUrgency<T extends Subscriber>(rows: T[], now = new Date()): T[] {
  return [...rows].sort((a, b) => compareByExpiryUrgency(a, b, now));
}

export function getUsageDays(subscriber: Subscriber, now = new Date()): number | null {
  if (!subscriber.firstContactDate) return null;
  try {
    return Math.max(0, differenceInCalendarDays(now, parseISO(subscriber.firstContactDate)));
  } catch {
    return null;
  }
}

export function matchesSubscriberSearch(subscriber: Subscriber, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    subscriber.lineId,
    subscriber.username ?? "",
    subscriber.fullName,
    subscriber.facilityType,
    subscriber.phone ?? "",
    String(subscriber.packageLine),
    subscriber.notes ?? "",
    String(subscriber.speedMbps),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

export type SubscriberListStatusFilter = "all" | "active" | "active_connected" | "paused" | "no_subscription";

export function filterSubscribers(
  rows: Subscriber[],
  filters: {
    search: string;
    status: SubscriberListStatusFilter;
    speedMbps: number | "all";
    onlineUsernames?: ReadonlySet<string>;
  },
): Subscriber[] {
  return rows.filter((row) => {
    if (isStoppedSubscriber(row)) return false;
    if (!matchesSubscriberSearch(row, filters.search)) return false;
    if (filters.status === "paused" && !row.isPaused) return false;
    if (filters.status === "active") {
      if (row.isPaused) return false;
      if (getSubscriberLifecycleStatus(row) !== "active") return false;
    }
    if (filters.status === "active_connected") {
      if (row.isPaused) return false;
      if (getSubscriberLifecycleStatus(row) !== "active") return false;
      if (!filters.onlineUsernames || !isSubscriberOnline(row, filters.onlineUsernames)) return false;
    }
    if (filters.status === "no_subscription") {
      if (row.isPaused) return false;
      if (getSubscriberLifecycleStatus(row) !== "no_subscription") return false;
    }
    if (filters.speedMbps !== "all" && row.speedMbps !== filters.speedMbps) return false;
    return true;
  });
}

export function getSubscriberListStatus(
  row: Subscriber,
  now = new Date(),
):
  | Extract<SubscriberLifecycleStatus, "active" | "expired" | "no_subscription" | "suspended">
  | "paused" {
  if (row.isSuspended) return "suspended";
  if (row.isPaused) return "paused";
  const lifecycle = getSubscriberLifecycleStatus(row, now);
  if (lifecycle === "no_subscription") return "no_subscription";
  if (lifecycle === "expired") return "expired";
  return "active";
}

export function getSubscriberInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
