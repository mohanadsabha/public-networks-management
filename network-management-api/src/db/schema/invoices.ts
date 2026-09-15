import { pgTable, pgEnum, serial, integer, numeric, timestamp, varchar as _varchar, text } from "drizzle-orm/pg-core";
import { subscribers } from "./subscribers";
import { adminUsers } from "./adminUsers";

export const paymentMethods = pgEnum("payment_methods", ["cash", "bank_transfer", "credit"]);
export const invoiceStatus = pgEnum("invoice_status", ["unpaid", "partial", "paid", "debt"]);

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id")
    .references(() => subscribers.id)
    .notNull(),
  createdBy: integer("created_by").references(() => adminUsers.id).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: paymentMethods("payment_method").notNull(),
  status: invoiceStatus("status").default("unpaid"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
