import type { SubscriberActivityLog } from "@/types/subscriberActivityLog";
import type { TFunction } from "i18next";

export interface BackendSubscriberActivityLogRow {
  id: number;
  adminId?: number | null;
  admin_id?: number | null;
  adminName?: string | null;
  admin_name?: string | null;
  action: string;
  subjectType?: string;
  subject_type?: string;
  subjectId?: number | null;
  subject_id?: number | null;
  subjectName?: string | null;
  subject_name?: string | null;
  method?: string | null;
  endpoint?: string | null;
  statusCode?: number | null;
  status_code?: number | null;
  ipAddress?: string | null;
  ip_address?: string | null;
  details?: string | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;
}

function toIsoDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function mapSubscriberActivityLog(row: BackendSubscriberActivityLogRow): SubscriberActivityLog {
  return {
    id: row.id,
    createdAt: toIsoDate(row.createdAt ?? row.created_at),
    action: row.action,
    subjectType: row.subjectType ?? row.subject_type ?? "Other",
    subjectId: row.subjectId ?? row.subject_id ?? null,
    subjectName: row.subjectName ?? row.subject_name ?? null,
    adminId: row.adminId ?? row.admin_id ?? null,
    adminName: row.adminName ?? row.admin_name ?? null,
    method: row.method ?? null,
    endpoint: row.endpoint ?? null,
    statusCode: row.statusCode ?? row.status_code ?? null,
    ipAddress: row.ipAddress ?? row.ip_address ?? null,
    details: row.details ?? null,
  };
}

export function formatSubscriberLogSummary(log: SubscriberActivityLog, t: TFunction): string {
  const action = log.action;
  const subjectType = log.subjectType;
  const key = `subscribers.logs.summaries.${action}.${subjectType}`;
  const translated = t(key, {
    subject: log.subjectName ?? "",
    defaultValue: "",
  });
  if (translated && translated !== key) {
    if (log.subjectName?.trim() && log.subjectType !== "Subscriber") {
      return `${translated} — ${log.subjectName}`;
    }
    return translated;
  }

  const actionLabel = t(`activityLogs.actions.${action}`, { defaultValue: action });
  const subjectLabel = t(`activityLogs.subjectTypes.${subjectType}`, { defaultValue: subjectType });
  if (log.subjectName?.trim()) {
    return `${actionLabel} · ${subjectLabel} (${log.subjectName})`;
  }
  return `${actionLabel} · ${subjectLabel}`;
}

export function parseLogDetails(details: string | null): Record<string, unknown> | null {
  if (!details?.trim()) return null;
  try {
    const parsed = JSON.parse(details) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
