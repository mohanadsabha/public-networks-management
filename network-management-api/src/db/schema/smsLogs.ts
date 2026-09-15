import { pgEnum, pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers";
import { subscribers } from "./subscribers";
import { smsTemplates } from "./smsTemplates";

export const smsLogStatusEnum = pgEnum("sms_log_status", ["sent", "failed"]);

export const smsLogs = pgTable("sms_logs", {
  id: serial("id").primaryKey(),
  sentByUserId: integer("sent_by_user_id")
    .references(() => adminUsers.id)
    .notNull(),
  subscriberId: integer("subscriber_id").references(() => subscribers.id),
  phone: varchar("phone", { length: 50 }).notNull(),
  message: text("message").notNull(),
  recipientType: varchar("recipient_type", { length: 20 }).notNull(),
  status: smsLogStatusEnum("status").notNull(),
  providerResponse: text("provider_response"),
  errorMessage: text("error_message"),
  templateId: integer("template_id").references(() => smsTemplates.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
