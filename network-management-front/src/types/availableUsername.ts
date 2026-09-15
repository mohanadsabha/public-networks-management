import { addDays, differenceInCalendarDays, format, isAfter, parseISO, startOfDay } from "date-fns";
import { ar, enUS } from "date-fns/locale";

/** Default cooldown after a username is assigned (days). Backend may override per org. */
export const USERNAME_COOLDOWN_DAYS = 30;

const DATETIME_STORAGE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DATETIME_DISPLAY_FORMAT = "dd/MM/yyyy HH:mm";

export type AvailableUsernamePoolStatus = "new" | "in_cooldown" | "owner";

/** After cooldown ends, row moves to Expiring page (not shown in Available usernames pool). */
export type AvailableUsernameLifecycleStatus = AvailableUsernamePoolStatus | "expired";

export interface AvailableUsername {
  id: number;
  username: string;
  password: string;
  speedId: number;
  isOwnerUsername: boolean;
  /** `true` when linked to a subscriber or in cooldown (API `isUsed`). */
  isUsed: boolean;
  isExpired: boolean;
  createdAt: string;
  /** First connection / usage start (ISO datetime, e.g. `2026-03-05T14:30:00`). Maps to `first_connection_date` / `start_date` on API. */
  assignedAt?: string | null;
  /** Cooldown end datetime — stays in pool until this moment. */
  expiryDate?: string | null;
  /** Fair usage / quota in MB (API). */
  usageLimit?: number | null;
  totalUsage?: number;
  uploadUsage?: number;
  downloadUsage?: number;
}

/** Normalize date-only or `datetime-local` values to a parseable ISO datetime. */
export function normalizeAssignedAtInput(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }
  return trimmed;
}

export function toDatetimeLocalValue(value: string): string {
  return format(parseISO(normalizeAssignedAtInput(value)), DATETIME_LOCAL_FORMAT);
}

export function nowDatetimeLocal(): string {
  return format(new Date(), DATETIME_LOCAL_FORMAT);
}

/** Short date for table `Added` column (yyyy-MM-dd). */
export function formatCreatedDate(iso: string, language = "en"): string {
  const locale = language.startsWith("ar") ? ar : enUS;
  try {
    return format(parseISO(iso), "yyyy-MM-dd", { locale });
  } catch {
    return iso.slice(0, 10);
  }
}

export function formatConnectionDateTime(iso: string, language = "en"): string {
  const locale = language.startsWith("ar") ? ar : enUS;
  try {
    return format(parseISO(normalizeAssignedAtInput(iso)), DATETIME_DISPLAY_FORMAT, { locale });
  } catch {
    return iso;
  }
}

export function getUsernameLifecycleStatus(
  row: AvailableUsername,
  now = new Date(),
): AvailableUsernameLifecycleStatus {
  if (row.isExpired) {
    return "expired";
  }

  if (row.isOwnerUsername) {
    return "owner";
  }

  const hasCooldownWindow = Boolean(row.assignedAt?.trim() && row.expiryDate?.trim());

  if (!hasCooldownWindow) {
    return row.isUsed ? "expired" : "new";
  }

  const expiry = parseISO(normalizeAssignedAtInput(row.expiryDate!));

  if (isAfter(now, expiry)) {
    return "expired";
  }

  return "in_cooldown";
}

/** Rows pickable in the available-usernames pool and username picker modal. */
export function isInAvailablePool(row: AvailableUsername, now = new Date()): boolean {
  if (row.isExpired) {
    return false;
  }

  // Owner usernames stay visible even when assigned to a subscriber.
  if (row.isOwnerUsername) {
    return true;
  }

  if (row.isUsed) {
    return false;
  }

  const hasCooldownWindow = Boolean(row.assignedAt?.trim() && row.expiryDate?.trim());

  if (hasCooldownWindow) {
    const expiry = parseISO(normalizeAssignedAtInput(row.expiryDate!));
    return !isAfter(now, expiry);
  }

  return true;
}

export function getDaysUntilExpiry(expiryDate: string, now = new Date()): number {
  return Math.max(
    0,
    differenceInCalendarDays(
      startOfDay(parseISO(normalizeAssignedAtInput(expiryDate))),
      startOfDay(now),
    ),
  );
}

/** Cooldown end from first connection datetime (`datetime-local` or ISO). */
export function buildCooldownDates(assignedAt: string): {
  assignedAt: string;
  expiryDate: string;
} {
  const start = parseISO(normalizeAssignedAtInput(assignedAt));
  const expiry = addDays(start, USERNAME_COOLDOWN_DAYS);
  return {
    assignedAt: format(start, DATETIME_STORAGE_FORMAT),
    expiryDate: format(expiry, DATETIME_STORAGE_FORMAT),
  };
}

export function getPoolStatusFromRow(
  row: AvailableUsername,
  now = new Date(),
): AvailableUsernamePoolStatus {
  if (row.isOwnerUsername) {
    return "owner";
  }
  if (getUsernameLifecycleStatus(row, now) === "in_cooldown") {
    return "in_cooldown";
  }
  return "new";
}

export function resolveUsernameFromPoolStatus(
  poolStatus: AvailableUsernamePoolStatus,
  assignedAt?: string,
): Pick<AvailableUsername, "isOwnerUsername" | "isUsed" | "assignedAt" | "expiryDate"> {
  if (poolStatus === "owner") {
    return { isOwnerUsername: true, isUsed: false, assignedAt: null, expiryDate: null };
  }
  if (poolStatus === "in_cooldown" && assignedAt?.trim()) {
    const dates = buildCooldownDates(assignedAt.trim());
    return {
      isOwnerUsername: false,
      isUsed: true,
      assignedAt: dates.assignedAt,
      expiryDate: dates.expiryDate,
    };
  }
  return { isOwnerUsername: false, isUsed: false, assignedAt: null, expiryDate: null };
}

export interface SpeedPoolCounts {
  total: number;
  new: number;
  inCooldown: number;
  owner: number;
}

export function getSpeedPoolCounts(
  rows: AvailableUsername[],
  speedId: number,
  now = new Date(),
): SpeedPoolCounts {
  const list = rows.filter((row) => row.speedId === speedId && isInAvailablePool(row, now));

  return {
    total: list.length,
    new: list.filter((row) => getUsernameLifecycleStatus(row, now) === "new").length,
    inCooldown: list.filter((row) => getUsernameLifecycleStatus(row, now) === "in_cooldown").length,
    owner: list.filter((row) => getUsernameLifecycleStatus(row, now) === "owner").length,
  };
}
