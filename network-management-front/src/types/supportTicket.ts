export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketChannel = "phone" | "visit" | "whatsapp" | "other";

export interface SupportTicket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  subscriberName: string;
  subscriberPhone: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SupportStats {
  openCount: number;
  inProgressCount: number;
  waitingCount: number;
  resolvedTodayCount: number;
  resolvedWeekCount: number;
  createdTodayCount: number;
  avgResolutionHours: number;
}

export interface ChartCountItem {
  key: string;
  label: string;
  value: number;
}

export interface DailyTrendPoint {
  date: string;
  label: string;
  created: number;
  resolved: number;
}
