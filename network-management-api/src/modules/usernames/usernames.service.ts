import { getDb } from "../../config/db";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { subscribers } from "../../db/schema/subscribers";
import { speedTiers } from "../../db/schema/speedTiers";
import { eq, asc, and, inArray } from "drizzle-orm";
import AppError from "../../utils/appError";
import { normalizeUsername } from "../../utils/excelCell.util";
import type { ParsedImportRow } from "./usernames.excel";
import { renewUsernameBillingCycle } from "../subscribers/subscribers.service";
import { supportsSameUsernameRenewalSpeed } from "./usernameRenewal.util";

async function assertActiveSpeedTier(speedId: number) {
  const db = getDb();
  const [tier] = await db
    .select({ id: speedTiers.id, speedValue: speedTiers.speedValue, price: speedTiers.price })
    .from(speedTiers)
    .where(and(eq(speedTiers.id, speedId), eq(speedTiers.deleted, false)))
    .limit(1);

  if (!tier) {
    throw new AppError("Speed tier not found or removed", 404);
  }

  return tier;
}

export async function getAvailableUsernames(speedId: number, page = 1, limit = 20) {
  const db = getDb();
  await assertActiveSpeedTier(speedId);
  const safeLimit = Math.min(Math.max(limit, 1), 10_000);
  const offset = (page - 1) * safeLimit;
  const whereClause = and(
    eq(availableUsernames.speedId, speedId),
    eq(availableUsernames.isExpired, false),
  );

  const [data, total] = await Promise.all([
    db
      .select()
      .from(availableUsernames)
      .where(whereClause)
      .orderBy(asc(availableUsernames.createdAt))
      .limit(safeLimit)
      .offset(offset),
    db.$count(availableUsernames, whereClause),
  ]);

  return {
    data,
    total,
    page,
    limit: safeLimit,
  };
}

export async function addAvailableUsername(
  username: string,
  password: string,
  speedId: number,
  isOwnerUsername: boolean,
  isUsed: boolean,
  startDate?: Date
) {
  const db = getDb();
  await assertActiveSpeedTier(speedId);
  let endDate: Date | null = null;
  if (startDate) {
    endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  const result = await db
    .insert(availableUsernames)
    .values({
      username,
      password,
      speedId,
      isOwnerUsername,
      isUsed,
      startDate,
      endDate,
    })
    .returning();
  return result[0];
}

export async function updateAvailableUsername(
  id: number,
  username?: string,
  password?: string,
  isOwnerUsername?: boolean,
  isUsed?: boolean,
  startDate?: Date
) {
  const db = getDb();

  const updateData: Record<string, unknown> = {};
  if (username) updateData.username = username;
  if (password) updateData.password = password;
  if (isOwnerUsername !== undefined) updateData.isOwnerUsername = isOwnerUsername;
  if (isUsed !== undefined) updateData.isUsed = isUsed;
  if (startDate) {
    updateData.startDate = startDate;
    updateData.endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
  // Clear billing dates only when returning to the unused pool — not for assigned owner lines.
  if (isUsed === false) {
    updateData.startDate = null;
    updateData.endDate = null;
  }

  await db.update(availableUsernames).set(updateData).where(eq(availableUsernames.id, id));
  return db.select().from(availableUsernames).where(eq(availableUsernames.id, id)).limit(1);
}

export async function deleteAvailableUsername(id: number) {
  const db = getDb();
  await db.delete(availableUsernames).where(eq(availableUsernames.id, id));
}

/** Hard-delete every username row for this speed tier only (not other speeds). */
export async function deleteAllAvailableUsernamesForSpeed(speedId: number) {
  const db = getDb();
  const removed = await db
    .delete(availableUsernames)
    .where(eq(availableUsernames.speedId, speedId))
    .returning({ id: availableUsernames.id });

  return removed.length;
}

export async function getAvailableUsernamesForExport(speedId: number) {
  const db = getDb();
  const tier = await assertActiveSpeedTier(speedId);

  const data = await db
    .select()
    .from(availableUsernames)
    .where(
      and(
        eq(availableUsernames.speedId, speedId),
        eq(availableUsernames.isExpired, false),
        eq(availableUsernames.isUsed, false)
      )
    )
    .orderBy(asc(availableUsernames.createdAt));

  return {
    data,
    speedValue: tier.speedValue,
    price: tier.price,
  };
}

export type ImportSkipReason = "duplicate_in_file" | "already_in_database" | "insert_failed";

export interface ImportSkipDetail {
  username: string;
  rowNumber: number;
  reason: ImportSkipReason;
  /** Present when reason is already_in_database */
  existingSpeedId?: number;
  isUsed?: boolean;
  isExpired?: boolean;
}

export function formatImportSkipSummary(details: ImportSkipDetail[]): string {
  const examples = details.slice(0, 10).map((detail) => {
    if (detail.reason === "duplicate_in_file") {
      return `${detail.username} (row ${detail.rowNumber}, repeated in file)`;
    }
    if (detail.reason === "insert_failed") {
      return `${detail.username} (row ${detail.rowNumber}, database rejected insert)`;
    }

    const status = detail.isExpired
      ? "expired (hidden from pool list)"
      : detail.isUsed
        ? "assigned or in cooldown"
        : "already in pool";
    const speedHint =
      detail.existingSpeedId != null ? `, speed tier id ${detail.existingSpeedId}` : "";
    return `${detail.username} (row ${detail.rowNumber}, ${status}${speedHint})`;
  });

  const suffix = details.length > 10 ? `; +${details.length - 10} more` : "";
  return `Skipped: ${examples.join("; ")}${suffix}`;
}

function isUniqueUsernameViolation(err: unknown): boolean {
  const cause =
    err && typeof err === "object" && "cause" in err
      ? (err as { cause?: { code?: string } }).cause
      : err;
  return Boolean(
    cause &&
      typeof cause === "object" &&
      "code" in cause &&
      (cause as { code?: string }).code === "23505",
  );
}

export async function importUsernamesFromExcel(rows: ParsedImportRow[], speedId: number) {
  const db = getDb();
  await assertActiveSpeedTier(speedId);

  if (rows.length === 0) {
    throw new AppError("No valid rows found in Excel file", 400);
  }

  const normalizedRows = rows.map((row) => ({
    ...row,
    username: normalizeUsername(row.username),
  }));

  const usernames = normalizedRows.map((row) => row.username);
  const existingRows =
    usernames.length > 0
      ? await db
          .select({
            username: availableUsernames.username,
            speedId: availableUsernames.speedId,
            isUsed: availableUsernames.isUsed,
            isExpired: availableUsernames.isExpired,
          })
          .from(availableUsernames)
          .where(inArray(availableUsernames.username, usernames))
      : [];

  const existingByUsername = new Map(
    existingRows.map((row) => [normalizeUsername(row.username), row]),
  );
  const seenInFile = new Set<string>();
  const skippedDetails: ImportSkipDetail[] = [];

  let imported = 0;
  let skipped = 0;

  for (const row of normalizedRows) {
    if (seenInFile.has(row.username)) {
      skippedDetails.push({
        username: row.username,
        rowNumber: row.rowNumber,
        reason: "duplicate_in_file",
      });
      skipped++;
      continue;
    }

    const existing = existingByUsername.get(row.username);
    if (existing) {
      skippedDetails.push({
        username: row.username,
        rowNumber: row.rowNumber,
        reason: "already_in_database",
        existingSpeedId: existing.speedId,
        isUsed: existing.isUsed ?? false,
        isExpired: existing.isExpired ?? false,
      });
      skipped++;
      continue;
    }

    try {
      await db.insert(availableUsernames).values({
        username: row.username,
        password: row.password,
        speedId,
        isOwnerUsername: false,
        isUsed: false,
      });
      seenInFile.add(row.username);
      existingByUsername.set(row.username, {
        username: row.username,
        speedId,
        isUsed: false,
        isExpired: false,
      });
      imported++;
    } catch (err) {
      if (isUniqueUsernameViolation(err)) {
        const [existing] = await db
          .select({
            speedId: availableUsernames.speedId,
            isUsed: availableUsernames.isUsed,
            isExpired: availableUsernames.isExpired,
          })
          .from(availableUsernames)
          .where(eq(availableUsernames.username, row.username))
          .limit(1);

        skippedDetails.push({
          username: row.username,
          rowNumber: row.rowNumber,
          reason: "already_in_database",
          existingSpeedId: existing?.speedId,
          isUsed: existing?.isUsed ?? false,
          isExpired: existing?.isExpired ?? false,
        });
      } else {
        skippedDetails.push({
          username: row.username,
          rowNumber: row.rowNumber,
          reason: "insert_failed",
        });
      }
      skipped++;
    }
  }

  if (imported === 0 && skipped > 0) {
    throw new AppError("All rows were skipped (duplicates or already exist)", 409);
  }

  return { imported, skipped, skippedDetails };
}

/** Reset billing month on an assigned username (same user, new invoice). */
export async function resetUsernameBillingCycle(usernameId: number, createdBy: number) {
  const db = getDb();
  const [assigned] = await db
    .select({
      subscriberId: subscribers.id,
      isOwnerUsername: availableUsernames.isOwnerUsername,
      isUsed: availableUsernames.isUsed,
      speedValue: speedTiers.speedValue,
    })
    .from(availableUsernames)
    .innerJoin(subscribers, eq(subscribers.usernameID, availableUsernames.id))
    .innerJoin(speedTiers, eq(speedTiers.id, availableUsernames.speedId))
    .where(eq(availableUsernames.id, usernameId))
    .limit(1);

  if (!assigned) {
    throw new AppError("This username is not assigned to a subscriber", 400);
  }

  if (!assigned.isUsed) {
    throw new AppError("Billing cycle reset applies only to assigned usernames", 400);
  }

  const canRenewSameUsername =
    assigned.isOwnerUsername || supportsSameUsernameRenewalSpeed(assigned.speedValue);
  if (!canRenewSameUsername) {
    throw new AppError("This speed does not support renewing the same username", 400);
  }

  await renewUsernameBillingCycle(assigned.subscriberId, createdBy, "Billing cycle reset");

  const [row] = await db
    .select()
    .from(availableUsernames)
    .where(eq(availableUsernames.id, usernameId))
    .limit(1);

  if (!row) {
    throw new AppError("Username not found after reset", 404);
  }

  return row;
}
