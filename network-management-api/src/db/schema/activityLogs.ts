import { pgTable, serial, varchar, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const activityActionEnum = pgEnum("activity_action", ["Created", "Updated", "Deleted"]);

/**
 * Maps 1-to-1 with your module folder names (image 2).
 * Add more as the project grows.
 */
export const subjectTypeEnum = pgEnum("subject_type", [
  "Subscriber",
  "Customer",
  "Username",
  "Speed",
  "Invoice",
  "Role",
  "Admin User",
  "Mikrotik",
  "SMS",
  "Support",
  "Card Group",
  "Group Bandwidth Scheduler",
  "Router",
  "Other",
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),

  // Who did the action
  adminId: integer("admin_id").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  adminName: varchar("admin_name", { length: 200 }), // denormalised snapshot

  // What happened
  action: activityActionEnum("action").notNull(), // created | updated | deleted
  subjectType: subjectTypeEnum("subject_type").notNull(), // e.g. "speed"
  subjectId: integer("subject_id"), // PK of the affected row (nullable for bulk)
  subjectName: varchar("subject_name", { length: 255 }), // human-readable label shown in the UI

  // HTTP context (populated by the middleware)
  method: varchar("method", { length: 10 }).notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  statusCode: integer("status_code").default(200),
  ipAddress: varchar("ip_address", { length: 120 }),

  // Optional diff / extra info stored as JSON string
  details: text("details"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
