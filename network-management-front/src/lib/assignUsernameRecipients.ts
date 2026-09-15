import { isOnExpiringPage } from "@/lib/expiringUtils";
import { getDaysUntilDisconnect, isStoppedSubscriber } from "@/lib/subscriberUtils";
import { isCustomerOnly } from "@/lib/customerUtils";
import type { Customer } from "@/types/customer";

export type AssignUsernameRecipientGroup = "customer" | "expiring" | "active";

const GROUP_ORDER: AssignUsernameRecipientGroup[] = ["customer", "expiring", "active"];

const GROUP_PRIORITY: Record<AssignUsernameRecipientGroup, number> = {
  customer: 0,
  expiring: 1,
  active: 2,
};

/** Eligible rows for pool assign — excludes stopped subscribers. */
export function getAssignUsernameRecipientGroup(
  row: Customer,
  now = new Date(),
): AssignUsernameRecipientGroup | null {
  if (isStoppedSubscriber(row)) return null;
  if (isCustomerOnly(row)) return "customer";
  if (row.username && isOnExpiringPage(row, now)) return "expiring";
  if (row.username) return "active";
  return null;
}

export function sortAssignUsernameRecipients(rows: Customer[], now = new Date()): Customer[] {
  return [...rows]
    .filter((row) => getAssignUsernameRecipientGroup(row, now) !== null)
    .sort((a, b) => {
      const groupA = getAssignUsernameRecipientGroup(a, now)!;
      const groupB = getAssignUsernameRecipientGroup(b, now)!;
      const groupDiff = GROUP_PRIORITY[groupA] - GROUP_PRIORITY[groupB];
      if (groupDiff !== 0) return groupDiff;

      if (groupA === "expiring") {
        const daysA = getDaysUntilDisconnect(a, now) ?? 999;
        const daysB = getDaysUntilDisconnect(b, now) ?? 999;
        if (daysA !== daysB) return daysA - daysB;
      }

      return (a.fullName || a.lineId).localeCompare(b.fullName || b.lineId, undefined, {
        sensitivity: "base",
      });
    });
}

export function groupAssignUsernameRecipients(
  rows: Customer[],
  now = new Date(),
): Array<{ id: AssignUsernameRecipientGroup; rows: Customer[] }> {
  const sorted = sortAssignUsernameRecipients(rows, now);
  return GROUP_ORDER.map((id) => ({
    id,
    rows: sorted.filter((row) => getAssignUsernameRecipientGroup(row, now) === id),
  })).filter((group) => group.rows.length > 0);
}
