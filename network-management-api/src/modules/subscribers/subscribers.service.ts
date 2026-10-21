import { getDb } from "../../config/db";
import { subscribers } from "../../db/schema/subscribers";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { usernameHistory } from "../../db/schema/usernameHistory";
import { speedHistory } from "../../db/schema/speedHistory";
import { invoices } from "../../db/schema/invoices";
import { smsLogs } from "../../db/schema/smsLogs";
import { eq, desc, ilike, and, or, exists, sql, count, isNotNull, like, inArray, lte, type SQL } from "drizzle-orm";
import type { ParsedSubscriberImportRow } from "./subscribers.excel";
import type { ParsedUsernameHistoryImportRow } from "./username-history.excel";
import { isFullLineId, normalizeLineId } from "./username-history.excel";
import { activityLogs } from "../../db/schema/activityLogs";
import { UpdateSubscriberInput } from "./subscribers.validation";
import { speedTiers } from "../../db/schema/speedTiers";
import AppError from "../../utils/appError";
import { normalizeUsername } from "../../utils/excelCell.util";
import { addDays, differenceInCalendarDays } from "date-fns";
import cloudinary from "../../config/cloudinary";
import { routers } from "../../db/schema/routers";
import { normalizeRouterPortForDb } from "../../utils/routerPort.util";
import { supportsSameUsernameRenewalSpeed } from "../usernames/usernameRenewal.util";

type UsernameSnapshot = {
  id: number;
  username: string;
  password: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isExpired: boolean | null;
};

function isUsernameExpired(row: { isExpired?: boolean | null; endDate?: Date | null }): boolean {
  if (row.isExpired) return true;
  if (row.endDate && new Date(row.endDate) < new Date()) return true;
  return false;
}

/** Returns username to pool; keeps start/end dates so expiry keeps counting. */
async function releaseUsernameToPool(db: ReturnType<typeof getDb>, usernameId: number) {
  await db.update(availableUsernames).set({ isUsed: false }).where(eq(availableUsernames.id, usernameId));
}

async function recordUsernameHistory(
  db: ReturnType<typeof getDb>,
  subscriberId: number,
  old: Pick<UsernameSnapshot, "username" | "password" | "startDate" | "endDate">,
  usageEndDate: Date = new Date(),
  changeCause?: string
) {
  await db.insert(usernameHistory).values({
    subscriberId,
    oldUsername: old.username,
    oldPassword: old.password,
    usageStartDate: old.startDate,
    usageEndDate,
    changeCause,
    changedAt: new Date(),
  });
}

/**
 * When removing a username from a subscriber:
 * - Not expired → back to available pool (isUsed=false, dates unchanged).
 * - Expired → history only; row does not re-enter the pool.
 */
async function detachUsernameFromSubscriber(
  db: ReturnType<typeof getDb>,
  subscriberId: number,
  snapshot: UsernameSnapshot,
  changeCause?: string
) {
  const usageEnd = new Date();
  await recordUsernameHistory(
    db,
    subscriberId,
    {
      username: snapshot.username,
      password: snapshot.password,
      startDate: snapshot.startDate,
      endDate: snapshot.endDate,
    },
    usageEnd,
    changeCause
  );

  if (!isUsernameExpired(snapshot)) {
    await releaseUsernameToPool(db, snapshot.id);
  }

  await db.update(subscribers).set({ usernameID: null }).where(eq(subscribers.id, subscriberId));
}

export async function getSubscribers(
  suspended: boolean,
  expired: boolean,
  paused: boolean,
  page = 1,
  limit = 50,
  search?: string,
  speed?: number
) {
  const db = getDb();
  const conditions = [eq(subscribers.isSuspended, suspended), eq(subscribers.isPaused, paused)];

  // Stopped list: all suspended rows. Expiring page: expired flag OR disconnect within 7 days.
  if (!suspended) {
    if (expired) {
      conditions.push(
        or(
          eq(availableUsernames.isExpired, true),
          and(
            isNotNull(availableUsernames.endDate),
            lte(availableUsernames.endDate, sql`NOW() + INTERVAL '7 days'`),
          ),
        )!,
      );
    } else {
      conditions.push(eq(availableUsernames.isExpired, false));
    }
  }

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(availableUsernames.username, `%${search}%`),
        ilike(subscribers.fullName, `%${search}%`),
        ilike(subscribers.phone, `%${search}%`),
        ilike(subscribers.lineId, `%${search}%`),
        exists(
          db
            .select({ id: usernameHistory.id })
            .from(usernameHistory)
            .where(and(eq(usernameHistory.subscriberId, subscribers.id), ilike(usernameHistory.oldUsername, term)))
        )
      )!
    );
  }
  if (speed !== undefined && !Number.isNaN(speed)) {
    conditions.push(eq(speedTiers.speedValue, speed));
  }
  const whereClause = and(...conditions);
  const offset = (page - 1) * limit;

  const selectFields = {
    id: subscribers.id,
    lineId: subscribers.lineId,
    usernameID: subscribers.usernameID,
    username: availableUsernames.username,
    password: availableUsernames.password,
    speedId: availableUsernames.speedId,
    speedValue: speedTiers.speedValue,
    fullName: subscribers.fullName,
    facilityType: subscribers.facilityType,
    phone: subscribers.phone,
    monthlyPrice: subscribers.monthlyPrice,
    startDate: availableUsernames.startDate,
    endDate: availableUsernames.endDate,
    totalUsage: availableUsernames.totalUsage,
    usageLimit: availableUsernames.usageLimit,
    uploadUsage: availableUsernames.uploadUsage,
    downloadUsage: availableUsernames.downloadUsage,
    isOwnerUsername: availableUsernames.isOwnerUsername,
    isSuspended: subscribers.isSuspended,
    isPaused: subscribers.isPaused,
    notes: subscribers.notes,
    balance: subscribers.balance,
    createdAt: subscribers.createdAt,
    suspendAt: subscribers.suspendAt,
    routerId: subscribers.routerId,
    routerPort: subscribers.routerPort,
    routerName: routers.routerName,
    routerImage: routers.routerImage,
  };

  const baseQuery = db.select(selectFields).from(subscribers);

  const data = await (
    suspended
      ? baseQuery
          .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
          .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
          .leftJoin(routers, eq(subscribers.routerId, routers.id))
      : baseQuery
          .innerJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
          .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
          .leftJoin(routers, eq(subscribers.routerId, routers.id))
  )
    .where(whereClause)
    .orderBy(desc(subscribers.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    data,
    total: data.length,
    page,
    limit,
  };
}

export async function getSubscriberById(id: number) {
  const db = getDb();
  const result = await db
    .select({
      id: subscribers.id,
      lineId: subscribers.lineId,
      usernameID: subscribers.usernameID,
      username: availableUsernames.username,
      password: availableUsernames.password,
      totalUsage: availableUsernames.totalUsage,
      speedId: availableUsernames.speedId,
      speedValue: speedTiers.speedValue,
      fullName: subscribers.fullName,
      facilityType: subscribers.facilityType,
      routerName: routers.routerName,
      routerImage: routers.routerImage,
      routerId: subscribers.routerId,
      routerPort: subscribers.routerPort,
      phone: subscribers.phone,
      monthlyPrice: subscribers.monthlyPrice,
      startDate: availableUsernames.startDate,
      endDate: availableUsernames.endDate,
      isOwnerUsername: availableUsernames.isOwnerUsername,
      notes: subscribers.notes,
      isSuspended: subscribers.isSuspended,
      isPaused: subscribers.isPaused,
      suspendAt: subscribers.suspendAt,
      balance: subscribers.balance,
    })
    .from(subscribers)
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
    .leftJoin(routers, eq(subscribers.routerId, routers.id))
    .where(eq(subscribers.id, id))
    .limit(1);
  return result[0] || null;
}

export async function updateSubscriber(id: number, data: UpdateSubscriberInput) {
  const db = getDb();

  const existing = await getSubscriberById(id);
  if (!existing) {
    throw new AppError("Subscriber not found", 404);
  }

  const updateData: Record<string, unknown> = {};

  if (data.fullName) updateData.fullName = data.fullName;
  if (data.facilityType !== undefined) updateData.facilityType = data.facilityType;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.monthlyPrice !== undefined) updateData.monthlyPrice = parseFloat(data.monthlyPrice.toString());
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.routerPort !== undefined) updateData.routerPort = normalizeRouterPortForDb(data.routerPort);
  const stopping = data.isSuspended === true && !existing.isSuspended;
  const reactivating = data.isSuspended === false && existing.isSuspended;

  if (data.isSuspended !== undefined) updateData.isSuspended = data.isSuspended;
  if (data.isPaused !== undefined) updateData.isPaused = data.isPaused;

  if (stopping) {
    updateData.suspendAt = new Date();
    if (existing.usernameID) {
      const [row] = await db
        .select()
        .from(availableUsernames)
        .where(eq(availableUsernames.id, existing.usernameID))
        .limit(1);

      if (row) {
        await detachUsernameFromSubscriber(
          db,
          id,
          {
            id: row.id,
            username: row.username,
            password: row.password,
            startDate: row.startDate,
            endDate: row.endDate,
            isExpired: row.isExpired,
          },
          "Stopping the subscriber"
        );
      } else {
        await db.update(subscribers).set({ usernameID: null }).where(eq(subscribers.id, id));
      }
      updateData.usernameID = null;
    }
  }

  if (reactivating) {
    updateData.suspendAt = null;
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(subscribers).set(updateData).where(eq(subscribers.id, id));
  }

  if (data.password !== undefined && data.password !== null && existing.usernameID) {
    await db
      .update(availableUsernames)
      .set({ password: data.password })
      .where(eq(availableUsernames.id, existing.usernameID));
  }

  return getSubscriberById(id);
}

async function cleanupSubscriberRelations(db: ReturnType<typeof getDb>, subscriberIds: number[]) {
  if (subscriberIds.length === 0) return;

  const subscriberFilter =
    subscriberIds.length === 1
      ? eq(subscribers.id, subscriberIds[0]!)
      : inArray(subscribers.id, subscriberIds);

  const linkedUsernames = await db
    .select({
      usernameId: availableUsernames.id,
      isExpired: availableUsernames.isExpired,
      endDate: availableUsernames.endDate,
    })
    .from(subscribers)
    .innerJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .where(subscriberFilter);

  const releasableUsernameIds = linkedUsernames
    .filter((row) => !isUsernameExpired(row))
    .map((row) => row.usernameId);

  if (releasableUsernameIds.length > 0) {
    await db
      .update(availableUsernames)
      .set({ isUsed: false })
      .where(inArray(availableUsernames.id, releasableUsernameIds));
  }

  const relationFilter =
    subscriberIds.length === 1
      ? eq(invoices.subscriberId, subscriberIds[0]!)
      : inArray(invoices.subscriberId, subscriberIds);

  await db.delete(invoices).where(relationFilter);
  await db
    .delete(usernameHistory)
    .where(
      subscriberIds.length === 1
        ? eq(usernameHistory.subscriberId, subscriberIds[0]!)
        : inArray(usernameHistory.subscriberId, subscriberIds),
    );
  await db
    .delete(speedHistory)
    .where(
      subscriberIds.length === 1
        ? eq(speedHistory.subscriberId, subscriberIds[0]!)
        : inArray(speedHistory.subscriberId, subscriberIds),
    );
  await db
    .update(smsLogs)
    .set({ subscriberId: null })
    .where(
      subscriberIds.length === 1
        ? eq(smsLogs.subscriberId, subscriberIds[0]!)
        : inArray(smsLogs.subscriberId, subscriberIds),
    );
}

export async function deleteSubscriber(id: number) {
  const db = getDb();
  const existing = await getSubscriberById(id);
  if (!existing) {
    throw new AppError("Subscriber not found", 404);
  }

  await db.transaction(async (tx) => {
    await cleanupSubscriberRelations(tx, [id]);
    await tx.delete(subscribers).where(eq(subscribers.id, id));
  });
}

export async function deleteAllSubscribers() {
  const db = getDb();

  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: subscribers.id }).from(subscribers);
    const ids = rows.map((row) => row.id);
    if (ids.length === 0) return;

    await cleanupSubscriberRelations(tx, ids);
    await tx.delete(subscribers);
  });
}

export async function deleteSubscribersBulk(ids: number[]) {
  const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) return 0;

  const db = getDb();
  await db.transaction(async (tx) => {
    await cleanupSubscriberRelations(tx, uniqueIds);
    await tx.delete(subscribers).where(inArray(subscribers.id, uniqueIds));
  });

  return uniqueIds.length;
}

export async function getSubscribersAboutToDisconnect(daysAhead = 7) {
  const db = getDb();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return db.select().from(subscribers).where(eq(subscribers.isSuspended, false));
  // Note: Date comparison would need to be done in application code for Drizzle
}

export async function assignUsernameToSubscriber(
  subscriberId: number,
  createdBy: number,
  availableUsernameId: number,
  changeCause?: string
) {
  const db = getDb();

  const sub = await getSubscriberById(subscriberId);
  if (!sub) throw new AppError("Subscriber not found", 404);

  const availUsername = await db
    .select({
      id: availableUsernames.id,
      username: availableUsernames.username,
      password: availableUsernames.password,
      speedId: availableUsernames.speedId,
      speedValue: speedTiers.speedValue,
      speedPrice: speedTiers.price,
      startDate: availableUsernames.startDate,
      endDate: availableUsernames.endDate,
      isUsed: availableUsernames.isUsed,
      isExpired: availableUsernames.isExpired,
    })
    .from(availableUsernames)
    .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
    .where(
      and(
        eq(availableUsernames.id, availableUsernameId),
        eq(availableUsernames.isExpired, false),
        eq(speedTiers.deleted, false)
      )
    )
    .limit(1);

  if (!availUsername.length) {
    throw new AppError("Available username not found, already in use, or expired", 400);
  }

  const [assignedOwner] = await db
    .select({ id: subscribers.id, lineId: subscribers.lineId })
    .from(subscribers)
    .where(eq(subscribers.usernameID, availableUsernameId))
    .limit(1);

  if (assignedOwner && assignedOwner.id !== subscriberId) {
    throw new AppError(`Username is already assigned to another subscriber (${assignedOwner.lineId})`, 400);
  }

  const username = availUsername[0];

  if (sub.usernameID && sub.username) {
    const [oldRow] = await db
      .select()
      .from(availableUsernames)
      .where(eq(availableUsernames.id, sub.usernameID))
      .limit(1);

    if (oldRow) {
      await detachUsernameFromSubscriber(
        db,
        subscriberId,
        {
          id: oldRow.id,
          username: oldRow.username,
          password: oldRow.password,
          startDate: oldRow.startDate,
          endDate: oldRow.endDate,
          isExpired: oldRow.isExpired,
        },
        changeCause
      );
    }
  }

  const reactivatingStopped = Boolean(sub.isSuspended);
  const now = new Date();

  await db
    .update(subscribers)
    .set({
      usernameID: username.id,
      ...(reactivatingStopped ? { isSuspended: false, suspendAt: null } : {}),
    })
    .where(eq(subscribers.id, subscriberId));

  const oldSpeed = sub.speedValue ?? 0;
  const newSpeed = username.speedValue ?? 0;
  const speedChanged = oldSpeed !== newSpeed;

  if (speedChanged && newSpeed > 0) {
    const usageStart = sub.startDate ?? now;
    const daysUsed = Math.max(0, differenceInCalendarDays(now, usageStart));

    await db.insert(speedHistory).values({
      subscriberId,
      oldSpeed: reactivatingStopped && oldSpeed === 0 ? 0 : oldSpeed,
      newSpeed,
      usageStartDate: usageStart,
      usageEndDate: now,
      daysUsed,
      changedAt: now,
    });
  }

  await db
    .update(availableUsernames)
    .set({
      isUsed: true,
      ...(username.startDate === null && {
        startDate: now,
        endDate: addDays(now, 30),
      }),
    })
    .where(eq(availableUsernames.id, availableUsernameId));

  let tierPrice = Number(username.speedPrice ?? 0);
  if (sub.monthlyPrice !== null && !isNaN(Number(sub.monthlyPrice)) && Number(sub.monthlyPrice) >= 0) {
    tierPrice = Number(sub.monthlyPrice);
  }

  // balance negative balance means the subscriber owes money).
  if (tierPrice > 0) {
    await db.transaction(async (tx) => {
      // Update subscriber balance
      await tx
        .update(subscribers)
        .set({ balance: sql`${subscribers.balance} - ${tierPrice}` })
        .where(eq(subscribers.id, subscriberId));

      // Create invoice for the charge
      await tx.insert(invoices).values({
        subscriberId,
        createdBy,
        amount: String(tierPrice),
        paidAmount: String(0),
        paymentMethod: "credit",
        status: "debt",
        notes: `Charge for username assignment (${username.username})`,
      });
    });
  }

  return getSubscriberById(subscriberId);
}

/**
 * Start a new 30-day billing period on the same username (owner lines and 4/8/16 Mbps reusable pool).
 * Keeps the username assigned, records the ended period, creates an invoice, and resets usage counters.
 */
export async function renewUsernameBillingCycle(
  subscriberId: number,
  createdBy: number,
  changeCause?: string,
) {
  const db = getDb();

  const sub = await getSubscriberById(subscriberId);
  if (!sub) throw new AppError("Subscriber not found", 404);
  if (!sub.usernameID) throw new AppError("Subscriber has no assigned username", 400);

  const [usernameRow] = await db
    .select({
      id: availableUsernames.id,
      username: availableUsernames.username,
      password: availableUsernames.password,
      speedId: availableUsernames.speedId,
      startDate: availableUsernames.startDate,
      endDate: availableUsernames.endDate,
      isOwnerUsername: availableUsernames.isOwnerUsername,
    })
    .from(availableUsernames)
    .where(eq(availableUsernames.id, sub.usernameID))
    .limit(1);

  if (!usernameRow) throw new AppError("Assigned username not found", 404);

  const [speedTier] = await db
    .select({ speedValue: speedTiers.speedValue })
    .from(speedTiers)
    .where(and(eq(speedTiers.id, usernameRow.speedId), eq(speedTiers.deleted, false)))
    .limit(1);

  const canRenewSameUsername =
    usernameRow.isOwnerUsername ||
    (speedTier != null && supportsSameUsernameRenewalSpeed(speedTier.speedValue));
  if (!canRenewSameUsername) {
    throw new AppError("This speed does not support renewing the same username", 400);
  }

  const now = new Date();
  const usageEnd =
    usernameRow.endDate && new Date(usernameRow.endDate) < now
      ? new Date(usernameRow.endDate)
      : now;

  if (usernameRow.startDate) {
    await recordUsernameHistory(
      db,
      subscriberId,
      {
        username: usernameRow.username,
        password: usernameRow.password,
        startDate: usernameRow.startDate,
        endDate: usernameRow.endDate,
      },
      usageEnd,
      changeCause ?? "Monthly renewal (same username)",
    );
  }

  const newEnd = addDays(now, 30);

  await db
    .update(availableUsernames)
    .set({
      startDate: now,
      endDate: newEnd,
      isUsed: true,
      isExpired: false,
      totalUsage: 0,
      uploadUsage: 0,
      downloadUsage: 0,
      lastUploadUsage: 0,
      lastDownloadUsage: 0,
    })
    .where(eq(availableUsernames.id, usernameRow.id));

  let tierPrice = 0;
  if (sub.monthlyPrice !== null && !isNaN(Number(sub.monthlyPrice)) && Number(sub.monthlyPrice) >= 0) {
    tierPrice = Number(sub.monthlyPrice);
  } else {
    const [tier] = await db
      .select({ price: speedTiers.price })
      .from(speedTiers)
      .where(and(eq(speedTiers.id, usernameRow.speedId), eq(speedTiers.deleted, false)))
      .limit(1);
    tierPrice = Number(tier?.price ?? 0);
  }

  if (tierPrice > 0) {
    await db.transaction(async (tx) => {
      await tx
        .update(subscribers)
        .set({ balance: sql`${subscribers.balance} - ${tierPrice}` })
        .where(eq(subscribers.id, subscriberId));

      await tx.insert(invoices).values({
        subscriberId,
        createdBy,
        amount: String(tierPrice),
        paidAmount: String(0),
        paymentMethod: "credit",
        status: "debt",
        notes: `Monthly renewal (${usernameRow.username})`,
      });
    });
  }

  return getSubscriberById(subscriberId);
}

export async function getUsernameHistory(subscriberId: number) {
  const db = getDb();
  return db
    .select()
    .from(usernameHistory)
    .where(eq(usernameHistory.subscriberId, subscriberId))
    .orderBy(desc(usernameHistory.changedAt));
}

export async function getSpeedHistory(subscriberId: number) {
  const db = getDb();
  return db
    .select()
    .from(speedHistory)
    .where(eq(speedHistory.subscriberId, subscriberId))
    .orderBy(desc(speedHistory.changedAt));
}

export interface SubscriberLogsListParams {
  page?: number;
  limit?: number;
}

export async function getSubscriberLogs(subscriberId: number, params: SubscriberLogsListParams = {}) {
  const db = getDb();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 15));
  const offset = (page - 1) * limit;

  const endpointPattern = `%/subscribers/${subscriberId}%`;
  const condition: SQL = or(eq(activityLogs.subjectId, subscriberId), ilike(activityLogs.endpoint, endpointPattern))!;

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: activityLogs.id,
        adminId: activityLogs.adminId,
        adminName: activityLogs.adminName,
        action: activityLogs.action,
        subjectType: activityLogs.subjectType,
        subjectId: activityLogs.subjectId,
        subjectName: activityLogs.subjectName,
        method: activityLogs.method,
        endpoint: activityLogs.endpoint,
        statusCode: activityLogs.statusCode,
        ipAddress: activityLogs.ipAddress,
        details: activityLogs.details,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .where(condition)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(activityLogs).where(condition),
  ]);

  const total = Number(totalRow[0]?.total ?? 0);

  return {
    items: rows,
    total,
    page,
    limit,
  };
}

async function generateLineIdFromPackageLine(packageLine: string): Promise<string> {
  const db = getDb();
  const paddedLine = String(packageLine).padStart(2, "0");
  const linePrefix = `W${paddedLine}-`;

  const [latestSubscriber] = await db
    .select({ lineId: subscribers.lineId })
    .from(subscribers)
    .where(and(isNotNull(subscribers.lineId), like(subscribers.lineId, `${linePrefix}%`)))
    .orderBy(desc(subscribers.createdAt))
    .limit(1);

  let nextSequence = 101;
  if (latestSubscriber?.lineId) {
    const parts = latestSubscriber.lineId.split("-");
    if (parts.length >= 2) {
      const lastSequence = Number(parts[parts.length - 1]);
      if (!Number.isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }
  }

  return `${linePrefix}${String(nextSequence).padStart(3, "0")}`;
}

function parsePackageLineFromLineId(lineId: string): string | null {
  const match = /^W(\d+)-/i.exec(lineId.trim());
  return match ? match[1] : null;
}

function parseImportPausedStatus(status?: string): boolean | undefined {
  if (!status?.trim()) return undefined;
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("موقف") || normalized.includes("paused")) return true;
  if (normalized.includes("نشط") || normalized === "active") return false;
  return undefined;
}

function resolveImportUsernameDates(row: ParsedSubscriberImportRow): {
  startDate: Date | null;
  endDate: Date | null;
  isExpired: boolean;
} {
  let endDate: Date | null = null;
  if (row.firstContactDate) {
    endDate = row.disconnectionDate ?? addDays(row.firstContactDate, 30);
  } else if (row.disconnectionDate) {
    endDate = row.disconnectionDate;
  }

  return {
    startDate: row.firstContactDate ?? null,
    endDate,
    isExpired: endDate ? endDate < new Date() : false,
  };
}

type ImportSubscriberState = {
  id: number;
  usernameID: number | null;
};

type ImportContext = {
  db: ReturnType<typeof getDb>;
  subscriberByLineId: Map<string, ImportSubscriberState>;
  subscriberById: Map<number, ImportSubscriberState>;
  subscriberByUsername: Map<string, number>;
  usernameByName: Map<string, { id: number; assignedSubscriberId: number | null }>;
  speedTierByMbps: Map<number, number>;
  lineSequenceByPrefix: Map<string, number>;
};

async function buildImportContext(): Promise<ImportContext> {
  const db = getDb();

  const [allSubs, usernameRows, tierRows] = await Promise.all([
    db
      .select({
        id: subscribers.id,
        lineId: subscribers.lineId,
        usernameID: subscribers.usernameID,
      })
      .from(subscribers),
    db
      .select({
        id: availableUsernames.id,
        username: availableUsernames.username,
      })
      .from(availableUsernames),
    db
      .select({ id: speedTiers.id, speedValue: speedTiers.speedValue })
      .from(speedTiers)
      .where(eq(speedTiers.deleted, false)),
  ]);

  const subscriberByLineId = new Map<string, ImportSubscriberState>();
  const subscriberById = new Map<number, ImportSubscriberState>();
  const subscriberByUsername = new Map<string, number>();
  const lineSequenceByPrefix = new Map<string, number>();

  for (const sub of allSubs) {
    const state: ImportSubscriberState = { id: sub.id, usernameID: sub.usernameID ?? null };
    subscriberById.set(sub.id, state);
    if (sub.lineId) {
      subscriberByLineId.set(sub.lineId, state);
      const match = /^W(\d+)-(\d+)$/i.exec(sub.lineId);
      if (match) {
        const prefix = `W${match[1]}-`;
        const seq = Number(match[2]);
        const current = lineSequenceByPrefix.get(prefix) ?? 0;
        if (seq > current) lineSequenceByPrefix.set(prefix, seq);
      }
    }
  }

  const usernameIdToName = new Map<number, string>();
  for (const row of usernameRows) {
    usernameIdToName.set(row.id, row.username);
  }

  for (const sub of allSubs) {
    if (sub.usernameID) {
      const username = usernameIdToName.get(sub.usernameID);
      if (username) subscriberByUsername.set(username, sub.id);
    }
  }

  const usernameIdToSubscriberId = new Map<number, number>();
  for (const sub of allSubs) {
    if (sub.usernameID) usernameIdToSubscriberId.set(sub.usernameID, sub.id);
  }

  const usernameByName = new Map<string, { id: number; assignedSubscriberId: number | null }>();
  for (const row of usernameRows) {
    const key = normalizeUsername(row.username);
    const entry = {
      id: row.id,
      assignedSubscriberId: usernameIdToSubscriberId.get(row.id) ?? null,
    };
    usernameByName.set(key, entry);
    if (row.username !== key) usernameByName.set(row.username, entry);
  }

  const speedTierByMbps = new Map<number, number>();
  for (const tier of tierRows) {
    speedTierByMbps.set(tier.speedValue, tier.id);
  }

  return {
    db,
    subscriberByLineId,
    subscriberById,
    subscriberByUsername,
    usernameByName,
    speedTierByMbps,
    lineSequenceByPrefix,
  };
}

function resolveSpeedTierIdFromContext(ctx: ImportContext, speedMbps: number): number {
  const tierId = ctx.speedTierByMbps.get(speedMbps);
  if (!tierId) {
    throw new AppError(`Speed tier not found for ${speedMbps} Mbps`, 400);
  }
  return tierId;
}

function findSubscriberIdForImport(ctx: ImportContext, row: ParsedSubscriberImportRow): number | null {
  if (row.lineId) {
    const normalized = isFullLineId(row.lineId) ? normalizeLineId(row.lineId) : row.lineId.trim();
    const found = ctx.subscriberByLineId.get(normalized);
    if (found) return found.id;
  }

  if (row.username) {
    const byUsername = ctx.subscriberByUsername.get(row.username);
    if (byUsername) return byUsername;
  }

  return null;
}

function nextLineIdFromPackage(ctx: ImportContext, packageLine: string): string {
  const paddedLine = String(packageLine).padStart(2, "0");
  const prefix = `W${paddedLine}-`;
  const currentMax = ctx.lineSequenceByPrefix.get(prefix) ?? 100;
  const nextSequence = currentMax >= 101 ? currentMax + 1 : 101;
  ctx.lineSequenceByPrefix.set(prefix, nextSequence);
  return `${prefix}${String(nextSequence).padStart(3, "0")}`;
}

function resolveLineIdForImport(
  ctx: ImportContext,
  lineId: string | undefined,
  speedMbps: number,
): string {
  if (!lineId?.trim()) {
    return nextLineIdFromPackage(ctx, String(speedMbps));
  }

  const trimmed = lineId.trim();
  if (isFullLineId(trimmed)) {
    return normalizeLineId(trimmed);
  }

  if (/^\d{1,2}$/.test(trimmed)) {
    return nextLineIdFromPackage(ctx, trimmed);
  }

  return trimmed;
}

async function applyImportUsernameCharge(
  db: ReturnType<typeof getDb>,
  subscriberId: number,
  username: string,
  speedId: number,
  createdBy: number,
) {
  const [sub] = await db
    .select({ monthlyPrice: subscribers.monthlyPrice })
    .from(subscribers)
    .where(eq(subscribers.id, subscriberId))
    .limit(1);
  const [tier] = await db
    .select({ price: speedTiers.price })
    .from(speedTiers)
    .where(eq(speedTiers.id, speedId))
    .limit(1);

  let tierPrice = Number(tier?.price ?? 0);
  if (
    sub?.monthlyPrice != null &&
    !Number.isNaN(Number(sub.monthlyPrice)) &&
    Number(sub.monthlyPrice) >= 0
  ) {
    tierPrice = Number(sub.monthlyPrice);
  }

  if (tierPrice <= 0) return;

  await db.transaction(async (tx) => {
    await tx
      .update(subscribers)
      .set({ balance: sql`${subscribers.balance} - ${tierPrice}` })
      .where(eq(subscribers.id, subscriberId));

    await tx.insert(invoices).values({
      subscriberId,
      createdBy,
      amount: String(tierPrice),
      paidAmount: "0",
      paymentMethod: "credit",
      status: "debt",
      notes: `Charge for username import (${username})`,
    });
  });
}

async function resolveExistingUsernameForImport(
  ctx: ImportContext,
  username: string,
): Promise<{ id: number; assignedSubscriberId: number | null } | null> {
  const key = normalizeUsername(username);
  const cached = ctx.usernameByName.get(key) ?? ctx.usernameByName.get(username);
  if (cached) return cached;

  const [row] = await ctx.db
    .select({ id: availableUsernames.id, username: availableUsernames.username })
    .from(availableUsernames)
    .where(eq(availableUsernames.username, key))
    .limit(1);

  if (!row) return null;

  const [sub] = await ctx.db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.usernameID, row.id))
    .limit(1);

  const resolved = {
    id: row.id,
    assignedSubscriberId: sub?.id ?? null,
  };
  ctx.usernameByName.set(key, resolved);
  if (row.username !== key) ctx.usernameByName.set(row.username, resolved);
  return resolved;
}

async function upsertUsernameForImportWithContext(
  ctx: ImportContext,
  subscriberId: number,
  row: ParsedSubscriberImportRow,
  speedMbps: number,
  createdBy?: number,
) {
  if (!row.username) return;

  const db = ctx.db;
  const subState = ctx.subscriberById.get(subscriberId);
  if (!subState) throw new AppError("Subscriber not found", 404);

  const speedId = resolveSpeedTierIdFromContext(ctx, speedMbps);
  const password = row.password ?? "";
  const importDates = resolveImportUsernameDates(row);
  const usernameKey = normalizeUsername(row.username);

  const existingUsername = await resolveExistingUsernameForImport(ctx, usernameKey);
  let usernameId = existingUsername?.id;

  if (existingUsername) {
    if (existingUsername.assignedSubscriberId && existingUsername.assignedSubscriberId !== subscriberId) {
      throw new AppError(`Username "${usernameKey}" is assigned to another subscriber`, 409);
    }

    const usernameUpdate: Record<string, unknown> = {
      isUsed: true,
      speedId,
    };
    if (password) usernameUpdate.password = password;
    if (row.firstContactDate) {
      usernameUpdate.startDate = importDates.startDate;
      usernameUpdate.endDate = importDates.endDate;
      usernameUpdate.isExpired = importDates.isExpired;
    } else if (row.disconnectionDate) {
      usernameUpdate.endDate = importDates.endDate;
      usernameUpdate.isExpired = importDates.isExpired;
    }

    await db
      .update(availableUsernames)
      .set(usernameUpdate)
      .where(eq(availableUsernames.id, existingUsername.id));

    ctx.usernameByName.set(usernameKey, {
      id: existingUsername.id,
      assignedSubscriberId: subscriberId,
    });
  } else {
    const [created] = await db
      .insert(availableUsernames)
      .values({
        username: usernameKey,
        password: password || row.username,
        speedId,
        isUsed: true,
        isOwnerUsername: false,
        startDate: importDates.startDate,
        endDate: importDates.endDate,
        isExpired: importDates.isExpired,
      })
      .returning({ id: availableUsernames.id });
    usernameId = created.id;
    ctx.usernameByName.set(usernameKey, { id: created.id, assignedSubscriberId: subscriberId });
  }

  if (usernameId && subState.usernameID !== usernameId) {
    await db.update(subscribers).set({ usernameID: usernameId }).where(eq(subscribers.id, subscriberId));
    subState.usernameID = usernameId;
    ctx.subscriberByUsername.set(usernameKey, subscriberId);
    if (createdBy) {
      await applyImportUsernameCharge(db, subscriberId, usernameKey, speedId, createdBy);
    }
  } else if (usernameId && password) {
    await db.update(availableUsernames).set({ password }).where(eq(availableUsernames.id, usernameId));
  }
}

export async function getSubscribersForExport() {
  const db = getDb();

  return db
    .select({
      fullName: subscribers.fullName,
      lineId: subscribers.lineId,
      username: availableUsernames.username,
      password: availableUsernames.password,
      speedValue: speedTiers.speedValue,
      startDate: availableUsernames.startDate,
      endDate: availableUsernames.endDate,
      isPaused: subscribers.isPaused,
      phone: subscribers.phone,
      facilityType: subscribers.facilityType,
    })
    .from(subscribers)
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
    .where(eq(subscribers.isSuspended, false))
    .orderBy(desc(subscribers.createdAt));
}

export async function getSubscribersForExportByIds(ids: number[]) {
  const uniqueIds = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  if (uniqueIds.length === 0) {
    throw new AppError("No subscribers selected for export", 400);
  }

  const db = getDb();
  return db
    .select({
      fullName: subscribers.fullName,
      lineId: subscribers.lineId,
      username: availableUsernames.username,
      password: availableUsernames.password,
      speedValue: speedTiers.speedValue,
      startDate: availableUsernames.startDate,
      endDate: availableUsernames.endDate,
      isPaused: subscribers.isPaused,
      phone: subscribers.phone,
      facilityType: subscribers.facilityType,
    })
    .from(subscribers)
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
    .where(and(eq(subscribers.isSuspended, false), inArray(subscribers.id, uniqueIds)))
    .orderBy(desc(subscribers.createdAt));
}

export async function importSubscribersFromExcel(rows: ParsedSubscriberImportRow[], createdBy: number) {
  const ctx = await buildImportContext();
  const db = ctx.db;
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  type PendingCreate = {
    row: ParsedSubscriberImportRow;
    lineId: string;
    speedMbps: number;
    isPaused: boolean | undefined;
  };

  const pendingCreates: PendingCreate[] = [];

  for (const row of rows) {
    try {
      const speedMbps = row.speedMbps ?? 4;
      const isPaused = parseImportPausedStatus(row.status);
      const existingId = findSubscriberIdForImport(ctx, row);

      if (existingId) {
        const updateData: Record<string, unknown> = {};
        if (row.fullName) updateData.fullName = row.fullName;
        if (row.facilityType !== undefined) updateData.facilityType = row.facilityType || null;
        if (row.phone !== undefined) updateData.phone = row.phone || null;
        if (isPaused !== undefined) updateData.isPaused = isPaused;

        if (Object.keys(updateData).length > 0) {
          await db.update(subscribers).set(updateData).where(eq(subscribers.id, existingId));
        }

        if (row.username) {
          await upsertUsernameForImportWithContext(ctx, existingId, row, speedMbps, createdBy);
        } else if (row.password) {
          const subState = ctx.subscriberById.get(existingId);
          if (subState?.usernameID) {
            await db
              .update(availableUsernames)
              .set({ password: row.password })
              .where(eq(availableUsernames.id, subState.usernameID));
          }
        }

        updated++;
        continue;
      }

      pendingCreates.push({
        row,
        lineId: resolveLineIdForImport(ctx, row.lineId, speedMbps),
        speedMbps,
        isPaused,
      });
    } catch {
      skipped++;
    }
  }

  const BATCH_SIZE = 50;
  for (let offset = 0; offset < pendingCreates.length; offset += BATCH_SIZE) {
    const batch = pendingCreates.slice(offset, offset + BATCH_SIZE);
    try {
      const inserted = await db
        .insert(subscribers)
        .values(
          batch.map(({ row, lineId, isPaused }) => ({
            lineId,
            fullName: row.fullName,
            facilityType: row.facilityType ?? null,
            phone: row.phone ?? null,
            isPaused: isPaused ?? false,
            monthlyPrice: "-1",
            balance: "0",
          })),
        )
        .returning({ id: subscribers.id, lineId: subscribers.lineId });

      for (let i = 0; i < batch.length; i++) {
        const created = inserted[i];
        const entry = batch[i];
        if (!created?.id || !created.lineId) {
          skipped++;
          continue;
        }

        const state: ImportSubscriberState = { id: created.id, usernameID: null };
        ctx.subscriberById.set(created.id, state);
        ctx.subscriberByLineId.set(created.lineId, state);

        if (entry.row.username) {
          await upsertUsernameForImportWithContext(ctx, created.id, entry.row, entry.speedMbps, createdBy);
        }

        imported++;
      }
    } catch {
      skipped += batch.length;
    }
  }

  if (imported === 0 && updated === 0 && skipped > 0) {
    throw new AppError("All rows were skipped due to validation or duplicate conflicts", 409);
  }

  return { imported, updated, skipped };
}

export async function getUsernameHistoryForExport() {
  const db = getDb();

  return db
    .select({
      fullName: subscribers.fullName,
      lineId: subscribers.lineId,
      oldUsername: usernameHistory.oldUsername,
      oldPassword: usernameHistory.oldPassword,
      usageStartDate: usernameHistory.usageStartDate,
      usageEndDate: usernameHistory.usageEndDate,
    })
    .from(usernameHistory)
    .innerJoin(subscribers, eq(usernameHistory.subscriberId, subscribers.id))
    .orderBy(desc(subscribers.lineId), desc(usernameHistory.usageStartDate));
}

async function findSubscriberIdByLineId(lineId: string): Promise<number | null> {
  const db = getDb();
  const [row] = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(eq(subscribers.lineId, normalizeLineId(lineId)))
    .limit(1);
  return row?.id ?? null;
}

/** Resolve subscriber DB id from display line ID (any status: active, expired, stopped). */
export async function getSubscriberIdByLineId(lineId: string): Promise<number | null> {
  const trimmed = lineId.trim();
  if (!trimmed) return null;
  return findSubscriberIdByLineId(trimmed);
}

export async function importUsernameHistoryFromExcel(rows: ParsedUsernameHistoryImportRow[]) {
  const db = getDb();
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      const subscriberId = await findSubscriberIdByLineId(row.lineId);
      if (!subscriberId) {
        skipped++;
        continue;
      }

      const duplicateConditions = [
        eq(usernameHistory.subscriberId, subscriberId),
        eq(usernameHistory.oldUsername, row.username),
      ];

      if (row.usageStartDate) {
        duplicateConditions.push(eq(usernameHistory.usageStartDate, row.usageStartDate));
      }

      const [existing] = await db
        .select({ id: usernameHistory.id })
        .from(usernameHistory)
        .where(and(...duplicateConditions))
        .limit(1);

      if (existing) {
        skipped++;
        continue;
      }

      await db.insert(usernameHistory).values({
        subscriberId,
        oldUsername: row.username,
        oldPassword: row.password ?? null,
        usageStartDate: row.usageStartDate ?? null,
        usageEndDate: row.usageEndDate ?? null,
        changeCause: "Excel import",
        changedAt: new Date(),
      });

      imported++;
    } catch {
      skipped++;
    }
  }

  if (imported === 0 && skipped > 0) {
    throw new AppError("All rows were skipped — check line IDs exist (e.g. W04-228) and rows are not duplicates", 409);
  }

  return { imported, skipped };
}
