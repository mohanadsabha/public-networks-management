export type ActivityAction = "Created" | "Updated" | "Deleted";

export type ActivitySubjectType =
  | "Subscriber"
  | "Customer"
  | "Username"
  | "Speed"
  | "Invoice"
  | "Role"
  | "Admin User"
  | "Mikrotik"
  | "SMS"
  | "Support"
  | "Card Group"
  | "Group Bandwidth Scheduler"
  | "Other"
  | string;

export interface ActivityLog {
  id: number;
  createdAt: string;
  action: ActivityAction | string;
  subjectType: ActivitySubjectType;
  subjectName: string | null;
  adminName: string | null;
  ipAddress: string | null;
  details: string | null;
}

export interface ActivityLogsListResult {
  items: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}
