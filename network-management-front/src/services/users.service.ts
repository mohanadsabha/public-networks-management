import { apiClient } from "@/lib/apiClient";
import {
  createMockAdminUser,
  deleteMockAdminUser,
  listMockAdminUsers,
  setMockAdminUserStatus,
  updateMockAdminUser,
} from "@/lib/mocks/adminUsers.mock";
import type {
  AdminUser,
  AdminUserFormValues,
  AdminUsersListParams,
  AdminUsersListResult,
  AdminUserStatus,
} from "@/types/adminUser";

import { isDevAuthMode } from "@/lib/devAuth";

/** Use live API when real auth is on (unless explicitly forced to mock). */
const USE_API =
  import.meta.env.VITE_USE_ADMIN_USERS_API === "true" ||
  (import.meta.env.VITE_USE_ADMIN_USERS_API !== "false" && !isDevAuthMode());

export type { AdminUsersListParams };

interface AdminUsersApiRow {
  id: number;
  name: string;
  username: string;
  email?: string | null;
  role_id?: number;
  roleId?: number;
  role_name?: string;
  roleName?: string;
  role_display_name?: string;
  roleDisplayName?: string;
  status: "active" | "inactive";
  last_login_at?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  created_at?: string;
}

interface AdminUsersResponse {
  success?: boolean;
  data?: {
    items?: AdminUsersApiRow[];
    data?: AdminUsersApiRow[];
    total: number;
    page: number;
    limit: number;
  };
}

function mapAdminUser(row: AdminUsersApiRow): AdminUser {
  const created = row.createdAt ?? row.created_at;
  const lastLogin = row.lastLoginAt ?? row.last_login_at;
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email ?? null,
    roleId: row.roleId ?? row.role_id ?? 0,
    roleName: row.roleName ?? row.role_name ?? "",
    roleDisplayName: row.roleDisplayName ?? row.role_display_name ?? "",
    status: row.status,
    lastLoginAt: typeof lastLogin === "string" ? lastLogin : null,
    createdAt: typeof created === "string" ? created : "",
  };
}

export const usersService = {
  async list(params: AdminUsersListParams = {}): Promise<AdminUsersListResult> {
    if (!USE_API) {
      await new Promise((r) => setTimeout(r, 180));
      return listMockAdminUsers(params);
    }

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const search = params.search?.trim();

    const { data: response } = await apiClient.get<AdminUsersResponse>("/users", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
      },
    });

    const payload = response.data;
    if (!payload) {
      return { items: [], total: 0, page, limit };
    }

    const rows = payload.items ?? payload.data ?? [];
    return {
      items: rows.map(mapAdminUser),
      total: payload.total ?? rows.length,
      page: payload.page ?? page,
      limit: payload.limit ?? limit,
    };
  },

  async create(values: AdminUserFormValues): Promise<AdminUser> {
    if (!USE_API) {
      await new Promise((r) => setTimeout(r, 200));
      return createMockAdminUser(values);
    }
    const { data } = await apiClient.post<{ data: AdminUsersApiRow }>("/users", {
      name: values.name,
      username: values.username,
      email: values.email.trim() || undefined,
      password: values.password,
      confirmPassword: values.confirmPassword,
      roleId: values.roleId,
      status: values.status,
    });
    return mapAdminUser(data.data);
  },

  async update(id: number, values: Partial<AdminUserFormValues>): Promise<AdminUser> {
    if (!USE_API) {
      await new Promise((r) => setTimeout(r, 200));
      const updated = updateMockAdminUser(id, values);
      if (!updated) throw new Error("User not found");
      return updated;
    }
    const { data } = await apiClient.put<{ data: AdminUsersApiRow }>(`/users/${id}`, {
      ...(values.name !== undefined ? { name: values.name } : {}),
      ...(values.email !== undefined ? { email: values.email.trim() || undefined } : {}),
      ...(values.password ? { password: values.password, confirmPassword: values.confirmPassword } : {}),
      ...(values.roleId !== undefined ? { roleId: values.roleId } : {}),
    });
    return mapAdminUser(data.data);
  },

  async remove(id: number): Promise<void> {
    if (!USE_API) {
      await new Promise((r) => setTimeout(r, 200));
      if (!deleteMockAdminUser(id)) throw new Error("User not found");
      return;
    }
    await apiClient.delete(`/users/${id}`);
  },

  async setStatus(id: number, status: AdminUserStatus): Promise<AdminUser> {
    if (!USE_API) {
      await new Promise((r) => setTimeout(r, 150));
      const updated = setMockAdminUserStatus(id, status);
      if (!updated) throw new Error("User not found");
      return updated;
    }
    const { data } = await apiClient.patch<{ data: AdminUsersApiRow }>(`/users/${id}/status`, { status });
    return mapAdminUser(data.data);
  },
};
