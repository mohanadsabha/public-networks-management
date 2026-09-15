import { getDb } from "../../config/db";
import { invoices } from "../../db/schema/invoices";
import { subscribers } from "../../db/schema/subscribers";
import { desc, eq, count, or, ilike, sql } from "drizzle-orm";

/** How much a stored invoice changed subscriber balance (supports legacy rows). */
export function invoiceBalanceDelta(amount: number, paidAmount: number): number {
  if (paidAmount === 0) return 0;
  if (amount <= 0) return paidAmount;
  if (paidAmount <= 0) return 0;
  if (amount === paidAmount) return paidAmount;
  return paidAmount - amount;
}

export interface InvoiceListRow {
  id: number;
  subscriberId: number;
  amount: string;
  paidAmount: string;
  paymentMethod: "cash" | "bank_transfer" | "credit";
  status: "unpaid" | "partial" | "paid" | "debt";
  notes: string | null;
  createdAt: Date | null;
  subscriberLineId: string;
  subscriberName: string;
  subscriberPhone: string | null;
  subscriberFacilityType: string | null;
}

export async function listAllInvoices(options?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ items: InvoiceListRow[]; total: number; page: number; limit: number }> {
  const db = getDb();
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.min(100, Math.max(1, options?.limit ?? 50));
  const offset = (page - 1) * limit;
  const search = options?.search?.trim();

  const searchFilter = search
    ? or(
        ilike(subscribers.lineId, `%${search}%`),
        ilike(subscribers.fullName, `%${search}%`),
        ilike(subscribers.phone, `%${search}%`),
        sql`CAST(${invoices.id} AS TEXT) ILIKE ${`%${search}%`}`
      )
    : undefined;

  const baseQuery = db
    .select({
      id: invoices.id,
      subscriberId: invoices.subscriberId,
      amount: invoices.amount,
      paidAmount: invoices.paidAmount,
      paymentMethod: invoices.paymentMethod,
      status: invoices.status,
      notes: invoices.notes,
      createdAt: invoices.createdAt,
      subscriberLineId: subscribers.lineId,
      subscriberName: subscribers.fullName,
      subscriberPhone: subscribers.phone,
      subscriberFacilityType: subscribers.facilityType,
    })
    .from(invoices)
    .innerJoin(subscribers, eq(invoices.subscriberId, subscribers.id))
    .where(searchFilter)
    .orderBy(desc(invoices.createdAt));

  const [rows, totalRow] = await Promise.all([
    baseQuery.limit(limit).offset(offset),
    db
      .select({ total: count() })
      .from(invoices)
      .innerJoin(subscribers, eq(invoices.subscriberId, subscribers.id))
      .where(searchFilter),
  ]);

  const items: InvoiceListRow[] = rows.map((row) => ({
    id: row.id,
    subscriberId: row.subscriberId,
    amount: String(row.amount ?? "0"),
    paidAmount: String(row.paidAmount ?? "0"),
    paymentMethod: row.paymentMethod,
    status: row.status as InvoiceListRow["status"],
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    subscriberLineId: row.subscriberLineId ?? `S${row.subscriberId}`,
    subscriberName: row.subscriberName ?? "",
    subscriberPhone: row.subscriberPhone ?? null,
    subscriberFacilityType: row.subscriberFacilityType ?? null,
  }));

  return {
    items,
    total: Number(totalRow[0]?.total ?? 0),
    page,
    limit,
  };
}

export async function getSubscriberInvoices(subscriberId: number) {
  const db = getDb();
  return db.select().from(invoices).where(eq(invoices.subscriberId, subscriberId)).orderBy(invoices.createdAt);
}

export async function createInvoice(
  subscriberId: number,
  createdBy: number,
  amount: string,
  paidAmount: string,
  paymentMethod: "cash" | "bank_transfer" | "credit",
  notes?: string
) {
  const db = getDb();
  const amountN = Number(amount);
  const payment = Number(paidAmount);
  const addToBalance = payment - amountN;

  let status: "paid" | "debt" | "partial" = "paid";
  if (amountN === 0) {
    status = "paid";
  } else if (payment === 0) {
    status = "debt";
  } else if (amountN > payment) {
    status = "partial";
  }

  const result = await db.transaction(async (tx) => {
    const invoice = await tx
      .insert(invoices)
      .values({
        subscriberId,
        createdBy,
        amount: amount,
        paidAmount: paidAmount,
        paymentMethod,
        status,
        notes: notes || null,
      })
      .returning();

    await tx
      .update(subscribers)
      .set({
        balance: sql`${subscribers.balance} + ${addToBalance}`,
      })
      .where(eq(subscribers.id, subscriberId));

    return invoice;
  });

  return result[0];
}

export async function getInvoiceById(invoiceId: number) {
  const db = getDb();
  const result = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
  return result[0] || null;
}

export async function deleteInvoice(invoiceId: number) {
  const db = getDb();

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const paidAmount = parseFloat(invoice.paidAmount as string) || 0;
  const amount = parseFloat(invoice.amount as string) || 0;
  const balanceDelta = invoiceBalanceDelta(amount, paidAmount);

  if (balanceDelta !== 0) {
    await db
      .update(subscribers)
      .set({
        balance: sql`${subscribers.balance} - ${balanceDelta}`,
      })
      .where(eq(subscribers.id, invoice.subscriberId));
  }

  await db.delete(invoices).where(eq(invoices.id, invoiceId));
}
