import type { CustomersListParams } from "@/services/customers.service";
import type { SubscribersListParams } from "@/services/subscribers.service";

export const subscribersQueryKey = (params?: SubscribersListParams) =>
  ["subscribers", params ?? {}] as const;

export const subscriberProfileQueryKey = (id: number) => ["subscribers", "profile", id] as const;

export const subscriberByLineIdQueryKey = (lineId: string) =>
  ["subscribers", "line", lineId] as const;

export const subscriberConnectionQueryKey = (lineId: string) =>
  ["subscribers", "line", lineId, "connection"] as const;

export const subscriberInvoicesQueryKey = (id: number) => ["subscribers", id, "invoices"] as const;

export const subscriberUsernameHistoryQueryKey = (id: number) =>
  ["subscribers", id, "username-history"] as const;

export const subscriberSpeedHistoryQueryKey = (id: number) =>
  ["subscribers", id, "speed-history"] as const;

export const subscriberLogsQueryKey = (id: number, page = 1, limit = 15) =>
  ["subscribers", id, "logs", { page, limit }] as const;

export const customersQueryKey = (params?: CustomersListParams) =>
  ["customers", params ?? {}] as const;

export const customerByLineIdQueryKey = (lineId: string) => ["customers", "line", lineId] as const;

export function availableUsernamesQueryKey(speedId: number) {
  return ["available-usernames", speedId] as const;
}
