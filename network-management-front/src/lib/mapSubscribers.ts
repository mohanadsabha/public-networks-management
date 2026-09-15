import { isUsernameCycleExpired, parsePackageLineFromLineId } from "@/lib/subscriberUtils";
import { extractInvoiceUsername, computeInvoiceStatus } from "@/lib/invoiceUtils";
import type { MikrotikConnectionMethod } from "@/types/mikrotikConnection";
import type {
  InvoiceStatus,
  PaymentMethod,
  SpeedHistoryEntry,
  Subscriber,
  SubscriberInvoice,
  UsernameHistoryEntry,
} from "@/types/subscriber";

export interface BackendSubscriberRow {
  id: number;
  usernameID?: number | null;
  username?: string | null;
  password?: string | null;
  speedId?: number | null;
  speedValue?: number | null;
  lineId: string | null;
  fullName: string | null;
  facilityType?: string | null;
  phone?: string | null;
  monthlyPrice?: string | number | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isSuspended?: boolean | null;
  isPaused?: boolean | null;
  notes?: string | null;
  balance?: string | number | null;
  totalUsage?: number | null;
  usageLimit?: number | null;
  uploadUsage?: number | null;
  downloadUsage?: number | null;
  createdAt?: string | Date | null;
  suspendAt?: string | Date | null;
  routerId?: number | null;
  routerName?: string | null;
  routerImage?: string | null;
  routerPublicId?: string | null;
  routerPort?: string | number | null;
  isOwnerUsername?: boolean | null;
  /** Legacy alias — some responses may still use `router` */
  router?: string | null;
}

export interface BackendSubscriberProfileResponse {
  status?: string;
  success?: boolean;
  data: BackendSubscriberRow;
  daysGone?: number | null;
  daysRemaining?: number | null;
  syncTime?: number | null;
  isOnline?: boolean;
  connectedTo?: MikrotikConnectionMethod | null;
  onlineHost?: string | null;
}

export interface BackendSubscribersListResponse {
  success?: boolean;
  status?: string;
  data:
    | BackendSubscriberRow[]
    | {
        data: BackendSubscriberRow[];
        total: number;
        page: number;
        limit: number;
      };
}

/** Supports both paginated `{ data: rows[] }` and legacy flat `rows[]` envelopes. */
export function extractSubscriberListRows(
  response: Pick<BackendSubscribersListResponse, "data"> | null | undefined,
): BackendSubscriberRow[] {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export interface BackendUsernameHistoryRow {
  id: number;
  subscriberId: number;
  oldUsername: string;
  oldPassword?: string | null;
  usageStartDate?: string | Date | null;
  usageEndDate?: string | Date | null;
  changedAt?: string | Date | null;
  changeCause?: string | null;
}

export interface BackendSpeedHistoryRow {
  id: number;
  subscriberId: number;
  /** API / Drizzle column names */
  oldSpeed?: number | null;
  newSpeed?: number | null;
  oldSpeedMbps?: number | null;
  newSpeedMbps?: number | null;
  usageStartDate?: string | Date | null;
  usageEndDate?: string | Date | null;
  daysUsed?: number | null;
  changedAt?: string | Date | null;
}

export interface BackendInvoiceRow {
  id: number;
  subscriberId: number;
  amount: string | number;
  paidAmount: string | number;
  paymentMethod: "cash" | "bank_transfer" | "credit";
  status: "unpaid" | "partial" | "paid" | "debt";
  notes?: string | null;
  createdAt: string | Date;
}

function toIso(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function toNumber(value: string | number | null | undefined, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapPaymentMethodFromApi(method: BackendInvoiceRow["paymentMethod"]): PaymentMethod {
  if (method === "bank_transfer") return "transfer";
  return method;
}

export function mapPaymentMethodToApi(method: PaymentMethod): BackendInvoiceRow["paymentMethod"] {
  if (method === "transfer") return "bank_transfer";
  return method;
}

export function mapSubscriberRecord(row: BackendSubscriberRow): Subscriber {
  const createdAt = toIso(row.createdAt) ?? new Date().toISOString();
  const startDate = toIso(row.startDate);
  const endDate = toIso(row.endDate);
  const lineId = row.lineId ?? "";

  const record: Subscriber = {
    id: row.id,
    lineId,
    username: row.username ?? null,
    password: row.password ?? null,
    fullName: row.fullName ?? "",
    facilityType: row.facilityType ?? "",
    phone: row.phone ?? null,
    packageLine: parsePackageLineFromLineId(lineId),
    speedId: row.speedId ?? null,
    usernameId: row.usernameID ?? null,
    speedMbps: row.speedValue ?? 0,
    monthlyPrice: toNumber(row.monthlyPrice, 0),
    startDate,
    firstContactDate: startDate,
    disconnectionDate: endDate,
    isActive: false,
    isSuspended: Boolean(row.isSuspended),
    isPaused: Boolean(row.isPaused),
    isOwnerUsername: Boolean(row.isOwnerUsername),
    balance: toNumber(row.balance, 0),
    totalUsage: row.totalUsage != null ? toNumber(row.totalUsage, 0) : undefined,
    usageLimit: row.usageLimit != null ? toNumber(row.usageLimit, 0) : null,
    uploadUsage: row.uploadUsage != null ? toNumber(row.uploadUsage, 0) : undefined,
    downloadUsage: row.downloadUsage != null ? toNumber(row.downloadUsage, 0) : undefined,
    notes: row.notes ?? null,
    routerId: row.routerId ?? null,
    routerName: row.routerName ?? row.router ?? null,
    routerImageUrl: row.routerImage ?? null,
    routerPublicId: row.routerPublicId ?? null,
    routerPort:
      row.routerPort != null && row.routerPort !== ""
        ? String(row.routerPort)
        : null,
    createdAt,
    updatedAt: toIso(row.suspendAt) ?? createdAt,
  };

  record.isActive = !record.isSuspended && !isUsernameCycleExpired(record);

  return record;
}

export function mapInvoiceRecord(row: BackendInvoiceRow, lineId: string): SubscriberInvoice {
  const raw = row as BackendInvoiceRow & { paid_amount?: string | number };
  const paidAmount = toNumber(raw.paidAmount ?? raw.paid_amount, 0);
  const amount = Math.abs(toNumber(row.amount, 0));
  const notes = row.notes ?? null;
  let status: InvoiceStatus = row.status;
  if (amount < 0 || paidAmount < 0) status = "debt";
  else status = computeInvoiceStatus(amount, paidAmount);

  return {
    id: row.id,
    subscriberLineId: lineId,
    amount,
    paidAmount,
    status,
    paymentMethod: mapPaymentMethodFromApi(row.paymentMethod),
    notes,
    relatedUsername: extractInvoiceUsername(notes),
    createdAt: toIso(row.createdAt) ?? new Date().toISOString(),
    paidAt: paidAmount !== 0 ? toIso(row.createdAt) : null,
  };
}

export function mapUsernameHistory(
  rows: BackendUsernameHistoryRow[],
  lineId: string,
): UsernameHistoryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    subscriberLineId: lineId,
    oldUsername: row.oldUsername,
    oldPassword: row.oldPassword ?? "",
    usageStartDate: toIso(row.usageStartDate),
    usageEndDate: toIso(row.usageEndDate),
    changedAt: toIso(row.changedAt) ?? new Date().toISOString(),
    changeCause: row.changeCause ?? null,
  }));
}

export function mapSpeedHistory(rows: BackendSpeedHistoryRow[], lineId: string): SpeedHistoryEntry[] {
  return rows.map((row) => ({
    id: row.id,
    subscriberLineId: lineId,
    oldSpeedMbps: row.oldSpeedMbps ?? row.oldSpeed ?? 0,
    newSpeedMbps: row.newSpeedMbps ?? row.newSpeed ?? 0,
    usageStartDate: toIso(row.usageStartDate),
    usageEndDate: toIso(row.usageEndDate),
    daysUsed: row.daysUsed ?? null,
    changedAt: toIso(row.changedAt) ?? new Date().toISOString(),
  }));
}

export interface SubscriberConnectionDto {
  isOnline: boolean;
  connectedTo: MikrotikConnectionMethod | null;
  onlineHost: string | null;
}

export interface SubscriberProfileDto {
  subscriber: Subscriber;
  daysGone: number | null;
  daysRemaining: number | null;
  syncTime: number | null;
  /** @deprecated Loaded separately via getConnection — always false/null from profile API */
  isOnline: boolean;
  connectedTo: MikrotikConnectionMethod | null;
  onlineHost: string | null;
}

export function mapSubscriberProfileResponse(
  body: BackendSubscriberProfileResponse,
): SubscriberProfileDto {
  const syncTime =
    body.syncTime !== undefined && body.syncTime !== null && Number.isFinite(Number(body.syncTime))
      ? Number(body.syncTime)
      : null;
  return {
    subscriber: mapSubscriberRecord(body.data),
    daysGone: body.daysGone ?? null,
    daysRemaining: body.daysRemaining ?? null,
    syncTime,
    isOnline: false,
    connectedTo: null,
    onlineHost: null,
  };
}

export function mapSubscriberConnectionResponse(body: {
  isOnline?: boolean;
  connectedTo?: MikrotikConnectionMethod | null;
  onlineHost?: string | null;
}): SubscriberConnectionDto {
  return {
    isOnline: Boolean(body.isOnline),
    connectedTo: body.connectedTo ?? null,
    onlineHost: body.onlineHost?.trim() || null,
  };
}
