import {
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { isOnExpiringPage } from "@/lib/expiringUtils";
import { getPaymentMethodLabel } from "@/lib/invoiceUtils";
import type { TFunction } from "i18next";
import { mockSubscriberInvoices, mockSubscribers } from "@/lib/mocks/subscribers.mock";
import { isExpiringSubscription } from "@/lib/customerUtils";
import { isStoppedSubscriber } from "@/lib/subscriberUtils";
import type { FinancialStats } from "@/types/finance";
import type { SubscriberInvoice } from "@/types/subscriber";

function paidInvoices(): SubscriberInvoice[] {
  return mockSubscriberInvoices.filter(
    (inv) => inv.paidAmount > 0 && (inv.status === "paid" || inv.status === "partial"),
  );
}

function sumPaid(invoices: SubscriberInvoice[]): { revenue: number; count: number } {
  return {
    revenue: invoices.reduce((s, i) => s + i.paidAmount, 0),
    count: invoices.length,
  };
}

function buildMonthlyTrend(now: Date): FinancialStats["monthlyTrend"] {
  const points: FinancialStats["monthlyTrend"] = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(monthStart);
    const key = format(monthStart, "yyyy-MM");
    const inMonth = paidInvoices().filter((inv) => {
      if (!inv.paidAt) return false;
      const paid = parseISO(inv.paidAt);
      return isWithinInterval(paid, { start: monthStart, end: monthEnd });
    });
    const agg = sumPaid(inMonth);
    points.push({ month: key, revenue: agg.revenue, count: agg.count });
  }
  return points;
}

export function getFinancialStatsMock(now = new Date()): FinancialStats {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 6 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 6 });

  const paid = paidInvoices();

  const monthlyPaid = paid.filter((inv) => {
    if (!inv.paidAt) return false;
    const d = parseISO(inv.paidAt);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const weeklyPaid = paid.filter((inv) => {
    if (!inv.paidAt) return false;
    const d = parseISO(inv.paidAt);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });

  const newThisMonth = mockSubscriberInvoices.filter((inv) => {
    const d = parseISO(inv.createdAt);
    return isWithinInterval(d, { start: monthStart, end: monthEnd });
  });

  const debtInvoices = mockSubscriberInvoices.filter((inv) =>
    ["debt", "partial", "unpaid"].includes(inv.status),
  );

  const debtRevenue = debtInvoices.reduce(
    (s, i) => s + Math.max(0, i.amount - i.paidAmount),
    0,
  );

  const avgPrice =
    mockSubscriberInvoices.length > 0
      ? mockSubscriberInvoices.reduce((s, i) => s + i.amount, 0) / mockSubscriberInvoices.length
      : 0;

  const expiringSoon = mockSubscribers.filter((s) => isOnExpiringPage(s, now) && !isExpiringSubscription(s, now));
  const expired = mockSubscribers.filter((s) => isExpiringSubscription(s, now));

  const speedMap = new Map<number, { label: string; revenue: number; count: number }>();
  for (const sub of mockSubscribers) {
    const invs = monthlyPaid.filter((i) => i.subscriberLineId === sub.lineId);
    const rev = invs.reduce((s, i) => s + i.paidAmount, 0);
    if (rev <= 0) continue;
    const prev = speedMap.get(sub.speedMbps) ?? {
      label: `${sub.speedMbps} Mbps`,
      revenue: 0,
      count: 0,
    };
    speedMap.set(sub.speedMbps, {
      label: prev.label,
      revenue: prev.revenue + rev,
      count: prev.count + invs.length,
    });
  }

  const revenueBySpeed = [...speedMap.entries()]
    .map(([speed, v]) => ({ speed, label: v.label, revenue: v.revenue, count: v.count }))
    .sort((a, b) => a.speed - b.speed);

  const paidByLine = new Map<string, { total: number; count: number }>();
  for (const inv of paid) {
    const prev = paidByLine.get(inv.subscriberLineId) ?? { total: 0, count: 0 };
    paidByLine.set(inv.subscriberLineId, {
      total: prev.total + inv.paidAmount,
      count: prev.count + 1,
    });
  }

  const topSubscribers = [...paidByLine.entries()]
    .map(([lineId, agg]) => {
      const sub = mockSubscribers.find((s) => s.lineId === lineId)!;
      return {
        lineId,
        fullName: sub.fullName,
        username: sub.username,
        monthlyPrice: sub.monthlyPrice,
        speedMbps: sub.speedMbps,
        totalPaid: agg.total,
        invoiceCount: agg.count,
      };
    })
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);

  const methodMap = new Map<string, { total: number; count: number }>();
  for (const inv of paid) {
    const key = inv.paymentMethod ?? "unset";
    const prev = methodMap.get(key) ?? { total: 0, count: 0 };
    methodMap.set(key, { total: prev.total + inv.paidAmount, count: prev.count + 1 });
  }

  return {
    monthly: sumPaid(monthlyPaid),
    weekly: sumPaid(weeklyPaid),
    newThisMonth: {
      revenue: newThisMonth.reduce((s, i) => s + i.amount, 0),
      count: newThisMonth.length,
    },
    averagePrice: Math.round(avgPrice * 100) / 100,
    allTimePaid: sumPaid(paid),
    debt: { revenue: debtRevenue, count: debtInvoices.length },
    expiring: {
      revenue: expiringSoon.reduce((s, r) => s + r.monthlyPrice, 0),
      count: expiringSoon.length,
    },
    expired: {
      revenue: expired.reduce((s, r) => s + r.monthlyPrice, 0),
      count: expired.length,
    },
    stopped: { count: mockSubscribers.filter(isStoppedSubscriber).length },
    revenueBySpeed,
    monthlyTrend: buildMonthlyTrend(now),
    topSubscribers,
    byMethod: [...methodMap.entries()].map(([method, v]) => ({
      method,
      total: v.total,
      count: v.count,
    })),
  };
}

export function formatFinanceMethodLabel(method: string, t: TFunction): string {
  if (method === "unset" || method === "غير محدد") {
    return t("finance.charts.methodUnset");
  }
  if (method === "cash" || method === "transfer" || method === "credit") {
    return getPaymentMethodLabel(method, t);
  }
  return method;
}
