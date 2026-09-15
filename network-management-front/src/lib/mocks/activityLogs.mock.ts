import { subMinutes } from "date-fns";
import type { ActivityLog, ActivityLogsListResult } from "@/types/activityLog";
import type { ActivityLogsListParams } from "@/services/logs.service";
import { mockAdminUsers } from "./adminUsers.mock";

const ACTIONS = ["Created", "Updated", "Deleted"] as const;
const SUBJECT_TYPES = [
  "Subscriber",
  "Customer",
  "Username",
  "Speed",
  "Invoice",
  "SMS",
  "Admin User",
] as const;

const SUBJECT_NAMES = [
  "W04-101",
  "W08-205",
  "4 Mbps pool",
  "ahmad.w04",
  "خالد عمر",
  "June invoice #1042",
  "Expiry reminder",
  "khaled.ops",
];

const IPS = [
  "185.73.142.18",
  "185.73.142.22",
  "192.168.10.45",
  "10.0.0.12",
  "178.169.55.90",
  "185.73.142.31",
];

function buildMockActivityLogs(): ActivityLog[] {
  const now = new Date();
  const logs: ActivityLog[] = [];

  for (let i = 0; i < 87; i++) {
    const admin = mockAdminUsers[i % mockAdminUsers.length];
    logs.push({
      id: 87 - i,
      createdAt: subMinutes(now, i * 17 + (i % 5)).toISOString(),
      action: ACTIONS[i % ACTIONS.length],
      subjectType: SUBJECT_TYPES[i % SUBJECT_TYPES.length],
      subjectName: SUBJECT_NAMES[i % SUBJECT_NAMES.length],
      adminName: admin.name,
      ipAddress: IPS[i % IPS.length],
      details: null,
    });
  }

  return logs;
}

const MOCK_ACTIVITY_LOGS = buildMockActivityLogs();

function matchesName(log: ActivityLog, name: string): boolean {
  const q = name.toLowerCase();
  return (
    (log.subjectName?.toLowerCase().includes(q) ?? false) ||
    (log.adminName?.toLowerCase().includes(q) ?? false) ||
    log.subjectType.toLowerCase().includes(q) ||
    log.action.toLowerCase().includes(q) ||
    (log.ipAddress?.toLowerCase().includes(q) ?? false)
  );
}

export function queryActivityLogsMock(params: ActivityLogsListParams = {}): ActivityLogsListResult {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 25);
  const name = params.name?.trim();

  let filtered = [...MOCK_ACTIVITY_LOGS];
  if (name) {
    filtered = filtered.filter((row) => matchesName(row, name));
  }

  filtered.sort((a, b) => b.id - a.id);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit };
}
