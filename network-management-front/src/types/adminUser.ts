export type AdminUserStatus = "active" | "inactive";

export interface AdminRole {
  id: number;
  name: string;
  displayName: string;
}

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string | null;
  roleId: number;
  roleName: string;
  roleDisplayName: string;
  status: AdminUserStatus;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUsersListResult {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUsersListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminUserFormValues {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  status: AdminUserStatus;
}
