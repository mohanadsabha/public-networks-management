import { getDb } from "../../config/db";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { speedTiers } from "../../db/schema/speedTiers";
import { eq, and, gt } from "drizzle-orm";
import AppError from "../../utils/appError";

export async function getAllSpeeds() {
  const db = getDb();
  // Return every tier (including soft-deleted) so UI can list 32M etc. and show "Removed" badge
  const speeds = await db.select().from(speedTiers).orderBy(speedTiers.speedValue);

  // Get counts for each speed
  const speedsWithCounts = await Promise.all(
    speeds.map(async (speed) => {
      const notExpiredCount = await db.$count(
        availableUsernames,
        and(eq(availableUsernames.speedId, speed.id), eq(availableUsernames.isExpired, false))
      );

      const usedCount = await db.$count(
        availableUsernames,
        and(
          eq(availableUsernames.speedId, speed.id),
          eq(availableUsernames.isUsed, true),
          eq(availableUsernames.isExpired, false)
        )
      );

      return {
        ...speed,
        availableUsernamesCount: notExpiredCount,
        usedUsernamesCount: usedCount,
      };
    })
  );

  return speedsWithCounts;
}

export async function addSpeed(speedValue: number, price: number) {
  const db = getDb();
  // Get next display order
  const existing = await db.select().from(speedTiers); // add where clause for organization when we do multi-tenant
  if (existing.some((s) => s.speedValue === speedValue && !s.deleted)) {
    throw new Error("Speed value must be unique");
  }
  const result = await db
    .insert(speedTiers)
    .values({
      speedValue,
      price,
    })
    .returning();

  return result[0];
}

export async function updateSpeed(id: number, speedValue: number, price: number) {
  const db = getDb();

  const result = await db
    .update(speedTiers)
    .set({ speedValue, price })
    .where(and(eq(speedTiers.id, id), eq(speedTiers.deleted, false)))
    .returning();
  return result[0] || null;
}

export async function deleteSpeed(id: number) {
  const db = getDb();

  // if there's available usernames that hasn't expired, prevent deletion
  const count = await db.$count(
    availableUsernames,
    and(eq(availableUsernames.speedId, id), gt(availableUsernames.endDate, new Date()))
  );
  if (count > 0) {
    throw new AppError("There's existing usernames using this speed tier, cannot delete", 400);
  }

  // deleting the speed is soft delete since we need it for old usernames to keep old speeds used
  await db.update(speedTiers).set({ deleted: true }).where(eq(speedTiers.id, id));
}
