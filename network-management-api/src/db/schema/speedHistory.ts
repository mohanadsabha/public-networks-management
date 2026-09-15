import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { subscribers } from "./subscribers";

export const speedHistory = pgTable("speed_history", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id")
      .references(() => subscribers.id)
      .notNull(),
  oldSpeed: integer("old_speed").notNull(),
  newSpeed: integer("new_speed").notNull(),
  usageStartDate: timestamp("usage_start_date", { withTimezone: true }),
  usageEndDate: timestamp("usage_end_date", { withTimezone: true }),
  daysUsed: integer("days_used").default(0),
  changedAt: timestamp("changed_at", { withTimezone: true }).defaultNow(),
});
