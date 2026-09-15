import { pgTable, serial, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { speedTiers } from "./speedTiers";

export const availableUsernames = pgTable("available_usernames", {
  id: serial("id").primaryKey(),
  speedId: integer("speed_id")
    .references(() => speedTiers.id)
    .notNull(),
  // user name is unique in the organization
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  usageLimit: integer("usage_limit"), // in MB
  totalUsage: integer("total_usage").default(0), // in MB
  uploadUsage: integer("upload_usage").default(0), // in MB
  downloadUsage: integer("download_usage").default(0), // in MB
  lastUploadUsage: integer("last_upload_usage").default(0), // in MB
  lastDownloadUsage: integer("last_download_usage").default(0), // in MB
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  // (network-owner username, never expires)
  isOwnerUsername: boolean("is_owner_username").default(false),
  isUsed: boolean("is_used").default(false),
  isExpired: boolean("is_expired").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
