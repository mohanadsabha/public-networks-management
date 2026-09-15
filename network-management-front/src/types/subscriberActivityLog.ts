import type { ActivityAction, ActivitySubjectType } from "@/types/activityLog";

export interface SubscriberActivityLogsListParams {
  page?: number;
  limit?: number;
}

export interface SubscriberActivityLogsListResult {
  items: SubscriberActivityLog[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscriberActivityLog {
  id: number;
  createdAt: string;
  action: ActivityAction | string;
  subjectType: ActivitySubjectType;
  subjectId: number | null;
  subjectName: string | null;
  adminId: number | null;
  adminName: string | null;
  method: string | null;
  endpoint: string | null;
  statusCode: number | null;
  ipAddress: string | null;
  details: string | null;
}
