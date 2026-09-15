import { integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers";
import { subscribers } from "./subscribers";

export const smsGroups = pgTable("sms_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  createdByUserId: integer("created_by_user_id").references(() => adminUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const smsGroupMembers = pgTable(
  "sms_group_members",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => smsGroups.id, { onDelete: "cascade" }),
    subscriberId: integer("subscriber_id")
      .notNull()
      .references(() => subscribers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("sms_group_members_group_subscriber_uidx").on(table.groupId, table.subscriberId)],
);
