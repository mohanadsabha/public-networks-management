import {
  endOfDay,
  format,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import type {
  ChartCountItem,
  DailyTrendPoint,
  SupportStats,
  SupportTicket,
  TicketChannel,
  TicketStatus,
} from "@/types/supportTicket";

export function computeSupportStats(tickets: SupportTicket[]): SupportStats {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 6 });

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const waitingCount = tickets.filter((t) => t.status === "waiting_customer").length;

  const resolvedTodayCount = tickets.filter(
    (t) => t.resolvedAt && isSameDay(new Date(t.resolvedAt), now),
  ).length;

  const resolvedWeekCount = tickets.filter(
    (t) =>
      t.resolvedAt &&
      isWithinInterval(new Date(t.resolvedAt), { start: weekStart, end: endOfDay(now) }),
  ).length;

  const createdTodayCount = tickets.filter((t) => isSameDay(new Date(t.createdAt), now)).length;

  const resolvedWithDuration = tickets.filter((t) => t.resolvedAt);
  const avgResolutionHours =
    resolvedWithDuration.length > 0
      ? Math.round(
          resolvedWithDuration.reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt).getTime();
            const resolved = new Date(ticket.resolvedAt!).getTime();
            return sum + (resolved - created) / (1000 * 60 * 60);
          }, 0) / resolvedWithDuration.length,
        )
      : 0;

  return {
    openCount,
    inProgressCount,
    waitingCount,
    resolvedTodayCount,
    resolvedWeekCount,
    createdTodayCount,
    avgResolutionHours,
  };
}

export function getStatusChartData(tickets: SupportTicket[]): ChartCountItem[] {
  const counts: Record<TicketStatus, number> = {
    open: 0,
    in_progress: 0,
    waiting_customer: 0,
    resolved: 0,
  };

  for (const ticket of tickets) {
    counts[ticket.status] += 1;
  }

  return (Object.keys(counts) as TicketStatus[]).map((key) => ({
    key,
    label: key,
    value: counts[key],
  }));
}

export function getChannelChartData(tickets: SupportTicket[]): ChartCountItem[] {
  const counts: Record<TicketChannel, number> = {
    phone: 0,
    visit: 0,
    whatsapp: 0,
    other: 0,
  };

  for (const ticket of tickets) {
    counts[ticket.channel] += 1;
  }

  return (Object.keys(counts) as TicketChannel[]).map((key) => ({
    key,
    label: key,
    value: counts[key],
  }));
}

export function getDailyTrendData(tickets: SupportTicket[], days = 7): DailyTrendPoint[] {
  const today = new Date();
  const points: DailyTrendPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = subDays(today, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const created = tickets.filter((t) =>
      isWithinInterval(new Date(t.createdAt), { start: dayStart, end: dayEnd }),
    ).length;

    const resolved = tickets.filter(
      (t) =>
        t.resolvedAt &&
        isWithinInterval(new Date(t.resolvedAt), { start: dayStart, end: dayEnd }),
    ).length;

    points.push({
      date: format(day, "yyyy-MM-dd"),
      label: format(day, "EEE"),
      created,
      resolved,
    });
  }

  return points;
}
