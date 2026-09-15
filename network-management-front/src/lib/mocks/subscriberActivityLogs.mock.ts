import { subHours, subMinutes } from "date-fns";
import type {
  SubscriberActivityLog,
  SubscriberActivityLogsListParams,
  SubscriberActivityLogsListResult,
} from "@/types/subscriberActivityLog";

const TEMPLATES: Array<Pick<SubscriberActivityLog, "action" | "subjectType" | "subjectName" | "adminName">> = [
  { action: "Updated", subjectType: "Subscriber", subjectName: null, adminName: "Operations Admin" },
  { action: "Updated", subjectType: "Username", subjectName: "ahmad.w04", adminName: "Operations Admin" },
  { action: "Created", subjectType: "Invoice", subjectName: "Invoice #20", adminName: "Super Admin" },
  { action: "Updated", subjectType: "Invoice", subjectName: "Invoice #20", adminName: "Super Admin" },
  { action: "Updated", subjectType: "Subscriber", subjectName: null, adminName: "Super Admin" },
  { action: "Deleted", subjectType: "Invoice", subjectName: "Invoice #18", adminName: "Operations Admin" },
];

function buildLogsForSubscriber(
  subscriberId: number,
  lineId: string,
  fullName: string,
): SubscriberActivityLog[] {
  const now = new Date();
  const logs: SubscriberActivityLog[] = [];

  for (let i = 0; i < 42; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    logs.push({
      id: subscriberId * 1000 + i + 1,
      createdAt: subMinutes(subHours(now, Math.floor(i / 4)), (i % 4) * 13).toISOString(),
      action: template.action,
      subjectType: template.subjectType,
      subjectId: subscriberId,
      subjectName:
        template.subjectType === "Subscriber" ? fullName || lineId : template.subjectName,
      adminId: i % 2 === 0 ? 2 : 1,
      adminName: template.adminName,
      method: template.action === "Created" ? "POST" : template.action === "Deleted" ? "DELETE" : "PUT",
      endpoint: `/api/v1/subscribers/${subscriberId}`,
      statusCode: 200,
      ipAddress: i % 2 === 0 ? "185.73.142.18" : "192.168.10.45",
      details: null,
    });
  }

  return logs.sort((a, b) => b.id - a.id);
}

export function listMockSubscriberActivityLogs(
  options: {
    subscriberId: number;
    lineId: string;
    fullName: string;
  },
  params: SubscriberActivityLogsListParams = {},
): SubscriberActivityLogsListResult {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 15);
  const all = buildLogsForSubscriber(options.subscriberId, options.lineId, options.fullName);
  const total = all.length;
  const start = (page - 1) * limit;

  return {
    items: all.slice(start, start + limit),
    total,
    page,
    limit,
  };
}
