import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 60 }).notNull().unique(),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
});
