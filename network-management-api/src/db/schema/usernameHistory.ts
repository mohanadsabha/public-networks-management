import { pgTable, serial, varchar, integer, timestamp, text } from "drizzle-orm/pg-core";
import { subscribers } from "./subscribers";

export const usernameHistory = pgTable("username_history", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id")
    .references(() => subscribers.id)
    .notNull(),
  oldUsername: varchar("old_username", { length: 100 }).notNull(),
  oldPassword: varchar("old_password", { length: 255 }),
  usageStartDate: timestamp("usage_start_date", { withTimezone: true }),
  changeCause: text("change_cause"),
  usageEndDate: timestamp("usage_end_date", { withTimezone: true }),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow(),
});
