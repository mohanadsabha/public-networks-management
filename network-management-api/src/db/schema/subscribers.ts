import { pgTable, varchar, integer, text, numeric, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { availableUsernames } from "./availableUsernames";
import { routers } from "./routers";

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  usernameID: integer("username_id").references(() => availableUsernames.id),
  // add organization id when we start doing multi-tenant
  lineId: varchar("line_id", { length: 20 }).unique(),
  fullName: varchar("full_name", { length: 200 }),
  facilityType: varchar("facility_type", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  routerId: integer("router_id").references(() => routers.id),
  routerPort: numeric("router_port"),
  monthlyPrice: numeric("monthly_price", { precision: 10, scale: 2 }).default("-1"),
  isSuspended: boolean("is_suspended").default(false),
  isPaused: boolean("is_paused").default(false),
  notes: text("notes"),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  suspendAt: timestamp("suspend_at", { withTimezone: true }).defaultNow(),
});
