import { apiClient } from "@/lib/apiClient";
import { queryActivityLogsMock } from "@/lib/mocks/activityLogs.mock";
import type { ActivityLog, ActivityLogsListResult } from "@/types/activityLog";

const USE_MOCK = import.meta.env.VITE_USE_ACTIVITY_LOGS_MOCK === "true";

interface ActivityLogsApiRow {
  id: number;
  action: string;
  subjectType?: string;
  subject_type?: string;
  subjectName?: string | null;
  subject_name?: string | null;
  adminName?: string | null;
  admin_name?: string | null;
  ipAddress?: string | null;
  ip_address?: string | null;
  details?: string | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;
}

interface ActivityLogsApiResponse {
  data?: ActivityLogsApiRow[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}

function mapActivityLog(row: ActivityLogsApiRow): ActivityLog {
  const created = row.createdAt ?? row.created_at;
  return {
    id: row.id,
    action: row.action,
    subjectType: row.subjectType ?? row.subject_type ?? "Other",
    subjectName: row.subjectName ?? row.subject_name ?? null,
    adminName: row.adminName ?? row.admin_name ?? null,
    ipAddress: row.ipAddress ?? row.ip_address ?? null,
    details: row.details ?? null,
    createdAt:
      created instanceof Date ? created.toISOString() : typeof created === "string" ? created : "",
  };
}

export interface ActivityLogsListParams {
  page?: number;
  limit?: number;
  /** Filter by subject name (server param: `name`) */
  name?: string;
  startDate?: string;
  endDate?: string;
}

export const logsService = {
  async list(params: ActivityLogsListParams = {}): Promise<ActivityLogsListResult> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 200));
      return queryActivityLogsMock(params);
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 25;
    const name = params.name?.trim();

    const { data: body } = await apiClient.get<ActivityLogsApiResponse>("/activity-logs", {
      params: {
        page,
        limit,
        ...(name ? { name } : {}),
        ...(params.startDate ? { startDate: params.startDate } : {}),
        ...(params.endDate ? { endDate: params.endDate } : {}),
      },
    });

    const rows = body.data ?? [];
    const meta = body.meta;

    return {
      items: rows.map(mapActivityLog),
      total: meta?.total ?? rows.length,
      page: meta?.page ?? page,
      limit: meta?.limit ?? limit,
    };
  },
};
