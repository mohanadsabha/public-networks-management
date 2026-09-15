import {
  getDaysUntilDisconnect,
  isStoppedSubscriber,
  matchesSubscriberSearch,
} from "@/lib/subscriberUtils";
import type { Customer } from "@/types/customer";
import type { CustomerKind } from "@/types/customer";

export function getCustomerKind(customer: Customer): CustomerKind {
  if (isStoppedSubscriber(customer)) return "stopped";
  if (!customer.username) return "customer";
  return "subscriber";
}

/** Registered in the system, no username yet */
export function isCustomerOnly(customer: Customer): boolean {
  return !isStoppedSubscriber(customer) && !customer.username;
}

/** Negative balance = still owes the company */
export function customerOwesMoney(customer: Pick<Customer, "balance">): boolean {
  return customer.balance < 0;
}

export function getAmountOwed(customer: Pick<Customer, "balance">): number {
  return customer.balance < 0 ? Math.abs(customer.balance) : 0;
}

/** Customers/subscribers who still owe money — for Finance debt section */
export function getCustomersWithOutstandingDebt(rows: Customer[]): Customer[] {
  return rows
    .filter(customerOwesMoney)
    .sort((a, b) => a.balance - b.balance);
}

export function hasActiveUsername(customer: Customer): boolean {
  return Boolean(customer.username) && !isStoppedSubscriber(customer);
}

/** Past disconnect date — expiring cycle ended (also on Expiring page) */
export function isExpiringSubscription(customer: Customer, now = new Date()): boolean {
  if (!customer.username || isStoppedSubscriber(customer)) return false;
  const daysLeft = getDaysUntilDisconnect(customer, now);
  return daysLeft !== null && daysLeft < 0;
}

/**
 * Subscribers list + profile: has username, not stopped.
 * Includes expiring subscriptions — they stay on /subscribers, /customers, and /expiring.
 */
export function isOnSubscribersList(customer: Customer): boolean {
  return hasActiveUsername(customer);
}

/** @deprecated alias — use isOnSubscribersList */
export function isActiveSubscription(customer: Customer, now = new Date()): boolean {
  void now;
  return isOnSubscribersList(customer);
}

export type CustomerRegistryKindFilter = "all" | CustomerKind;

export function filterCustomersForRegistry(
  rows: Customer[],
  filters: {
    search: string;
    kind: CustomerRegistryKindFilter;
    speedMbps: number | "all";
  },
): Customer[] {
  return rows.filter((row) => {
    if (!matchesSubscriberSearch(row, filters.search)) return false;
    const kind = getCustomerKind(row);
    if (filters.kind !== "all" && kind !== filters.kind) return false;
    if (filters.speedMbps !== "all" && row.speedMbps !== filters.speedMbps) return false;
    return true;
  });
}

export function filterActiveSubscriptions(
  rows: Customer[],
  filters: { search: string; speedMbps: number | "all" },
): Customer[] {
  return rows.filter((row) => {
    if (!isOnSubscribersList(row)) return false;
    if (!matchesSubscriberSearch(row, filters.search)) return false;
    if (filters.speedMbps !== "all" && row.speedMbps !== filters.speedMbps) return false;
    return true;
  });
}
