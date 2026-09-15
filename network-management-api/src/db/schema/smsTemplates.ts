import { boolean, pgTable, serial, integer, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers";

export const smsTemplates = pgTable("sms_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  body: text("body").notNull(),
  createdByUserId: integer("created_by_user_id").references(() => adminUsers.id),
  isSystem: boolean("is_system").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
