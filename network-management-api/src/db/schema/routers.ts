import { pgTable, varchar, integer, text, numeric, boolean, timestamp, serial } from "drizzle-orm/pg-core";

export const routers = pgTable("routers", {
  id: serial("id").primaryKey(),
  // add organization id when we start doing multi-tenant
  routerName: varchar("router_name", { length: 100 }),
  routerImage: varchar("router_image", { length: 255 }),
  routerPublicId: varchar("router_image_public_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
