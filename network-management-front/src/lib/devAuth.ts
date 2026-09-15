import type { AuthSession, LoginPayload } from "@/types/auth";
import { ADMIN_ROLE, permissionsForRoleName, SUPER_ADMIN_ROLE, VIEWER_ROLE } from "@/lib/roles";

function resolveDevRole(username: string): string {
  const normalized = username.trim().toLowerCase();
  if (normalized === "viewer") return VIEWER_ROLE;
  if (normalized === "superadmin" || normalized === "super_admin") return SUPER_ADMIN_ROLE;
  return ADMIN_ROLE;
}

export function createDevSession(payload: LoginPayload): AuthSession {
  const roleName = resolveDevRole(payload.username);
  const isViewer = roleName === VIEWER_ROLE;
  const isSuperAdmin = roleName === SUPER_ADMIN_ROLE;

  return {
    user: {
      id: 1,
      name: isViewer ? "Viewer User" : isSuperAdmin ? "Super Admin" : "Operations Admin",
      username: payload.username || "ops",
      email: isViewer
        ? "viewer@wewifi.local"
        : isSuperAdmin
          ? "superadmin@wewifi.local"
          : "ops@wewifi.local",
      role_id: isViewer ? 3 : isSuperAdmin ? 1 : 2,
      role_name: roleName,
      role_display_name: isViewer ? "Viewer" : isSuperAdmin ? "Super Admin" : "Admin",
      status: "active",
    },
    permissions: permissionsForRoleName(roleName),
  };
}

export function isDevAuthMode(): boolean {
  return import.meta.env.VITE_SKIP_AUTH_CHECK === "true";
}
