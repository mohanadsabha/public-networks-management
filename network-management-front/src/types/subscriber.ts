/** UI / mock model — aligned with legacy fields; API may use speedId + usernameId (see STRUCTURE.md). */

export type SubscriberLifecycleStatus =
  | "active"
  | "expired"
  | "suspended"
  | "no_subscription"
  | "stopped";

export type InvoiceStatus = "unpaid" | "partial" | "paid" | "debt";
export type PaymentMethod = "cash" | "transfer" | "credit";
export type InvoiceType = "payment" | "charge";

export interface Subscriber {
  id: number;
  /** Display ID e.g. W04-101 */
  lineId: string;
  username: string | null;
  password: string | null;
  fullName: string;
  facilityType: string;
  phone: string | null;
  /** Line / package number */
  packageLine: number;
  speedId?: number | null;
  usernameId?: number | null;
  speedMbps: number;
  monthlyPrice: number;
  startDate: string | null;
  firstContactDate: string | null;
  disconnectionDate: string | null;
  isActive: boolean;
  isSuspended: boolean;
  isPaused: boolean;
  isOwnerUsername: boolean;
  balance: number;
  /** Total data used (MB) for the linked username — upload + download. */
  totalUsage?: number;
  usageLimit?: number | null;
  uploadUsage?: number;
  downloadUsage?: number;
  notes: string | null;
  routerId?: number | null;
  routerName?: string | null;
  routerImageUrl?: string | null;
  routerPublicId?: string | null;
  /** MikroTik remote access port suffix, e.g. ":8080" */
  routerPort?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsernameHistoryEntry {
  id: number;
  subscriberLineId: string;
  oldUsername: string;
  oldPassword: string;
  usageStartDate: string | null;
  usageEndDate: string | null;
  changedAt: string;
  changeCause?: string | null;
}

export interface SpeedHistoryEntry {
  id: number;
  subscriberLineId: string;
  oldSpeedMbps: number;
  newSpeedMbps: number;
  usageStartDate: string | null;
  usageEndDate: string | null;
  daysUsed: number | null;
  changedAt: string;
}

export interface SubscriberInvoice {
  id: number;
  subscriberLineId: string;
  /** Amount the subscriber needs to pay (billed) */
  amount: number;
  /** Amount the subscriber actually paid */
  paidAmount: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
  /** Parsed from notes when invoice is tied to a new username assignment */
  relatedUsername?: string | null;
  /** @deprecated UI no longer uses type — kept for legacy rows */
  type?: InvoiceType;
  description?: string | null;
}

export interface SubscriberListFilters {
  search: string;
  status: "all" | SubscriberLifecycleStatus;
  speedMbps: number | "all";
}
