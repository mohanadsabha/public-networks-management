import { endOfWeek, format, startOfMonth, startOfWeek, subDays } from "date-fns";
import { sql } from "drizzle-orm";
import { getDb } from "../../config/db";

const SOON_DAYS = 7;
const DAILY_CHART_DAYS = 7;
const USERNAME_CHANGE_LOOKBACK_DAYS = 7;

type CountRow = { count: string | number };
type SpeedCountRow = { speed: number; label: string; count: string | number };
type FacilityRow = { facility_type: string; count: string | number };
type DailyRow = { date: string; count: string | number };
type MonthTrendRow = {
  month: string;
  active: string | number;
  suspended: string | number;
  disabled: string | number;
  new: string | number;
};
type RecentSubscriberRow = {
  id: number;
  line_id: string;
  username: string | null;
  full_name: string;
  phone: string | null;
  created_at: Date;
};
type UsernameChangeRow = {
  id: number;
  subscriber_id: number;
  line_id: string | null;
  full_name: string | null;
  phone: string | null;
  old_username: string;
  current_username: string | null;
  changed_at: Date;
};
type PoolBreakdownRow = {
  speed: number;
  label: string;
  category: string;
  count: string | number;
};

function queryRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result) {
    return ((result as { rows?: T[] }).rows ?? []) as T[];
  }
  return [];
}

function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function weekInterval(now: Date) {
  const start = startOfWeek(now, { weekStartsOn: 6 });
  const end = endOfWeek(now, { weekStartsOn: 6 });
  return { start, end };
}

function fillRecentDayCounts(rows: DailyRow[], now: Date, lookbackDays = USERNAME_CHANGE_LOOKBACK_DAYS) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = format(new Date(row.date), "yyyy-MM-dd");
    map.set(key, toNumber(row.count));
  }
  const points: Array<{ date: string; count: number }> = [];
  for (let i = 0; i <= lookbackDays; i++) {
    const day = subDays(now, i);
    const key = format(day, "yyyy-MM-dd");
    points.push({ date: key, count: map.get(key) ?? 0 });
  }
  return points;
}

function mapUsernameChangeRows(rows: UsernameChangeRow[]) {
  return rows.map((row) => ({
    id: row.id,
    subscriberId: row.subscriber_id,
    lineId: row.line_id ?? "—",
    fullName: row.full_name ?? "—",
    phone: row.phone,
    oldUsername: row.old_username,
    currentUsername: row.current_username ?? "—",
    changedAt: new Date(row.changed_at).toISOString(),
  }));
}

function fillDailySeries(rows: DailyRow[], now: Date, days = DAILY_CHART_DAYS) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = format(new Date(row.date), "yyyy-MM-dd");
    map.set(key, toNumber(row.count));
  }
  const points: Array<{ date: string; count: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(now, i);
    const key = format(day, "yyyy-MM-dd");
    points.push({ date: key, count: map.get(key) ?? 0 });
  }
  return points;
}

function speedLabel(mbps: number): string {
  return `${mbps} Mbps`;
}

export async function getStatistics(year: number) {
  const db = getDb();
  const now = new Date();
  const { start: weekStart, end: weekEnd } = weekInterval(now);
  const monthStart = startOfMonth(now);
  const currentMonthKey = format(now, "yyyy-MM");

  const soonInterval = sql`${SOON_DAYS} * INTERVAL '1 day'`;

  /**
   * Matches frontend `isInAvailablePool`: unused, not expired, and either owner,
   * no cooldown window, or cooldown end still in the future. In-cooldown rows
   * (`is_used = true`) are excluded — they are not shown on Available Usernames.
   */
  const poolAvailableSql = sql`
    COALESCE(au.is_expired, false) = false
    AND COALESCE(au.is_used, false) = false
    AND (
      COALESCE(au.is_owner_username, false) = true
      OR au.start_date IS NULL
      OR au.end_date IS NULL
      OR au.end_date > NOW()
    )
  `;

  /** Pool rows on an active (non-deleted) speed tier — orphaned names on removed tiers are excluded. */
  const poolOnActiveSpeedTierSql = sql`
    ${poolAvailableSql}
    AND EXISTS (
      SELECT 1 FROM speed_tiers st
      WHERE st.id = au.speed_id AND COALESCE(st.deleted, false) = false
    )
  `;

  const activeSpeedTierSql = sql`COALESCE(st.deleted, false) = false`;

  const activeSubscriberSql = sql`
    s.is_suspended = false
    AND s.username_id IS NOT NULL
    AND COALESCE(au.is_expired, false) = false
    AND (
      au.end_date IS NULL
      OR au.end_date >= NOW()
      OR COALESCE(au.is_owner_username, false) = true
    )
  `;

  const expiringSoonSql = sql`
    s.is_suspended = false
    AND s.username_id IS NOT NULL
    AND COALESCE(au.is_owner_username, false) = false
    AND COALESCE(au.is_expired, false) = false
    AND au.end_date IS NOT NULL
    AND au.end_date > NOW()
    AND au.end_date <= NOW() + ${soonInterval}
  `;

  const expiredSql = sql`
    s.is_suspended = false
    AND s.username_id IS NOT NULL
    AND (
      COALESCE(au.is_expired, false) = true
      OR (au.end_date IS NOT NULL AND au.end_date < NOW())
    )
  `;

  const [
    overviewRows,
    thisWeekRows,
    speedTierRows,
    subscribersBySpeedRows,
    availableBySpeedRows,
    facilityRows,
    newSubscriberCountRows,
    usernameChangeCountRows,
    dailyNewRows,
    dailyAvailableRows,
    poolBreakdownRows,
    monthlyTrendRows,
    summaryRows,
    distributionRows,
    customerBreakdownRows,
  ] = await Promise.all([
    db.execute<{
      total_records: string;
      customers_only: string;
      total_subscribers: string;
      active_subscribers: string;
      expiring_soon: string;
      expired: string;
      stopped: string;
      available_pool: string;
      new_this_month: string;
    }>(sql`
      SELECT
        (SELECT COUNT(*)::int FROM subscribers) AS total_records,
        (SELECT COUNT(*)::int FROM subscribers s WHERE s.is_suspended = false AND s.username_id IS NULL) AS customers_only,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE s.is_suspended = false) AS total_subscribers,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE ${activeSubscriberSql}) AS active_subscribers,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE ${expiringSoonSql}) AS expiring_soon,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE ${expiredSql}) AS expired,
        (SELECT COUNT(*)::int FROM subscribers WHERE is_suspended = true) AS stopped,
        (SELECT COUNT(*)::int FROM available_usernames au WHERE ${poolOnActiveSpeedTierSql}) AS available_pool,
        (SELECT COUNT(*)::int FROM subscribers WHERE created_at >= ${monthStart}) AS new_this_month
    `),

    db.execute<{
      new_subscribers: string;
      usernames_added: string;
      speed_changes: string;
      username_changes: string;
    }>(sql`
      SELECT
        (SELECT COUNT(*)::int FROM subscribers WHERE created_at >= ${weekStart} AND created_at < ${weekEnd}) AS new_subscribers,
        (SELECT COUNT(*)::int FROM available_usernames au
          INNER JOIN speed_tiers st ON st.id = au.speed_id
          WHERE ${activeSpeedTierSql}
            AND au.created_at >= ${weekStart} AND au.created_at < ${weekEnd}) AS usernames_added,
        (SELECT COUNT(*)::int FROM speed_history WHERE changed_at >= ${weekStart} AND changed_at < ${weekEnd}) AS speed_changes,
        (SELECT COUNT(*)::int FROM username_history WHERE changed_at >= ${weekStart} AND changed_at < ${weekEnd}) AS username_changes
    `),

    db.execute<{ id: number; speed_value: number; price: string }>(sql`
      SELECT id, speed_value, price::text
      FROM speed_tiers
      WHERE deleted = false
      ORDER BY speed_value ASC
    `),

    db.execute<SpeedCountRow>(sql`
      SELECT st.speed_value AS speed, CONCAT(st.speed_value, ' Mbps') AS label, COUNT(*)::int AS count
      FROM subscribers s
      INNER JOIN available_usernames au ON au.id = s.username_id
      INNER JOIN speed_tiers st ON st.id = au.speed_id
      WHERE s.is_suspended = false AND COALESCE(au.is_expired, false) = false
      GROUP BY st.speed_value
      ORDER BY st.speed_value ASC
    `),

    db.execute<SpeedCountRow>(sql`
      SELECT st.speed_value AS speed, CONCAT(st.speed_value, ' Mbps') AS label, COUNT(*)::int AS count
      FROM available_usernames au
      INNER JOIN speed_tiers st ON st.id = au.speed_id
      WHERE ${poolAvailableSql} AND ${activeSpeedTierSql}
      GROUP BY st.speed_value
      ORDER BY st.speed_value ASC
    `),

    db.execute<FacilityRow>(sql`
      SELECT facility_type, COUNT(*)::int AS count
      FROM subscribers
      WHERE facility_type IS NOT NULL AND TRIM(facility_type) <> ''
      GROUP BY facility_type
      ORDER BY count DESC
      LIMIT 10
    `),

    db.execute<DailyRow>(sql`
      SELECT DATE(created_at AT TIME ZONE 'UTC')::text AS date, COUNT(*)::int AS count
      FROM subscribers
      WHERE created_at >= ${subDays(now, USERNAME_CHANGE_LOOKBACK_DAYS)}
      GROUP BY DATE(created_at AT TIME ZONE 'UTC')
      ORDER BY date DESC
    `),

    db.execute<DailyRow>(sql`
      SELECT DATE(changed_at AT TIME ZONE 'UTC')::text AS date, COUNT(*)::int AS count
      FROM username_history
      WHERE changed_at >= ${subDays(now, USERNAME_CHANGE_LOOKBACK_DAYS)}
      GROUP BY DATE(changed_at AT TIME ZONE 'UTC')
      ORDER BY date DESC
    `),

    db.execute<DailyRow>(sql`
      SELECT DATE(created_at AT TIME ZONE 'UTC')::text AS date, COUNT(*)::int AS count
      FROM subscribers
      WHERE created_at >= ${subDays(now, DAILY_CHART_DAYS - 1)}
      GROUP BY DATE(created_at AT TIME ZONE 'UTC')
      ORDER BY date ASC
    `),

    db.execute<DailyRow>(sql`
      SELECT DATE(au.created_at AT TIME ZONE 'UTC')::text AS date, COUNT(*)::int AS count
      FROM available_usernames au
      INNER JOIN speed_tiers st ON st.id = au.speed_id
      WHERE ${activeSpeedTierSql}
        AND au.created_at >= ${subDays(now, DAILY_CHART_DAYS - 1)}
      GROUP BY DATE(au.created_at AT TIME ZONE 'UTC')
      ORDER BY date ASC
    `),

    db.execute<PoolBreakdownRow>(sql`
      SELECT
        st.speed_value AS speed,
        CONCAT(st.speed_value, ' Mbps') AS label,
        CASE
          WHEN au.end_date IS NULL OR DATE(au.end_date) - DATE(NOW()) >= 30 THEN 'full'
          WHEN DATE(au.end_date) - DATE(NOW()) >= 15 THEN 'half'
          WHEN DATE(au.end_date) - DATE(NOW()) >= 7 THEN 'quarter'
          ELSE 'low'
        END AS category,
        COUNT(*)::int AS count
      FROM available_usernames au
      INNER JOIN speed_tiers st ON st.id = au.speed_id
      WHERE ${poolAvailableSql} AND ${activeSpeedTierSql}
      GROUP BY st.speed_value, category
      ORDER BY st.speed_value ASC, category ASC
    `),

    db.execute<MonthTrendRow>(sql`
      WITH months AS (
        SELECT TO_CHAR(d, 'YYYY-MM') AS month
        FROM generate_series(
          make_date(${year}, 1, 1),
          make_date(${year}, 12, 1),
          interval '1 month'
        ) AS d
      ),
      subs AS (
        SELECT
          TO_CHAR(COALESCE(au.start_date, s.created_at), 'YYYY-MM') AS month,
          COUNT(*) FILTER (WHERE s.is_suspended = false AND s.username_id IS NOT NULL
            AND COALESCE(au.is_expired, false) = false
            AND (
              au.end_date IS NULL
              OR au.end_date >= NOW()
              OR COALESCE(au.is_owner_username, false) = true
            )
          )::int AS active,
          COUNT(*) FILTER (WHERE s.is_suspended = false AND s.username_id IS NOT NULL
            AND COALESCE(au.is_owner_username, false) = false
            AND COALESCE(au.is_expired, false) = false
            AND au.end_date IS NOT NULL
            AND au.end_date > NOW()
            AND au.end_date <= NOW() + ${soonInterval}
          )::int AS disabled,
          COUNT(*)::int AS new
        FROM subscribers s
        LEFT JOIN available_usernames au ON au.id = s.username_id
        WHERE EXTRACT(YEAR FROM COALESCE(au.start_date, s.created_at)) = ${year}
        GROUP BY 1
      ),
      stopped AS (
        SELECT TO_CHAR(suspend_at, 'YYYY-MM') AS month, COUNT(*)::int AS suspended
        FROM subscribers
        WHERE is_suspended = true AND suspend_at IS NOT NULL
          AND EXTRACT(YEAR FROM suspend_at) = ${year}
        GROUP BY 1
      )
      SELECT
        m.month,
        COALESCE(subs.active, 0) AS active,
        COALESCE(stopped.suspended, 0) AS suspended,
        COALESCE(subs.disabled, 0) AS disabled,
        COALESCE(subs.new, 0) AS new
      FROM months m
      LEFT JOIN subs ON subs.month = m.month
      LEFT JOIN stopped ON stopped.month = m.month
      ORDER BY m.month ASC
    `),

    db.execute<{
      total: string;
      active: string;
      suspended: string;
      disabled: string;
      new_count: string;
    }>(sql`
      SELECT
        (SELECT COUNT(*)::int FROM subscribers) AS total,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE ${activeSubscriberSql}) AS active,
        (SELECT COUNT(*)::int FROM subscribers WHERE is_suspended = true) AS suspended,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE ${expiringSoonSql} OR ${expiredSql}) AS disabled,
        (SELECT COUNT(*)::int FROM subscribers
          WHERE TO_CHAR(created_at, 'YYYY-MM') = ${currentMonthKey}) AS new_count
    `),

    db.execute<{ status: string; count: string }>(sql`
      SELECT 'new' AS status, (
        SELECT COUNT(*)::int FROM subscribers
        WHERE TO_CHAR(created_at, 'YYYY-MM') = ${currentMonthKey}
      ) AS count
      UNION ALL
      SELECT 'active', (
        SELECT COUNT(*)::int FROM subscribers s
        INNER JOIN available_usernames au ON au.id = s.username_id
        WHERE ${activeSubscriberSql}
      )
      UNION ALL
      SELECT 'disabled', (
        SELECT COUNT(*)::int FROM subscribers s
        INNER JOIN available_usernames au ON au.id = s.username_id
        WHERE ${expiringSoonSql} OR ${expiredSql}
      )
      UNION ALL
      SELECT 'suspended', (
        SELECT COUNT(*)::int FROM subscribers WHERE is_suspended = true
      )
    `),

    db.execute<{
      customer: string;
      subscriber: string;
      expiring: string;
      stopped: string;
    }>(sql`
      SELECT
        (SELECT COUNT(*)::int FROM subscribers WHERE is_suspended = false AND username_id IS NULL) AS customer,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE ${activeSubscriberSql}) AS subscriber,
        (SELECT COUNT(*)::int FROM subscribers s
          INNER JOIN available_usernames au ON au.id = s.username_id
          WHERE ${expiringSoonSql} OR ${expiredSql}) AS expiring,
        (SELECT COUNT(*)::int FROM subscribers WHERE is_suspended = true) AS stopped
    `),
  ]);

  const overviewRow = queryRows<{
    total_records: string;
    customers_only: string;
    total_subscribers: string;
    active_subscribers: string;
    expiring_soon: string;
    expired: string;
    stopped: string;
    available_pool: string;
    new_this_month: string;
  }>(overviewRows)[0];

  const weekRow = queryRows<{
    new_subscribers: string;
    usernames_added: string;
    speed_changes: string;
    username_changes: string;
  }>(thisWeekRows)[0];

  const summaryRow = queryRows<{
    total: string;
    active: string;
    suspended: string;
    disabled: string;
    new_count: string;
  }>(summaryRows)[0];

  const speedTiers = queryRows<{ id: number; speed_value: number; price: string }>(speedTierRows).map((row) => ({
    id: row.id,
    speedMbps: row.speed_value,
    label: speedLabel(row.speed_value),
  }));

  const categories = ["full", "half", "quarter", "low"] as const;
  const breakdownBySpeed = speedTiers.map((tier) => {
    const rowsForSpeed = queryRows<PoolBreakdownRow>(poolBreakdownRows).filter(
      (r) => r.speed === tier.speedMbps,
    );
    return {
      speed: tier.speedMbps,
      label: tier.label,
      breakdown: categories.map((category) => ({
        category,
        count: toNumber(rowsForSpeed.find((r) => r.category === category)?.count),
      })),
    };
  });

  const summary = {
    total: toNumber(summaryRow?.total),
    active: toNumber(summaryRow?.active),
    suspended: toNumber(summaryRow?.suspended),
    disabled: toNumber(summaryRow?.disabled),
    new: toNumber(summaryRow?.new_count),
  };

  const customerRow = queryRows<{
    customer: string;
    subscriber: string;
    expiring: string;
    stopped: string;
  }>(customerBreakdownRows)[0];

  return {
    overview: {
      totalRecords: toNumber(overviewRow?.total_records),
      totalSubscribers: toNumber(overviewRow?.total_subscribers),
      customersOnly: toNumber(overviewRow?.customers_only),
      activeSubscribers: toNumber(overviewRow?.active_subscribers),
      totalAvailableUsernames: toNumber(overviewRow?.available_pool),
      expiringSubscribers: toNumber(overviewRow?.expiring_soon),
      expiredSubscribers: toNumber(overviewRow?.expired),
      stoppedSubscribers: toNumber(overviewRow?.stopped),
      newThisMonth: toNumber(overviewRow?.new_this_month),
    },
    thisWeek: {
      newSubscribers: toNumber(weekRow?.new_subscribers),
      availableUsernamesAdded: toNumber(weekRow?.usernames_added),
      speedChanges: toNumber(weekRow?.speed_changes),
      usernameChanges: toNumber(weekRow?.username_changes),
    },
    thisMonth: {
      newSubscribers: toNumber(overviewRow?.new_this_month),
    },
    speedTiers,
    subscribersBySpeed: queryRows<SpeedCountRow>(subscribersBySpeedRows).map((row) => ({
      speed: row.speed,
      label: row.label || speedLabel(row.speed),
      count: toNumber(row.count),
    })),
    availableBySpeed: queryRows<SpeedCountRow>(availableBySpeedRows).map((row) => ({
      speed: row.speed,
      label: row.label || speedLabel(row.speed),
      count: toNumber(row.count),
    })),
    facilityTypes: queryRows<FacilityRow>(facilityRows).map((row) => ({
      facilityType: row.facility_type,
      count: toNumber(row.count),
    })),
    newSubscriberDayCounts: fillRecentDayCounts(
      queryRows<DailyRow>(newSubscriberCountRows),
      now,
    ),
    usernameChangeDayCounts: fillRecentDayCounts(
      queryRows<DailyRow>(usernameChangeCountRows),
      now,
    ),
    charts: {
      dailyNewSubscribers: fillDailySeries(queryRows<DailyRow>(dailyNewRows), now),
      dailyAvailableAdded: fillDailySeries(queryRows<DailyRow>(dailyAvailableRows), now),
    },
    availableDaysBreakdownBySpeed: breakdownBySpeed,
    customerBreakdown: {
      customer: toNumber(customerRow?.customer),
      subscriber: toNumber(customerRow?.subscriber),
      expiring: toNumber(customerRow?.expiring),
      stopped: toNumber(customerRow?.stopped),
    },
    subscription: {
      year,
      summary,
      distribution: queryRows<{ status: string; count: string }>(distributionRows).map((row) => ({
        status: row.status as "new" | "active" | "disabled" | "suspended",
        count: toNumber(row.count),
      })),
      monthlyTrend: queryRows<MonthTrendRow>(monthlyTrendRows).map((row) => ({
        month: row.month,
        active: toNumber(row.active),
        suspended: toNumber(row.suspended),
        disabled: toNumber(row.disabled),
        new: toNumber(row.new),
      })),
    },
  };
}

export async function getUsernameChangesByDate(
  dateStr: string,
  page = 1,
  limit = 8,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const db = getDb();
  const [countRows, rows] = await Promise.all([
    db.execute<{ total: string }>(sql`
      SELECT COUNT(*)::int AS total
      FROM username_history h
      WHERE DATE(h.changed_at AT TIME ZONE 'UTC') = ${dateStr}::date
    `),
    db.execute<UsernameChangeRow>(sql`
      SELECT
        h.id,
        h.subscriber_id,
        s.line_id,
        s.full_name,
        s.phone,
        h.old_username,
        au.username AS current_username,
        h.changed_at
      FROM username_history h
      INNER JOIN subscribers s ON s.id = h.subscriber_id
      LEFT JOIN available_usernames au ON au.id = s.username_id
      WHERE DATE(h.changed_at AT TIME ZONE 'UTC') = ${dateStr}::date
      ORDER BY h.changed_at DESC
      LIMIT ${safeLimit} OFFSET ${offset}
    `),
  ]);

  const total = toNumber(queryRows<{ total: string }>(countRows)[0]?.total);

  return {
    items: mapUsernameChangeRows(queryRows<UsernameChangeRow>(rows)),
    total,
    page: safePage,
    limit: safeLimit,
  };
}

function mapNewSubscriberRows(rows: RecentSubscriberRow[]) {
  return rows.map((row) => ({
    id: row.id,
    lineId: row.line_id,
    username: row.username,
    fullName: row.full_name,
    phone: row.phone,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function getNewSubscribersByDate(
  dateStr: string,
  page = 1,
  limit = 8,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const db = getDb();
  const [countRows, rows] = await Promise.all([
    db.execute<{ total: string }>(sql`
      SELECT COUNT(*)::int AS total
      FROM subscribers s
      WHERE DATE(s.created_at AT TIME ZONE 'UTC') = ${dateStr}::date
    `),
    db.execute<RecentSubscriberRow>(sql`
      SELECT s.id, s.line_id, au.username, s.full_name, s.phone, s.created_at
      FROM subscribers s
      LEFT JOIN available_usernames au ON au.id = s.username_id
      WHERE DATE(s.created_at AT TIME ZONE 'UTC') = ${dateStr}::date
      ORDER BY s.created_at DESC, s.id DESC
      LIMIT ${safeLimit} OFFSET ${offset}
    `),
  ]);

  const total = toNumber(queryRows<{ total: string }>(countRows)[0]?.total);

  return {
    items: mapNewSubscriberRows(queryRows<RecentSubscriberRow>(rows)),
    total,
    page: safePage,
    limit: safeLimit,
  };
}
