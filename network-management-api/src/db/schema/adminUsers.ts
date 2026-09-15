import { pgTable, pgEnum, serial, varchar, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { roles } from "./roles";

export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  // add organization id when we start doing multi-tenant
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 200 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  roleId: integer("role_id")
    .references(() => roles.id)
    .notNull(),
  status: userStatusEnum("status").default("active"),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetTokenExpiry: timestamp("password_reset_token_expiry", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
