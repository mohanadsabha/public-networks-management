import {
  differenceInCalendarDays,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import {
  getCustomerKind,
  isCustomerOnly,
  isExpiringSubscription,
} from "@/lib/customerUtils";
import { isOnExpiringPage } from "@/lib/expiringUtils";
import { buildSpeedLabel, isStoppedSubscriber } from "@/lib/subscriberUtils";
import { isInAvailablePool } from "@/types/availableUsername";
import type { AvailableUsername } from "@/types/availableUsername";
import type { SpeedTier } from "@/types/speeds";
import type {
  AvailableDaysCategory,
  StatisticsData,
  SubscriptionStatusKey,
} from "@/types/statistics";
import type {
  SpeedHistoryEntry,
  Subscriber,
  UsernameHistoryEntry,
} from "@/types/subscriber";

function weekInterval(now: Date) {
  const start = startOfWeek(now, { weekStartsOn: 6 });
  const end = endOfWeek(now, { weekStartsOn: 6 });
  return { start, end };
}

function inWeek(iso: string, now: Date): boolean {
  try {
    const d = parseISO(iso);
    const { start, end } = weekInterval(now);
    return isWithinInterval(d, { start, end });
  } catch {
    return false;
  }
}

function monthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

function fillDailyCounts(
  rows: Array<{ date: string }>,
  getDate: (row: { date: string }) => string,
  now: Date,
  days = 7,
): StatisticsData["charts"]["dailyNewSubscribers"] {
  const points: StatisticsData["charts"]["dailyNewSubscribers"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(now, i);
    const key = format(day, "yyyy-MM-dd");
    const count = rows.filter((row) => {
      try {
        return format(parseISO(getDate(row)), "yyyy-MM-dd") === key;
      } catch {
        return false;
      }
    }).length;
    points.push({ date: key, count });
  }
  return points;
}

function categorizeAvailableDays(row: AvailableUsername, now: Date): AvailableDaysCategory {
  if (!row.expiryDate) return "full";
  try {
    const days = differenceInCalendarDays(parseISO(row.expiryDate), now);
    if (days >= 30) return "full";
    if (days >= 15) return "half";
    if (days >= 7) return "quarter";
    return "low";
  } catch {
    return "full";
  }
}

function buildMonthlyTrend(year: number, subscribers: Subscriber[], now: Date): StatisticsData["subscription"]["monthlyTrend"] {
  const months: StatisticsData["subscription"]["monthlyTrend"] = [];
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, "0")}`;
    const inMonth = subscribers.filter((s) => {
      const ref = s.startDate ?? s.createdAt.slice(0, 10);
      try {
        return format(parseISO(ref), "yyyy-MM") === key;
      } catch {
        return false;
      }
    });

    const active = inMonth.filter(
      (s) => !isStoppedSubscriber(s) && s.username && !isOnExpiringPage(s, now),
    ).length;
    const disabled = inMonth.filter((s) => isOnExpiringPage(s, now)).length;
    const suspended = inMonth.filter((s) => isStoppedSubscriber(s)).length;

    months.push({
      month: key,
      active,
      suspended,
      disabled,
      new: inMonth.length,
    });
  }
  return months;
}

function subscriptionSummary(subscribers: Subscriber[], now: Date): StatisticsData["subscription"]["summary"] {
  const currentMonth = monthKey(now);
  const newThisMonth = subscribers.filter((s) => {
    try {
      return format(parseISO(s.createdAt), "yyyy-MM") === currentMonth;
    } catch {
      return false;
    }
  }).length;

  const active = subscribers.filter(
    (s) => !isStoppedSubscriber(s) && s.username && !isOnExpiringPage(s, now),
  ).length;
  const disabled = subscribers.filter((s) => isOnExpiringPage(s, now)).length;
  const suspended = subscribers.filter((s) => isStoppedSubscriber(s)).length;
  const total = subscribers.length;

  return { total, active, suspended, disabled, new: newThisMonth };
}

function distributionFromSummary(
  summary: StatisticsData["subscription"]["summary"],
): StatisticsData["subscription"]["distribution"] {
  const rows: Array<{ status: SubscriptionStatusKey; count: number }> = [
    { status: "new", count: summary.new },
    { status: "active", count: summary.active },
    { status: "disabled", count: summary.disabled },
    { status: "suspended", count: summary.suspended },
  ];
  return rows;
}

export interface ComputeStatisticsInput {
  subscribers: Subscriber[];
  availableUsernames: AvailableUsername[];
  speedTiers: SpeedTier[];
  usernameHistory: UsernameHistoryEntry[];
  speedHistory: SpeedHistoryEntry[];
  year: number;
  now?: Date;
}

export function computeStatisticsData(input: ComputeStatisticsInput): StatisticsData {
  const {
    subscribers,
    availableUsernames,
    speedTiers,
    usernameHistory,
    speedHistory,
    year,
    now = new Date(),
  } = input;

  const activeTiers = speedTiers.filter((tier) => !tier.deleted);
  const activeSpeedIds = new Set(activeTiers.map((tier) => tier.id));
  const poolRows = availableUsernames.filter(
    (row) => isInAvailablePool(row, now) && activeSpeedIds.has(row.speedId),
  );
  const activeList = subscribers.filter((s) => s.username && !isStoppedSubscriber(s));
  const expiringSoon = subscribers.filter(
    (s) => isOnExpiringPage(s, now) && !isExpiringSubscription(s, now),
  );
  const expired = subscribers.filter((s) => isExpiringSubscription(s, now));
  const stopped = subscribers.filter((s) => isStoppedSubscriber(s));
  const customersOnly = subscribers.filter((s) => isCustomerOnly(s));

  const monthStart = startOfMonth(now);
  const newThisMonth = subscribers.filter((s) => {
    try {
      return parseISO(s.createdAt) >= monthStart;
    } catch {
      return false;
    }
  }).length;

  const speedLabel = (mbps: number) =>
    speedTiers.find((t) => t.valueMbps === mbps)?.label ?? buildSpeedLabel(mbps);

  const subscribersBySpeedMap = new Map<number, number>();
  for (const sub of activeList) {
    subscribersBySpeedMap.set(sub.speedMbps, (subscribersBySpeedMap.get(sub.speedMbps) ?? 0) + 1);
  }

  const availableBySpeedMap = new Map<number, number>();
  for (const row of poolRows) {
    const tier = speedTiers.find((t) => t.id === row.speedId);
    const mbps = tier?.valueMbps ?? 0;
    if (mbps > 0) {
      availableBySpeedMap.set(mbps, (availableBySpeedMap.get(mbps) ?? 0) + 1);
    }
  }

  const facilityMap = new Map<string, number>();
  for (const sub of subscribers) {
    if (!sub.facilityType) continue;
    facilityMap.set(sub.facilityType, (facilityMap.get(sub.facilityType) ?? 0) + 1);
  }

  const newSubscriberDayCounts = Array.from({ length: 8 }, (_, offset) => {
    const day = subDays(now, offset);
    const key = format(day, "yyyy-MM-dd");
    const count = subscribers.filter((s) => {
      try {
        return isSameDay(parseISO(s.createdAt), day);
      } catch {
        return false;
      }
    }).length;
    return { date: key, count };
  });

  const usernameChangeDayCounts = Array.from({ length: 8 }, (_, offset) => {
    const day = subDays(now, offset);
    const key = format(day, "yyyy-MM-dd");
    const count = usernameHistory.filter((h) => {
      try {
        return isSameDay(parseISO(h.changedAt), day);
      } catch {
        return false;
      }
    }).length;
    return { date: key, count };
  });

  const dailyNewSource = subscribers.map((s) => ({ date: s.createdAt }));
  const dailyAvailableSource = availableUsernames
    .filter((u) => activeSpeedIds.has(u.speedId))
    .map((u) => ({ date: u.createdAt }));

  const breakdownBySpeed: StatisticsData["availableDaysBreakdownBySpeed"] = activeTiers.map((tier) => {
    const rowsForSpeed = poolRows.filter((r) => r.speedId === tier.id);
    const categories: AvailableDaysCategory[] = ["full", "half", "quarter", "low"];
    const breakdown = categories.map((category) => ({
      category,
      count: rowsForSpeed.filter((r) => categorizeAvailableDays(r, now) === category).length,
    }));
    return {
      speed: tier.valueMbps,
      label: tier.label,
      breakdown,
    };
  });

  const yearSubscribers = subscribers.filter((s) => {
    const ref = s.startDate ?? s.createdAt.slice(0, 10);
    try {
      return parseISO(ref).getFullYear() === year;
    } catch {
      return false;
    }
  });

  const summary = subscriptionSummary(subscribers, now);

  const customerBreakdown = {
    customer: customersOnly.length,
    subscriber: subscribers.filter((s) => getCustomerKind(s) === "subscriber" && !isOnExpiringPage(s, now))
      .length,
    expiring: subscribers.filter((s) => isOnExpiringPage(s, now)).length,
    stopped: stopped.length,
  };

  return {
    overview: {
      totalRecords: subscribers.length,
      totalSubscribers: activeList.length,
      customersOnly: customersOnly.length,
      activeSubscribers: activeList.filter((s) => !isOnExpiringPage(s, now)).length,
      totalAvailableUsernames: poolRows.length,
      expiringSubscribers: expiringSoon.length,
      expiredSubscribers: expired.length,
      stoppedSubscribers: stopped.length,
      newThisMonth,
    },
    thisWeek: {
      newSubscribers: subscribers.filter((s) => inWeek(s.createdAt, now)).length,
      availableUsernamesAdded: availableUsernames.filter(
        (u) => activeSpeedIds.has(u.speedId) && inWeek(u.createdAt, now),
      ).length,
      speedChanges: speedHistory.filter((h) => inWeek(h.changedAt, now)).length,
      usernameChanges: usernameHistory.filter((h) => inWeek(h.changedAt, now)).length,
    },
    thisMonth: { newSubscribers: newThisMonth },
    speedTiers: activeTiers.map((t) => ({
      id: t.id,
      speedMbps: t.valueMbps,
      label: t.label,
    })),
    subscribersBySpeed: [...subscribersBySpeedMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([speed, count]) => ({ speed, label: speedLabel(speed), count })),
    availableBySpeed: [...availableBySpeedMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([speed, count]) => ({ speed, label: speedLabel(speed), count })),
    facilityTypes: [...facilityMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([facilityType, count]) => ({ facilityType, count })),
    newSubscriberDayCounts,
    usernameChangeDayCounts,
    charts: {
      dailyNewSubscribers: fillDailyCounts(dailyNewSource, (r) => r.date, now),
      dailyAvailableAdded: fillDailyCounts(dailyAvailableSource, (r) => r.date, now),
    },
    availableDaysBreakdownBySpeed: breakdownBySpeed,
    customerBreakdown,
    subscription: {
      year,
      summary,
      distribution: distributionFromSummary(summary),
      monthlyTrend: buildMonthlyTrend(year, yearSubscribers.length > 0 ? yearSubscribers : subscribers, now),
    },
  };
}

export function percentOf(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
