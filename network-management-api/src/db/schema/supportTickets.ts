import { pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const supportTicketStatusEnum = pgEnum("support_ticket_status", [
  "open",
  "in_progress",
  "waiting_customer",
  "resolved",
]);

export const supportTicketPriorityEnum = pgEnum("support_ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const supportTicketChannelEnum = pgEnum("support_ticket_channel", [
  "phone",
  "visit",
  "whatsapp",
  "other",
]);

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 32 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  status: supportTicketStatusEnum("status").notNull().default("open"),
  priority: supportTicketPriorityEnum("priority").notNull().default("medium"),
  channel: supportTicketChannelEnum("channel").notNull().default("phone"),
  subscriberName: varchar("subscriber_name", { length: 200 }).notNull(),
  subscriberPhone: varchar("subscriber_phone", { length: 50 }).notNull(),
  assignedTo: varchar("assigned_to", { length: 200 }).notNull().default("Unassigned"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
