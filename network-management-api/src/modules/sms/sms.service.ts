import { getDaysUntilDisconnect } from "../../utils/disconnectDate.util";
import { getDb } from "../../config/db";
import { adminUsers } from "../../db/schema/adminUsers";
import { availableUsernames } from "../../db/schema/availableUsernames";
import { smsGroupMembers, smsGroups } from "../../db/schema/smsGroups";
import { smsLogs } from "../../db/schema/smsLogs";
import { smsTemplates } from "../../db/schema/smsTemplates";
import { subscribers } from "../../db/schema/subscribers";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import AppError from "../../utils/appError";
import { checkTweetSmsConnection, sendTweetSms } from "./tweetsms.util";
import type {
  CreateSmsTemplateInput,
  CreateSmsGroupInput,
  SendSmsInput,
  SmsAudienceFilter,
  UpdateSmsTemplateInput,
  UpdateSmsGroupInput,
} from "./sms.validation";

const SOON_MAX_DAYS = 7;

export interface SmsRecipientRow {
  id: number;
  lineId: string;
  fullName: string;
  phone: string;
  username: string | null;
  balance: number;
  daysLeft: number | null;
  isSuspended: boolean;
}

function parseBalance(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function getDaysLeft(endDate: Date | string | null | undefined): number | null {
  return getDaysUntilDisconnect(endDate);
}

function matchesAudience(row: SmsRecipientRow, audience: SmsAudienceFilter): boolean {
  switch (audience) {
    case "customers":
      return !row.isSuspended && !row.username;
    case "all":
      return !row.isSuspended && Boolean(row.username);
    case "stopped":
      return row.isSuspended;
    case "withDebt":
      return row.balance < 0;
    case "expired":
      return !row.isSuspended && row.daysLeft !== null && row.daysLeft < 0;
    case "expires1Day":
      return (
        !row.isSuspended &&
        row.daysLeft !== null &&
        row.daysLeft >= 0 &&
        row.daysLeft <= 1
      );
    case "expires2Days":
      return !row.isSuspended && row.daysLeft === 2;
    case "expiresSoon":
      return (
        !row.isSuspended &&
        row.daysLeft !== null &&
        row.daysLeft >= 0 &&
        row.daysLeft <= SOON_MAX_DAYS
      );
    default:
      return true;
  }
}

function matchesSearch(row: SmsRecipientRow, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;
  const haystack = [row.lineId, row.fullName, row.phone, row.username ?? ""].join(" ").toLowerCase();
  return haystack.includes(q);
}

export async function getSmsRecipients(audience: SmsAudienceFilter, search?: string): Promise<SmsRecipientRow[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: subscribers.id,
      lineId: subscribers.lineId,
      fullName: subscribers.fullName,
      phone: subscribers.phone,
      username: availableUsernames.username,
      balance: subscribers.balance,
      endDate: availableUsernames.endDate,
      isSuspended: subscribers.isSuspended,
    })
    .from(subscribers)
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .orderBy(desc(subscribers.createdAt))
    .limit(2000);

  const mapped: SmsRecipientRow[] = rows
    .filter((row) => row.phone?.trim())
    .map((row) => ({
      id: row.id,
      lineId: row.lineId ?? `S${row.id}`,
      fullName: row.fullName ?? "",
      phone: row.phone!.trim(),
      username: row.username ?? null,
      balance: parseBalance(row.balance),
      daysLeft: getDaysLeft(row.endDate),
      isSuspended: Boolean(row.isSuspended),
    }));

  return mapped.filter(
    (row) => matchesAudience(row, audience) && matchesSearch(row, search ?? ""),
  );
}

export function normalizePhone(value: unknown): string | null {
  let normalized = String(value || "").replace(/[^0-9]/g, "");
  if (!normalized) return null;

  if (normalized.length === 9 && normalized.startsWith("5")) {
    normalized = `0${normalized}`;
  }

  if (normalized.startsWith("0")) {
    normalized = `972${normalized.slice(1)}`;
  }

  return normalized;
}

interface ResolvedRecipient {
  phone: string;
  subscriberId: number | null;
}

async function resolveRecipients(input: SendSmsInput): Promise<ResolvedRecipient[]> {
  if (input.recipientType === "custom") {
    const phone = normalizePhone(input.phone);
    return phone ? [{ phone, subscriberId: null }] : [];
  }

  const db = getDb();
  const byPhone = new Map<string, ResolvedRecipient>();

  if (input.subscriberIds?.length) {
    const rows = await db
      .select({ id: subscribers.id, phone: subscribers.phone })
      .from(subscribers)
      .where(inArray(subscribers.id, input.subscriberIds));

    for (const row of rows) {
      const normalized = normalizePhone(row.phone);
      if (normalized) {
        byPhone.set(normalized, { phone: normalized, subscriberId: row.id });
      }
    }
  }

  if (input.phones?.length) {
    for (const raw of input.phones) {
      const normalized = normalizePhone(raw);
      if (normalized && !byPhone.has(normalized)) {
        byPhone.set(normalized, { phone: normalized, subscriberId: null });
      }
    }
  }

  return Array.from(byPhone.values());
}

async function insertSmsLog(entry: {
  sentByUserId: number;
  subscriberId: number | null;
  phone: string;
  message: string;
  recipientType: string;
  status: "sent" | "failed";
  providerResponse?: unknown;
  errorMessage?: string;
  templateId?: number | null;
}) {
  const db = getDb();
  await db.insert(smsLogs).values({
    sentByUserId: entry.sentByUserId,
    subscriberId: entry.subscriberId,
    phone: entry.phone,
    message: entry.message,
    recipientType: entry.recipientType,
    status: entry.status,
    providerResponse:
      entry.providerResponse != null ? JSON.stringify(entry.providerResponse) : null,
    errorMessage: entry.errorMessage ?? null,
    templateId: entry.templateId ?? null,
  });
}

const SMS_SEND_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatSmsFailureMessage(failed: Array<{ phone: string; error: string }>): string {
  if (failed.length === 0) {
    return "Failed to send SMS to all recipients";
  }
  if (failed.length === 1) {
    return failed[0].error;
  }

  const uniqueErrors = [...new Set(failed.map((entry) => entry.error))];
  if (uniqueErrors.length === 1) {
    return `Failed to send SMS to all ${failed.length} recipients: ${uniqueErrors[0]}`;
  }

  const preview = failed
    .slice(0, 3)
    .map((entry) => `${entry.phone}: ${entry.error}`)
    .join("; ");

  return `Failed to send SMS to all ${failed.length} recipients. ${preview}`;
}

async function sendToProvider(phone: string, message: string) {
  const receipt = await sendTweetSms(phone, message);
  return receipt;
}

export { checkTweetSmsConnection };

export async function sendSms(input: SendSmsInput, sentByUserId: number) {
  const recipients = await resolveRecipients(input);

  if (recipients.length === 0) {
    throw new AppError("No valid phone numbers to send to", 400);
  }

  const sent: Array<{ phone: string; providerResponse: string }> = [];
  const failed: Array<{ phone: string; error: string }> = [];

  for (let index = 0; index < recipients.length; index++) {
    const recipient = recipients[index];

    try {
      const providerResponse = await sendToProvider(recipient.phone, input.message);
      await insertSmsLog({
        sentByUserId,
        subscriberId: recipient.subscriberId,
        phone: recipient.phone,
        message: input.message,
        recipientType: input.recipientType,
        status: "sent",
        providerResponse,
        templateId: input.templateId ?? null,
      });
      sent.push({ phone: recipient.phone, providerResponse });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err ?? "Unknown error");
      await insertSmsLog({
        sentByUserId,
        subscriberId: recipient.subscriberId,
        phone: recipient.phone,
        message: input.message,
        recipientType: input.recipientType,
        status: "failed",
        errorMessage,
        templateId: input.templateId ?? null,
      });
      failed.push({ phone: recipient.phone, error: errorMessage });
    }

    if (index < recipients.length - 1) {
      await delay(SMS_SEND_DELAY_MS);
    }
  }

  if (sent.length === 0) {
    throw new AppError(formatSmsFailureMessage(failed), 502, { failed });
  }

  return {
    totalRequested: recipients.length,
    sentCount: sent.length,
    failedCount: failed.length,
    sent,
    failed,
  };
}

export async function getSmsLogs(page = 1, limit = 50) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: smsLogs.id,
        phone: smsLogs.phone,
        message: smsLogs.message,
        recipientType: smsLogs.recipientType,
        status: smsLogs.status,
        errorMessage: smsLogs.errorMessage,
        createdAt: smsLogs.createdAt,
        sentByUserId: smsLogs.sentByUserId,
        sentByUsername: adminUsers.username,
        sentByName: adminUsers.name,
        subscriberId: smsLogs.subscriberId,
        subscriberLineId: subscribers.lineId,
        subscriberName: subscribers.fullName,
        templateId: smsLogs.templateId,
        templateName: smsTemplates.name,
      })
      .from(smsLogs)
      .leftJoin(adminUsers, eq(smsLogs.sentByUserId, adminUsers.id))
      .leftJoin(subscribers, eq(smsLogs.subscriberId, subscribers.id))
      .leftJoin(smsTemplates, eq(smsLogs.templateId, smsTemplates.id))
      .orderBy(desc(smsLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(smsLogs),
  ]);

  return {
    items: rows,
    total: Number(totalRow[0]?.total ?? 0),
    page,
    limit,
  };
}

export async function listSmsTemplates() {
  const db = getDb();
  return db
    .select({
      id: smsTemplates.id,
      name: smsTemplates.name,
      body: smsTemplates.body,
      isSystem: smsTemplates.isSystem,
      createdAt: smsTemplates.createdAt,
      updatedAt: smsTemplates.updatedAt,
      createdByUserId: smsTemplates.createdByUserId,
      createdByUsername: adminUsers.username,
    })
    .from(smsTemplates)
    .leftJoin(adminUsers, eq(smsTemplates.createdByUserId, adminUsers.id))
    .orderBy(desc(smsTemplates.isSystem), smsTemplates.name);
}

export async function createSmsTemplate(input: CreateSmsTemplateInput, createdByUserId: number) {
  const db = getDb();
  const [created] = await db
    .insert(smsTemplates)
    .values({
      name: input.name,
      body: input.body,
      createdByUserId,
      isSystem: false,
    })
    .returning();
  return created;
}

export async function updateSmsTemplate(id: number, input: UpdateSmsTemplateInput) {
  const db = getDb();
  const [existing] = await db.select().from(smsTemplates).where(eq(smsTemplates.id, id)).limit(1);
  if (!existing) throw new AppError("Template not found", 404);
  if (existing.isSystem) throw new AppError("System templates cannot be edited", 403);

  const [updated] = await db
    .update(smsTemplates)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      updatedAt: new Date(),
    })
    .where(eq(smsTemplates.id, id))
    .returning();
  return updated;
}

export async function deleteSmsTemplate(id: number) {
  const db = getDb();
  const [existing] = await db.select().from(smsTemplates).where(eq(smsTemplates.id, id)).limit(1);
  if (!existing) throw new AppError("Template not found", 404);

  await db.transaction(async (tx) => {
    await tx.update(smsLogs).set({ templateId: null }).where(eq(smsLogs.templateId, id));
    await tx.delete(smsTemplates).where(eq(smsTemplates.id, id));
  });
}

export interface SmsGroupMemberDto {
  subscriberId: number;
  lineId: string;
  fullName: string;
  phone: string | null;
  username: string | null;
}

export interface SmsGroupDto {
  id: number;
  name: string;
  description: string | null;
  members: SmsGroupMemberDto[];
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
}

async function mapGroupMembers(
  rows: Array<{
    groupId: number;
    subscriberId: number;
    lineId: string | null;
    fullName: string | null;
    phone: string | null;
    username: string | null;
  }>,
): Promise<Map<number, SmsGroupMemberDto[]>> {
  const map = new Map<number, SmsGroupMemberDto[]>();
  for (const row of rows) {
    const member: SmsGroupMemberDto = {
      subscriberId: row.subscriberId,
      lineId: row.lineId ?? `S${row.subscriberId}`,
      fullName: row.fullName ?? "",
      phone: row.phone?.trim() || null,
      username: row.username ?? null,
    };
    const list = map.get(row.groupId) ?? [];
    list.push(member);
    map.set(row.groupId, list);
  }
  return map;
}

async function fetchMembersForGroups(groupIds: number[]): Promise<Map<number, SmsGroupMemberDto[]>> {
  if (groupIds.length === 0) return new Map();
  const db = getDb();
  const rows = await db
    .select({
      groupId: smsGroupMembers.groupId,
      subscriberId: subscribers.id,
      lineId: subscribers.lineId,
      fullName: subscribers.fullName,
      phone: subscribers.phone,
      username: availableUsernames.username,
    })
    .from(smsGroupMembers)
    .innerJoin(subscribers, eq(smsGroupMembers.subscriberId, subscribers.id))
    .leftJoin(availableUsernames, eq(subscribers.usernameID, availableUsernames.id))
    .where(inArray(smsGroupMembers.groupId, groupIds))
    .orderBy(subscribers.fullName);

  return mapGroupMembers(rows);
}

async function getSmsGroupById(id: number): Promise<SmsGroupDto> {
  const db = getDb();
  const [group] = await db.select().from(smsGroups).where(eq(smsGroups.id, id)).limit(1);
  if (!group) throw new AppError("SMS group not found", 404);

  const membersMap = await fetchMembersForGroups([id]);
  return {
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    members: membersMap.get(id) ?? [],
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

async function assertSubscriberIdsExist(memberIds: number[]) {
  if (memberIds.length === 0) return;
  const db = getDb();
  const rows = await db
    .select({ id: subscribers.id })
    .from(subscribers)
    .where(inArray(subscribers.id, memberIds));
  if (rows.length !== memberIds.length) {
    throw new AppError("One or more subscribers were not found", 400);
  }
}

export async function listSmsGroups(): Promise<SmsGroupDto[]> {
  const db = getDb();
  const groups = await db.select().from(smsGroups).orderBy(smsGroups.name);
  if (groups.length === 0) return [];

  const membersMap = await fetchMembersForGroups(groups.map((group) => group.id));
  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    members: membersMap.get(group.id) ?? [],
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  }));
}

export async function createSmsGroup(input: CreateSmsGroupInput, createdByUserId: number) {
  const db = getDb();
  const memberIds = [...new Set(input.memberIds)];
  await assertSubscriberIdsExist(memberIds);

  const [created] = await db
    .insert(smsGroups)
    .values({
      name: input.name,
      description: input.description?.trim() || null,
      createdByUserId,
    })
    .returning();

  if (memberIds.length > 0) {
    await db.insert(smsGroupMembers).values(
      memberIds.map((subscriberId) => ({
        groupId: created.id,
        subscriberId,
      })),
    );
  }

  return getSmsGroupById(created.id);
}

export async function updateSmsGroup(id: number, input: UpdateSmsGroupInput) {
  const db = getDb();
  const [existing] = await db.select().from(smsGroups).where(eq(smsGroups.id, id)).limit(1);
  if (!existing) throw new AppError("SMS group not found", 404);

  const memberIds = [...new Set(input.memberIds)];
  await assertSubscriberIdsExist(memberIds);

  await db
    .update(smsGroups)
    .set({
      name: input.name,
      description: input.description?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(smsGroups.id, id));

  await db.delete(smsGroupMembers).where(eq(smsGroupMembers.groupId, id));

  if (memberIds.length > 0) {
    await db.insert(smsGroupMembers).values(
      memberIds.map((subscriberId) => ({
        groupId: id,
        subscriberId,
      })),
    );
  }

  return getSmsGroupById(id);
}

export async function deleteSmsGroup(id: number) {
  const db = getDb();
  const [existing] = await db.select().from(smsGroups).where(eq(smsGroups.id, id)).limit(1);
  if (!existing) throw new AppError("SMS group not found", 404);
  await db.delete(smsGroups).where(eq(smsGroups.id, id));
}
