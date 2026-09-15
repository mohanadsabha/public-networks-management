import { getDb } from "../../config/db";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { speedTiers } from "../../db/schema/speedTiers";
import { subscribers } from "../../db/schema/subscribers";
import * as subscriberService from "../subscribers/subscribers.service";
import { CreateCustomerInput, UpdateCustomerInput } from "./customers.validation";
import { usernameHistory } from "../../db/schema/usernameHistory";
import { and, desc, eq, exists, ilike, inArray, isNotNull, isNull, or, like } from "drizzle-orm";
import AppError from "../../utils/appError";

export type CustomerKindFilter = "all" | "customer" | "subscriber" | "stopped";
const MAX_RETRIES = 100; // Maximum attempts to generate a unique lineId

// Returns the prefix and the sequence to start trying from.
async function getStartingSequence(lineNumber: string) {
  const db = getDb();
  const paddedLine = String(lineNumber).padStart(2, "0");
  const linePrefix = `W${paddedLine}-`;

  const [latestSubscriber] = await db
    .select({ lineId: subscribers.lineId })
    .from(subscribers)
    .where(and(isNotNull(subscribers.lineId), like(subscribers.lineId, `${linePrefix}%`)))
    .orderBy(desc(subscribers.lineId)) // order by id, not createdAt
    .limit(1);

  let nextSequence = 101;
  if (latestSubscriber?.lineId) {
    const lastSequence = Number(latestSubscriber.lineId.split("-").pop());
    if (!Number.isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  return { linePrefix, nextSequence };
}

export function isUniqueViolation(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes("Constraint violation on Line Id Unique") ||
      (err as any).code === "23505" ||
      (err as any).cause?.code === "23505"
    );
  }
  return false;
}

// Retries an operation that needs a fresh, unique lineId.
// `attempt(candidateId)` should perform the insert/update
export async function generateSubscriberId<T>(
  lineNumber: string,
  attempt: (candidateId: string) => Promise<T>
): Promise<T> {
  const { linePrefix, nextSequence: start } = await getStartingSequence(lineNumber);
  let nextSequence = start;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const candidateId = `${linePrefix}${String(nextSequence).padStart(3, "0")}`;
    try {
      return await attempt(candidateId);
    } catch (err) {
      if (isUniqueViolation(err)) {
        nextSequence++;
        continue;
      }
      throw err;
    }
  }
  throw new AppError(
    `Failed to generate unique subscriber ID for line ${lineNumber} after ${MAX_RETRIES} attempts`,
    400
  );
}

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
  isSuspended: subscribers.isSuspended,
  notes: subscribers.notes,
  balance: subscribers.balance,
  createdAt: subscribers.createdAt,
  suspendAt: subscribers.suspendAt,
};

export async function getCustomers(
  page = 1,
  limit = 50,
  search?: string,
  speed?: number,
  kind: CustomerKindFilter = "all"
) {
  const db = getDb();
  const conditions = [];

  if (kind === "stopped") {
    conditions.push(eq(subscribers.isSuspended, true));
  } else if (kind === "customer") {
    conditions.push(eq(subscribers.isSuspended, false));
    conditions.push(isNull(subscribers.usernameID));
  } else if (kind === "subscriber") {
    conditions.push(eq(subscribers.isSuspended, false));
    conditions.push(isNotNull(subscribers.usernameID));
  }

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(subscribers.fullName, `%${search}%`),
        ilike(subscribers.phone, `%${search}%`),
        ilike(subscribers.lineId, `%${search}%`),
        ilike(availableUsernames.username, `%${search}%`),
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

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const data = await db
    .select(selectFields)
    .from(subscribers)
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .leftJoin(speedTiers, eq(availableUsernames.speedId, speedTiers.id))
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

export async function getCustomerById(id: number) {
  return subscriberService.getSubscriberById(id);
}

export async function createCustomer(data: CreateCustomerInput) {
  const db = getDb();

  const result = await generateSubscriberId(data.lineId, async (candidateLineId) => {
    return db
      .insert(subscribers)
      .values({
        fullName: data.fullName,
        facilityType: data.facilityType,
        phone: data.phone,
        lineId: candidateLineId,
        monthlyPrice: data.monthlyPrice !== undefined ? String(data.monthlyPrice) : "-1",
        notes: data.notes ?? null,
        balance: data.balance !== undefined ? String(data.balance) : "0",
      })
      .returning();
  });

  return result[0];
}

export async function updateCustomer(id: number, data: UpdateCustomerInput) {
  const db = getDb();
  const existing = await getCustomerById(id);
  if (!existing) {
    throw new Error("Customer not found");
  }

  const subscriberPayload = { ...data } as Record<string, unknown>;
  delete subscriberPayload.lineId;

  const updatedCustomer = await subscriberService.updateSubscriber(id, subscriberPayload);

  if (data.lineId !== undefined) {
    const newPrefix = `W${String(data.lineId).padStart(2, "0")}-`;
    const currentPrefix = existing.lineId?.slice(0, newPrefix.length);

    if (currentPrefix !== newPrefix) {
      await generateSubscriberId(data.lineId, async (candidateLineId) => {
        return db.update(subscribers).set({ lineId: candidateLineId }).where(eq(subscribers.id, id));
      });
    }
  }

  return updatedCustomer;
}

export async function deleteCustomer(id: number) {
  return subscriberService.deleteSubscriber(id);
}

export async function deleteCustomersBulk(ids: number[]) {
  return subscriberService.deleteSubscribersBulk(ids);
}

export async function deleteAllCustomers() {
  return subscriberService.deleteAllSubscribers();
}
