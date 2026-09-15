import {
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../config/db";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { invoices } from "../../db/schema/invoices";
import { speedTiers } from "../../db/schema/speedTiers";
import { subscribers } from "../../db/schema/subscribers";

function toNumber(value: unknown): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

type InvoiceRow = {
  id: number;
  subscriberId: number;
  amount: string;
  paidAmount: string;
  paymentMethod: string;
  status: string;
  createdAt: Date | null;
  lineId: string | null;
  fullName: string | null;
  username: string | null;
  speedMbps: number | null;
  monthlyPrice: string | number | null;
};

/** Remove invoice rows whose subscriber was deleted outside normal cleanup. */
export async function cleanupOrphanInvoices(): Promise<number> {
  const db = getDb();
  const result = await db.execute(sql`
    DELETE FROM invoices i
    WHERE NOT EXISTS (SELECT 1 FROM subscribers s WHERE s.id = i.subscriber_id)
  `);
  const count = (result as { rowCount?: number }).rowCount;
  return count ?? 0;
}

export async function getFinanceDebtors() {
  const db = getDb();
  const rows = await db
    .select({
      id: subscribers.id,
      lineId: subscribers.lineId,
      fullName: subscribers.fullName,
      facilityType: subscribers.facilityType,
      phone: subscribers.phone,
      balance: subscribers.balance,
      monthlyPrice: subscribers.monthlyPrice,
      isSuspended: subscribers.isSuspended,
      isPaused: subscribers.isPaused,
      username: availableUsernames.username,
      speedMbps: speedTiers.speedValue,
      startDate: availableUsernames.startDate,
      endDate: availableUsernames.endDate,
      createdAt: subscribers.createdAt,
      suspendAt: subscribers.suspendAt,
    })
    .from(subscribers)
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
    .where(sql`CAST(${subscribers.balance} AS DECIMAL) < 0`)
    .orderBy(subscribers.balance);

  return rows.map((row) => ({
    id: row.id,
    lineId: row.lineId ?? "",
    fullName: row.fullName ?? "",
    facilityType: row.facilityType ?? "",
    phone: row.phone,
    balance: toNumber(row.balance),
    monthlyPrice: toNumber(row.monthlyPrice),
    username: row.username,
    speedMbps: row.speedMbps ?? 0,
    isSuspended: Boolean(row.isSuspended),
    isPaused: Boolean(row.isPaused),
    isActive: !row.isSuspended,
    isOwnerUsername: false,
    startDate: row.startDate ? new Date(row.startDate).toISOString() : null,
    firstContactDate: row.startDate ? new Date(row.startDate).toISOString() : null,
    disconnectionDate: row.endDate ? new Date(row.endDate).toISOString() : null,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: row.suspendAt ? new Date(row.suspendAt).toISOString() : new Date().toISOString(),
    notes: null,
  }));
}

export async function getFinanceStats(now = new Date()) {
  await cleanupOrphanInvoices();

  const db = getDb();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 6 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 6 });

  const invoiceRows = await db
    .select({
      id: invoices.id,
      subscriberId: invoices.subscriberId,
      amount: invoices.amount,
      paidAmount: invoices.paidAmount,
      paymentMethod: invoices.paymentMethod,
      status: invoices.status,
      createdAt: invoices.createdAt,
      lineId: subscribers.lineId,
      fullName: subscribers.fullName,
      username: availableUsernames.username,
      speedMbps: speedTiers.speedValue,
      monthlyPrice: subscribers.monthlyPrice,
    })
    .from(invoices)
    .innerJoin(subscribers, eq(invoices.subscriberId, subscribers.id))
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
    .orderBy(desc(invoices.createdAt));

  const rows: InvoiceRow[] = invoiceRows.map((row) => ({
    ...row,
    amount: String(row.amount ?? "0"),
    paidAmount: String(row.paidAmount ?? "0"),
    paymentMethod: row.paymentMethod,
    status: row.status ?? "unpaid",
    speedMbps: row.speedMbps ?? null,
    monthlyPrice: row.monthlyPrice,
  }));

  const paidRows = rows.filter((row) => toNumber(row.paidAmount) > 0);

  const inInterval = (date: Date | null, start: Date, end: Date) => {
    if (!date) return false;
    return isWithinInterval(date, { start, end });
  };

  const monthlyPaid = paidRows.filter((row) => inInterval(row.createdAt, monthStart, monthEnd));
  const weeklyPaid = paidRows.filter((row) => inInterval(row.createdAt, weekStart, weekEnd));
  const newThisMonth = rows.filter((row) => inInterval(row.createdAt, monthStart, monthEnd));

  const sumPaid = (list: InvoiceRow[]) => ({
    revenue: list.reduce((sum, row) => sum + toNumber(row.paidAmount), 0),
    count: list.length,
  });

  const debtInvoices = rows.filter((row) =>
    ["debt", "partial", "unpaid"].includes(row.status),
  );
  const debtRevenue = debtInvoices.reduce(
    (sum, row) => sum + Math.max(0, toNumber(row.amount) - toNumber(row.paidAmount)),
    0,
  );

  const avgPrice =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + toNumber(row.amount), 0) / rows.length
      : 0;

  const monthlyTrend: Array<{ month: string; revenue: number; count: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const pointStart = startOfMonth(subMonths(now, i));
    const pointEnd = endOfMonth(pointStart);
    const key = format(pointStart, "yyyy-MM");
    const inMonth = paidRows.filter((row) => inInterval(row.createdAt, pointStart, pointEnd));
    const agg = sumPaid(inMonth);
    monthlyTrend.push({ month: key, revenue: agg.revenue, count: agg.count });
  }

  const speedMap = new Map<number, { label: string; revenue: number; count: number }>();
  for (const row of monthlyPaid) {
    const speed = row.speedMbps ?? 0;
    if (speed <= 0) continue;
    const rev = toNumber(row.paidAmount);
    const prev = speedMap.get(speed) ?? { label: `${speed} Mbps`, revenue: 0, count: 0 };
    speedMap.set(speed, {
      label: prev.label,
      revenue: prev.revenue + rev,
      count: prev.count + 1,
    });
  }

  const paidByLine = new Map<string, { total: number; count: number; row: InvoiceRow }>();
  for (const row of paidRows) {
    const key = row.lineId ?? `S${row.subscriberId}`;
    const prev = paidByLine.get(key) ?? { total: 0, count: 0, row };
    paidByLine.set(key, {
      total: prev.total + toNumber(row.paidAmount),
      count: prev.count + 1,
      row,
    });
  }

  const topSubscribers = [...paidByLine.entries()]
    .map(([lineId, agg]) => ({
      lineId,
      fullName: agg.row.fullName ?? "",
      username: agg.row.username,
      monthlyPrice: toNumber(agg.row.monthlyPrice),
      speedMbps: agg.row.speedMbps ?? 0,
      totalPaid: agg.total,
      invoiceCount: agg.count,
    }))
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 10);

  const methodMap = new Map<string, { total: number; count: number }>();
  for (const row of paidRows) {
    const key = row.paymentMethod ?? "unset";
    const prev = methodMap.get(key) ?? { total: 0, count: 0 };
    methodMap.set(key, {
      total: prev.total + toNumber(row.paidAmount),
      count: prev.count + 1,
    });
  }

  const [expiringCountRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(subscribers)
    .innerJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .where(
      and(
        eq(subscribers.isSuspended, false),
        sql`(
          COALESCE(${availableUsernames.isExpired}, false) = true
          OR (
            ${availableUsernames.endDate} IS NOT NULL
            AND ${availableUsernames.endDate} <= NOW() + INTERVAL '7 days'
            AND COALESCE(${availableUsernames.isOwnerUsername}, false) = false
          )
        )`,
      ),
    );

  const [stoppedCountRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(subscribers)
    .where(eq(subscribers.isSuspended, true));

  return {
    monthly: sumPaid(monthlyPaid),
    weekly: sumPaid(weeklyPaid),
    newThisMonth: {
      revenue: newThisMonth.reduce((sum, row) => sum + toNumber(row.amount), 0),
      count: newThisMonth.length,
    },
    averagePrice: Math.round(avgPrice * 100) / 100,
    allTimePaid: sumPaid(paidRows),
    debt: { revenue: debtRevenue, count: debtInvoices.length },
    expiring: { revenue: 0, count: Number(expiringCountRow?.count ?? 0) },
    expired: { revenue: 0, count: 0 },
    stopped: { count: Number(stoppedCountRow?.count ?? 0) },
    revenueBySpeed: [...speedMap.entries()]
      .map(([speed, value]) => ({
        speed,
        label: value.label,
        revenue: value.revenue,
        count: value.count,
      }))
      .sort((a, b) => a.speed - b.speed),
    monthlyTrend,
    topSubscribers,
    byMethod: [...methodMap.entries()].map(([method, value]) => ({
      method,
      total: value.total,
      count: value.count,
    })),
  };
}
