import { differenceInHours, differenceInMinutes, differenceInCalendarDays } from "date-fns";
import {
  getDaysUntilDisconnect,
  isDisconnectDatePassed,
  parseDisconnectDate,
} from "@/lib/subscriberUtils";
import type { Subscriber } from "@/types/subscriber";

export function getHoursUntilDisconnect(subscriber: Subscriber, now = new Date()): number | null {
  const end = parseDisconnectDate(subscriber.disconnectionDate);
  if (!end) return null;
  if (isDisconnectDatePassed(subscriber.disconnectionDate, now)) return 0;
  return Math.max(0, differenceInHours(end, now));
}

export function getMinutesUntilDisconnect(subscriber: Subscriber, now = new Date()): number | null {
  const end = parseDisconnectDate(subscriber.disconnectionDate);
  if (!end) return null;
  if (isDisconnectDatePassed(subscriber.disconnectionDate, now)) return 0;
  return Math.max(0, differenceInMinutes(end, now));
}

export function getCalendarDaysUntilDisconnect(subscriber: Subscriber, now = new Date()): number | null {
  const end = parseDisconnectDate(subscriber.disconnectionDate);
  if (!end) return null;
  return differenceInCalendarDays(end, now);
}

type TimeLeftT = (key: string, opts?: Record<string, unknown>) => string;

/** Expiring / disconnect labels: hours/minutes on last day, expired after exact end time. */
export function formatDisconnectTimeLeft(
  t: TimeLeftT,
  subscriber: Subscriber,
  now = new Date(),
): string {
  if (!subscriber.disconnectionDate) return "—";

  const daysLeft = getDaysUntilDisconnect(subscriber, now);
  if (daysLeft === null) return "—";

  if (daysLeft < 0) {
    return t("expiring.table.daysLeftExpired", { days: Math.abs(daysLeft) });
  }

  if (daysLeft === 0) {
    const minutes = getMinutesUntilDisconnect(subscriber, now);
    if (minutes !== null && minutes < 60) {
      return t("expiring.table.minutesLeft", { minutes });
    }
    const hours = getHoursUntilDisconnect(subscriber, now);
    if (hours !== null && hours > 0) {
      return t("expiring.table.hoursLeft", { hours });
    }
    return t("expiring.table.daysLeftToday");
  }

  if (daysLeft === 1) {
    return t("expiring.table.daysLeftTomorrow");
  }

  return t("expiring.table.daysLeft", { days: daysLeft });
}
