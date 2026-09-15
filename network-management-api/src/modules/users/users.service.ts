import { getDb } from "../../config/db";
import { adminUsers } from "../../db/schema/adminUsers";
import { roles } from "../../db/schema/roles";
import bcrypt from "bcrypt";
import { desc, eq } from "drizzle-orm";
import { CreateUserInput, UpdateUserInput } from "./users.validation";

export interface AdminUsersListParams {
  page?: number;
  limit?: number;
  search?: string;
}

function mapUserRow(row: {
  id: number;
  name: string;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  status: "active" | "inactive" | null;
  lastLoginAt: Date | null;
  createdAt: Date | null;
}) {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    roleId: row.roleId,
    roleName: row.roleName,
    roleDisplayName: row.roleDisplayName,
    status: row.status ?? "active",
    lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
    createdAt: row.createdAt?.toISOString() ?? "",
  };
}

function matchesSearch(
  row: { name: string; username: string; email: string; roleName: string; roleDisplayName: string; status: string },
  search: string,
): boolean {
  const q = search.toLowerCase();
  return (
    row.name.toLowerCase().includes(q) ||
    row.username.toLowerCase().includes(q) ||
    row.email.toLowerCase().includes(q) ||
    row.roleName.toLowerCase().includes(q) ||
    row.roleDisplayName.toLowerCase().includes(q) ||
    row.status.toLowerCase().includes(q)
  );
}

export async function getAllUsers(params: AdminUsersListParams = {}) {
  const db = getDb();
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 10);
  const search = params.search?.trim();

  const rows = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      username: adminUsers.username,
      email: adminUsers.email,
      roleId: adminUsers.roleId,
      roleName: roles.name,
      roleDisplayName: roles.displayName,
      status: adminUsers.status,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .innerJoin(roles, eq(adminUsers.roleId, roles.id))
    .orderBy(desc(adminUsers.createdAt));

  const mapped = rows.map(mapUserRow);
  const filtered = search ? mapped.filter((row) => matchesSearch(row, search)) : mapped;
  const total = filtered.length;
  const start = (page - 1) * limit;

  return {
    items: filtered.slice(start, start + limit),
    total,
    page,
    limit,
  };
}

export async function getUserById(id: number) {
  const db = getDb();
  const [row] = await db
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      username: adminUsers.username,
      email: adminUsers.email,
      roleId: adminUsers.roleId,
      roleName: roles.name,
      roleDisplayName: roles.displayName,
      status: adminUsers.status,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .innerJoin(roles, eq(adminUsers.roleId, roles.id))
    .where(eq(adminUsers.id, id))
    .limit(1);

  return row ? mapUserRow(row) : null;
}

export async function createUser(data: CreateUserInput) {
  const db = getDb();

  const [existing] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.username, data.username))
    .limit(1);

  if (existing) {
    throw new Error("Username already exists");
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const [created] = await db
    .insert(adminUsers)
    .values({
      name: data.name,
      username: data.username,
      email: data.email,
      password: hashed,
      roleId: data.roleId,
      status: data.status,
    })
    .returning({ id: adminUsers.id });

  return getUserById(created.id);
}

export async function updateUser(id: number, data: UpdateUserInput) {
  const db = getDb();

  const user = await getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }

  const updateData: Partial<typeof adminUsers.$inferInsert> = {};
  if (data.name) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email ?? "noreply@we.wifi";
  if (data.roleId) updateData.roleId = data.roleId;
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return user;
  }

  await db.update(adminUsers).set(updateData).where(eq(adminUsers.id, id));
  return getUserById(id);
}

export async function deleteUser(id: number) {
  const db = getDb();
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.roleName === "super_admin") {
    const superAdmins = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .innerJoin(roles, eq(adminUsers.roleId, roles.id))
      .where(eq(roles.name, "super_admin"));

    if (superAdmins.length <= 1) {
      throw new Error("Cannot delete the last super admin");
    }
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}

export async function changeUserStatus(id: number, status: "active" | "inactive") {
  const db = getDb();

  if (status === "inactive") {
    const user = await getUserById(id);
    if (user?.roleName === "super_admin") {
      const superAdmins = await db
        .select({ id: adminUsers.id })
        .from(adminUsers)
        .innerJoin(roles, eq(adminUsers.roleId, roles.id))
        .where(eq(roles.name, "super_admin"));

      if (superAdmins.length <= 1) {
        throw new Error("Cannot disable the last super admin");
      }
    }
  }

  await db
    .update(adminUsers)
    .set({
      status,
      // Invalidate existing sessions when deactivating (same mechanism as logout)
      ...(status === "inactive" ? { lastLoginAt: new Date() } : {}),
    })
    .where(eq(adminUsers.id, id));
  return getUserById(id);
}
