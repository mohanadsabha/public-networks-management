import { pgTable, boolean, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const speedTiers = pgTable("speed_tiers", {
  id: serial("id").primaryKey(),
  // add organization id when we start doing multi-tenant
  // spped value in organiztion is unique
  speedValue: integer("speed_value").notNull(),
  price: numeric("price", { precision: 10, scale: 2, mode: "number" }),
  deleted: boolean("deleted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
