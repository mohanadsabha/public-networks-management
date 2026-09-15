/** @deprecated Use @/types/supportTicket and @/lib/supportAnalytics — kept for mock barrel compatibility */
export type {
  ChartCountItem,
  DailyTrendPoint,
  SupportStats,
  SupportTicket,
  TicketChannel,
  TicketPriority,
  TicketStatus,
} from "@/types/supportTicket";

export {
  computeSupportStats,
  getChannelChartData,
  getDailyTrendData,
  getStatusChartData,
} from "@/lib/supportAnalytics";
