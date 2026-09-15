import { desc, eq } from "drizzle-orm";
import { getDb } from "../../config/db";
import { supportTickets } from "../../db/schema/supportTickets";
import type { CreateSupportTicketInput, UpdateSupportTicketInput } from "./support.validation";

export type SupportTicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved";
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";
export type SupportTicketChannel = "phone" | "visit" | "whatsapp" | "other";

export interface SupportTicketDto {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  channel: SupportTicketChannel;
  subscriberName: string;
  subscriberPhone: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

function toDto(row: typeof supportTickets.$inferSelect): SupportTicketDto {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    channel: row.channel,
    subscriberName: row.subscriberName,
    subscriberPhone: row.subscriberPhone,
    assignedTo: row.assignedTo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString(),
  };
}

function resolveResolvedAt(
  status: SupportTicketStatus,
  existingResolvedAt: Date | null | undefined,
  now: Date
): Date | null {
  if (status === "resolved") {
    return existingResolvedAt ?? now;
  }
  return null;
}

export async function listSupportTickets(status?: SupportTicketStatus): Promise<SupportTicketDto[]> {
  const db = getDb();

  const rows = status
    ? await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.status, status))
        .orderBy(desc(supportTickets.createdAt))
    : await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));

  return rows.map(toDto);
}

export async function createSupportTicket(input: CreateSupportTicketInput): Promise<SupportTicketDto> {
  const db = getDb();
  const now = new Date();
  const status = input.status ?? "open";
  const assignedTo = input.assignedTo?.trim() || "Unassigned";

  const [inserted] = await db
    .insert(supportTickets)
    .values({
      ticketNumber: "TKT-PENDING",
      title: input.title.trim(),
      description: input.description.trim(),
      status,
      priority: input.priority ?? "medium",
      channel: input.channel ?? "phone",
      subscriberName: input.subscriberName.trim(),
      subscriberPhone: input.subscriberPhone.trim(),
      assignedTo,
      createdAt: now,
      updatedAt: now,
      resolvedAt: resolveResolvedAt(status, null, now),
    })
    .returning();

  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(inserted.id).padStart(4, "0")}`;

  const [updated] = await db
    .update(supportTickets)
    .set({ ticketNumber })
    .where(eq(supportTickets.id, inserted.id))
    .returning();

  return toDto(updated);
}

export async function updateSupportTicket(
  id: number,
  input: UpdateSupportTicketInput
): Promise<SupportTicketDto | null> {
  const db = getDb();
  const [existing] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);

  if (!existing) {
    return null;
  }

  const now = new Date();
  const nextStatus = (input.status ?? existing.status) as SupportTicketStatus;

  const patch: Partial<typeof supportTickets.$inferInsert> = {
    updatedAt: now,
  };

  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.channel !== undefined) patch.channel = input.channel;
  if (input.subscriberName !== undefined) patch.subscriberName = input.subscriberName.trim();
  if (input.subscriberPhone !== undefined) patch.subscriberPhone = input.subscriberPhone.trim();
  if (input.assignedTo !== undefined) patch.assignedTo = input.assignedTo.trim() || "Unassigned";

  patch.resolvedAt = resolveResolvedAt(nextStatus, existing.resolvedAt, now);

  const [updated] = await db.update(supportTickets).set(patch).where(eq(supportTickets.id, id)).returning();

  return updated ? toDto(updated) : null;
}

export async function deleteSupportTicket(id: number): Promise<boolean> {
  const db = getDb();
  const removed = await db.delete(supportTickets).where(eq(supportTickets.id, id)).returning({ id: supportTickets.id });
  return removed.length > 0;
}

export async function deleteAllSupportTickets(): Promise<number> {
  const db = getDb();
  const removed = await db.delete(supportTickets).returning({ id: supportTickets.id });
  return removed.length;
}
