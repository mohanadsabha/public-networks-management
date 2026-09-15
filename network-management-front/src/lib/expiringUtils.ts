import { getDaysUntilDisconnect, isStoppedSubscriber } from "@/lib/subscriberUtils";
import type { Customer } from "@/types/customer";

/** Expiring page urgency filter */
export type ExpiringUrgencyFilter = "all" | "expired" | "oneDay" | "twoDays" | "soon";

const SOON_MAX_DAYS = 7;

/** Has username, not stopped — cycle ended or ends within 7 days (includes owner lines). */
export function isOnExpiringPage(customer: Customer, now = new Date()): boolean {
  if (!customer.username || isStoppedSubscriber(customer)) return false;
  const daysLeft = getDaysUntilDisconnect(customer, now);
  if (daysLeft === null) return false;
  return daysLeft <= SOON_MAX_DAYS;
}

export function getExpiringUrgencyKey(
  customer: Customer,
  now = new Date(),
): ExpiringUrgencyFilter | null {
  if (!isOnExpiringPage(customer, now)) return null;
  const daysLeft = getDaysUntilDisconnect(customer, now)!;
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 1) return "oneDay";
  if (daysLeft === 2) return "twoDays";
  if (daysLeft <= SOON_MAX_DAYS) return "soon";
  return null;
}

export function matchesExpiringFilter(
  customer: Customer,
  filter: ExpiringUrgencyFilter,
  now = new Date(),
): boolean {
  if (!isOnExpiringPage(customer, now)) return false;
  const urgency = getExpiringUrgencyKey(customer, now);
  if (!urgency) return false;
  if (filter === "all") return true;
  return urgency === filter;
}

export function filterExpiringSubscriptions(
  rows: Customer[],
  filters: { search: string; urgency: ExpiringUrgencyFilter },
  now = new Date(),
): Customer[] {
  return rows.filter((row) => {
    if (!matchesExpiringFilter(row, filters.urgency, now)) return false;
    const q = filters.search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      row.lineId,
      row.username ?? "",
      row.fullName,
      row.phone ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
