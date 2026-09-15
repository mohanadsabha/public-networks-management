import { format, parseISO } from "date-fns";
import type { AvailableUsernameFormValues } from "@/components/pages/available-usernames";
import type { AvailableUsername, AvailableUsernamePoolStatus } from "@/types/availableUsername";
import { normalizeAssignedAtInput } from "@/types/availableUsername";

export interface BackendUsernameRecord {
  id: number;
  speedId: number;
  username: string;
  password: string;
  startDate: string | null;
  endDate: string | null;
  isOwnerUsername: boolean;
  isUsed: boolean;
  isExpired: boolean;
  createdAt: string;
  usageLimit?: number | null;
  totalUsage?: number | null;
  uploadUsage?: number | null;
  downloadUsage?: number | null;
}

export interface AddUsernameApiBody {
  username: string;
  password: string;
  isOwnerUsername: boolean;
  isUsed: boolean;
  startDate?: string;
}

export interface UpdateUsernameApiBody {
  password?: string;
  isOwnerUsername?: boolean;
  isUsed?: boolean;
  startDate?: string;
}

/** `datetime-local` → API `startDate` (e.g. `2026-05-21T21:50:33.724+03:00`). */
export function toApiStartDate(datetimeLocal: string): string {
  const d = parseISO(normalizeAssignedAtInput(datetimeLocal));
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  const offsetMinutes = -d.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(abs / 60)).padStart(2, "0");
  const offsetMins = String(abs % 60).padStart(2, "0");
  const base = format(d, "yyyy-MM-dd'T'HH:mm:ss");
  return `${base}.${ms}${sign}${offsetHours}:${offsetMins}`;
}

function coerceIsoString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function mapBackendUsername(row: BackendUsernameRecord): AvailableUsername {
  const createdAt = coerceIsoString(row.createdAt) ?? "";
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    speedId: row.speedId,
    isOwnerUsername: row.isOwnerUsername,
    isUsed: row.isUsed === true,
    isExpired: row.isExpired === true,
    createdAt,
    assignedAt: coerceIsoString(row.startDate),
    expiryDate: coerceIsoString(row.endDate),
    usageLimit: row.usageLimit ?? null,
    totalUsage: row.totalUsage != null ? Number(row.totalUsage) : 0,
    uploadUsage: row.uploadUsage != null ? Number(row.uploadUsage) : 0,
    downloadUsage: row.downloadUsage != null ? Number(row.downloadUsage) : 0,
  };
}

export function poolStatusToApiFlags(poolStatus: AvailableUsernamePoolStatus): {
  isOwnerUsername: boolean;
  isUsed: boolean;
} {
  if (poolStatus === "owner") {
    return { isOwnerUsername: true, isUsed: false };
  }
  if (poolStatus === "in_cooldown") {
    return { isOwnerUsername: false, isUsed: true };
  }
  return { isOwnerUsername: false, isUsed: false };
}

export function formValuesToCreateBody(
  values: AvailableUsernameFormValues,
): AddUsernameApiBody {
  const flags = poolStatusToApiFlags(values.poolStatus);
  const body: AddUsernameApiBody = {
    username: values.username.trim(),
    password: values.password,
    ...flags,
  };

  if (values.poolStatus === "in_cooldown" && values.assignedAt) {
    body.startDate = toApiStartDate(values.assignedAt);
  }

  return body;
}

export function formValuesToUpdateBody(
  values: AvailableUsernameFormValues,
): UpdateUsernameApiBody {
  const flags = poolStatusToApiFlags(values.poolStatus);
  const body: UpdateUsernameApiBody = { ...flags };

  if (values.password.trim()) {
    body.password = values.password.trim();
  }

  if (values.poolStatus === "in_cooldown" && values.assignedAt) {
    body.startDate = toApiStartDate(values.assignedAt);
  }

  return body;
}
