import { resolveUsageLimitMb } from "@/lib/speedFairUsage";
import { isStoppedSubscriber } from "@/lib/subscriberUtils";
import type { Subscriber } from "@/types/subscriber";

export type UsageLevel = "over" | "critical" | "high" | "normal" | "unknown";

/** Thresholds (percent of quota) for flagging consumption. */
export const USAGE_CRITICAL_PERCENT = 90;
export const USAGE_HIGH_PERCENT = 75;

export interface SubscriberUsageRow {
  id: number;
  lineId: string;
  fullName: string;
  username: string | null;
  phone: string | null;
  speedMbps: number;
  speedId: number | null;
  usedMb: number;
  limitMb: number | null;
  /** 0–100+ when a limit is known, otherwise null. */
  percent: number | null;
  remainingMb: number | null;
  level: UsageLevel;
}

export function getUsageLevel(percent: number | null): UsageLevel {
  if (percent == null) return "unknown";
  if (percent >= 100) return "over";
  if (percent >= USAGE_CRITICAL_PERCENT) return "critical";
  if (percent >= USAGE_HIGH_PERCENT) return "high";
  return "normal";
}

export function toSubscriberUsageRow(subscriber: Subscriber): SubscriberUsageRow {
  const usedMb = Math.max(0, subscriber.totalUsage ?? 0);
  const limitMb = resolveUsageLimitMb(
    subscriber.usageLimit,
    subscriber.speedMbps,
    subscriber.speedId ?? undefined,
  );
  const percent =
    limitMb != null && limitMb > 0 ? Math.round((usedMb / limitMb) * 100) : null;
  const remainingMb = limitMb != null && limitMb > 0 ? Math.max(0, limitMb - usedMb) : null;

  return {
    id: subscriber.id,
    lineId: subscriber.lineId,
    fullName: subscriber.fullName,
    username: subscriber.username,
    phone: subscriber.phone,
    speedMbps: subscriber.speedMbps,
    speedId: subscriber.speedId ?? null,
    usedMb,
    limitMb,
    percent,
    remainingMb,
    level: getUsageLevel(percent),
  };
}

/** Active subscribers (not stopped) that have a linked username, mapped to usage rows. */
export function buildSubscriberUsageRows(subscribers: Subscriber[]): SubscriberUsageRow[] {
  return subscribers
    .filter((s) => !isStoppedSubscriber(s) && Boolean(s.username))
    .map(toSubscriberUsageRow);
}

export type UsageLevelFilter = "all" | "over" | "critical_up" | "high_up";

export function matchesUsageLevelFilter(row: SubscriberUsageRow, filter: UsageLevelFilter): boolean {
  switch (filter) {
    case "over":
      return row.level === "over";
    case "critical_up":
      return row.level === "over" || row.level === "critical";
    case "high_up":
      return row.level === "over" || row.level === "critical" || row.level === "high";
    default:
      return true;
  }
}

export function matchesUsageSearch(row: SubscriberUsageRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [row.lineId, row.fullName, row.username ?? "", row.phone ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

/** Sort heaviest first: by percent when known, then by raw usage. */
export function sortByConsumption(rows: SubscriberUsageRow[]): SubscriberUsageRow[] {
  return [...rows].sort((a, b) => {
    if (a.percent != null && b.percent != null && a.percent !== b.percent) {
      return b.percent - a.percent;
    }
    if (a.percent != null && b.percent == null) return -1;
    if (a.percent == null && b.percent != null) return 1;
    return b.usedMb - a.usedMb;
  });
}

export interface UsageSummary {
  trackedCount: number;
  overCount: number;
  criticalCount: number;
  highCount: number;
  totalUsedMb: number;
}

export function summarizeUsage(rows: SubscriberUsageRow[]): UsageSummary {
  let overCount = 0;
  let criticalCount = 0;
  let highCount = 0;
  let totalUsedMb = 0;

  for (const row of rows) {
    totalUsedMb += row.usedMb;
    if (row.level === "over") overCount++;
    else if (row.level === "critical") criticalCount++;
    else if (row.level === "high") highCount++;
  }

  return {
    trackedCount: rows.length,
    overCount,
    criticalCount,
    highCount,
    totalUsedMb,
  };
}
