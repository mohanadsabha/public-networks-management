import type { UserRole } from "@/types/auth";

export const SUPER_ADMIN_ROLE = "super_admin" as const;
export const ADMIN_ROLE: UserRole = "admin";
export const VIEWER_ROLE: UserRole = "viewer";

/** Read-only permissions for viewer role */
export const VIEWER_PERMISSIONS = [
  "dashboard.view",
  "subscription_statistics.view",
  "subscribers.view",
  "expired.view",
  "disabled.view",
  "available_usernames.view",
  "online_users.view",
] as const;

/** Admin — full operations except user management */
export const ADMIN_PERMISSIONS = [
  ...VIEWER_PERMISSIONS,
  "customers.view",
  "disabled.view",
  "speeds.view",
  "settings.view",
  "finance.view",
  "support.view",
  "subscribers.create",
  "subscribers.update",
  "subscribers.delete",
  "subscribers.import",
  "subscribers.export",
  "expired.update",
  "disabled.restore",
  "available_usernames.create",
  "available_usernames.import",
  "available_usernames.export",
  "available_usernames.delete",
  "sms.view",
  "sms.send",
  "logs.view",
  "speeds.manage",
] as const;

/** Super admin — everything including user management */
export const SUPER_ADMIN_PERMISSIONS = [
  ...ADMIN_PERMISSIONS,
  "users.view",
  "users.create",
  "users.update",
  "users.delete",
  "users.change_status",
] as const;

const SUPER_ADMIN_ROLE_NAMES = new Set([SUPER_ADMIN_ROLE, "system_admin"]);
const ADMIN_ROLE_NAMES = new Set([ADMIN_ROLE, ...SUPER_ADMIN_ROLE_NAMES]);

function normalizeRole(role?: string): string {
  return (role ?? "").trim().toLowerCase();
}

export function isSuperAdminRole(role?: string): boolean {
  const normalized = normalizeRole(role);
  return normalized.length > 0 && SUPER_ADMIN_ROLE_NAMES.has(normalized);
}

export function isAdminRole(role?: string): role is typeof ADMIN_ROLE | typeof SUPER_ADMIN_ROLE {
  const normalized = normalizeRole(role);
  return normalized.length > 0 && ADMIN_ROLE_NAMES.has(normalized);
}

export function isViewerRole(role?: string): role is typeof VIEWER_ROLE {
  return normalizeRole(role) === VIEWER_ROLE;
}

export function permissionsForRoleName(roleName: string): string[] {
  const normalized = roleName.trim().toLowerCase();
  if (normalized === VIEWER_ROLE) {
    return [...VIEWER_PERMISSIONS];
  }
  if (isSuperAdminRole(normalized)) {
    return [...SUPER_ADMIN_PERMISSIONS];
  }
  return [...ADMIN_PERMISSIONS];
}
