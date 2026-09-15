import type {
  AdminRole,
  AdminUser,
  AdminUserFormValues,
  AdminUsersListParams,
  AdminUserStatus,
} from "@/types/adminUser";

/** Matches API seed roles */
export const mockAdminRoles: AdminRole[] = [
  { id: 1, name: "super_admin", displayName: "Super Admin" },
  { id: 2, name: "admin", displayName: "Admin" },
  { id: 3, name: "viewer", displayName: "Viewer" },
];

/** Fresh starter accounts — mirrors DB seed */
export const mockAdminUsers: AdminUser[] = [
  {
    id: 1,
    name: "Super Admin",
    username: "superadmin",
    email: "superadmin@we.wifi",
    roleId: 1,
    roleName: "super_admin",
    roleDisplayName: "Super Admin",
    status: "active",
    lastLoginAt: null,
    createdAt: "2026-06-10T08:00:00.000Z",
  },
  {
    id: 2,
    name: "Operations Admin",
    username: "ops",
    email: "ops@we.wifi",
    roleId: 2,
    roleName: "admin",
    roleDisplayName: "Admin",
    status: "active",
    lastLoginAt: null,
    createdAt: "2026-06-10T08:00:00.000Z",
  },
  {
    id: 3,
    name: "Viewer",
    username: "viewer",
    email: "viewer@we.wifi",
    roleId: 3,
    roleName: "viewer",
    roleDisplayName: "Viewer",
    status: "active",
    lastLoginAt: null,
    createdAt: "2026-06-10T08:00:00.000Z",
  },
];

function matchesSearch(user: AdminUser, search: string): boolean {
  const q = search.toLowerCase();
  return (
    user.name.toLowerCase().includes(q) ||
    user.username.toLowerCase().includes(q) ||
    (user.email?.toLowerCase().includes(q) ?? false) ||
    user.roleDisplayName.toLowerCase().includes(q) ||
    user.roleName.toLowerCase().includes(q) ||
    user.status.includes(q)
  );
}

let mockUsersStore: AdminUser[] = [...mockAdminUsers];

export function listMockAdminUsers(params: AdminUsersListParams = {}) {
  return queryAdminUsersMock(mockUsersStore, params);
}

export function createMockAdminUser(values: AdminUserFormValues): AdminUser {
  const role = mockAdminRoles.find((r) => r.id === values.roleId) ?? mockAdminRoles[1];
  const nextId = Math.max(0, ...mockUsersStore.map((u) => u.id)) + 1;
  const created: AdminUser = {
    id: nextId,
    name: values.name.trim(),
    username: values.username.trim(),
    email: values.email.trim() || null,
    roleId: role.id,
    roleName: role.name,
    roleDisplayName: role.displayName,
    status: values.status,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };
  mockUsersStore = [created, ...mockUsersStore];
  return created;
}

export function updateMockAdminUser(id: number, values: Partial<AdminUserFormValues>): AdminUser | null {
  const index = mockUsersStore.findIndex((u) => u.id === id);
  if (index < 0) return null;

  const current = mockUsersStore[index];
  const role = values.roleId
    ? (mockAdminRoles.find((r) => r.id === values.roleId) ?? mockAdminRoles[1])
    : null;

  const updated: AdminUser = {
    ...current,
    name: values.name?.trim() ?? current.name,
    username: values.username?.trim() ?? current.username,
    email: values.email !== undefined ? values.email.trim() || null : current.email,
    roleId: role?.id ?? current.roleId,
    roleName: role?.name ?? current.roleName,
    roleDisplayName: role?.displayName ?? current.roleDisplayName,
    status: values.status ?? current.status,
  };

  mockUsersStore = mockUsersStore.map((u) => (u.id === id ? updated : u));
  return updated;
}

export function deleteMockAdminUser(id: number): boolean {
  const target = mockUsersStore.find((u) => u.id === id);
  if (!target) return false;
  if (target.roleName === "super_admin") {
    const superCount = mockUsersStore.filter((u) => u.roleName === "super_admin").length;
    if (superCount <= 1) return false;
  }
  mockUsersStore = mockUsersStore.filter((u) => u.id !== id);
  return true;
}

export function setMockAdminUserStatus(id: number, status: AdminUserStatus): AdminUser | null {
  return updateMockAdminUser(id, { status } as AdminUserFormValues);
}

export function queryAdminUsersMock(
  users: AdminUser[],
  params: AdminUsersListParams = {},
): { items: AdminUser[]; total: number; page: number; limit: number } {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 10);
  const search = params.search?.trim();

  let filtered = [...users];
  if (search) {
    filtered = filtered.filter((row) => matchesSearch(row, search));
  }

  filtered.sort((a, b) => b.id - a.id);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, limit };
}
