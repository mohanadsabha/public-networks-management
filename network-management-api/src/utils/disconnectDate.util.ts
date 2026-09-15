import { differenceInCalendarDays } from "date-fns";

export function parseDisconnectDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const end = value instanceof Date ? value : new Date(value);
  return Number.isNaN(end.getTime()) ? null : end;
}

/** True when the exact end datetime has passed (matches username pool expiry). */
export function isDisconnectDatePassed(
  endDate: Date | string | null | undefined,
  now = new Date(),
): boolean {
  const end = parseDisconnectDate(endDate);
  if (!end) return false;
  return end.getTime() < now.getTime();
}

/**
 * Calendar days until disconnect. When the end time passed earlier today,
 * returns -1 so callers treat the cycle as expired (not "0 days left").
 */
export function getDaysUntilDisconnect(
  endDate: Date | string | null | undefined,
  now = new Date(),
): number | null {
  const end = parseDisconnectDate(endDate);
  if (!end) return null;

  if (isDisconnectDatePassed(end, now)) {
    const calendarDays = differenceInCalendarDays(end, now);
    return calendarDays < 0 ? calendarDays : -1;
  }

  return differenceInCalendarDays(end, now);
}
