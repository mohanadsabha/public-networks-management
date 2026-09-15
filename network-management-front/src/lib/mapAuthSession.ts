import { permissionsForRoleName } from "@/lib/roles";
import type { AuthSession, AuthUser } from "@/types/auth";

export interface BackendAuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
  roleId: number;
  role: string;
  status?: "active" | "inactive" | null;
}

function normalizeRoleName(role?: string): string {
  return (role ?? "admin").trim().toLowerCase();
}

export function mapBackendUserToSession(user: BackendAuthUser): AuthSession {
  const roleName = normalizeRoleName(user.role);

  const mappedUser: AuthUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role_id: user.roleId,
    role_name: roleName,
    status: user.status ?? "active",
  };

  return {
    user: mappedUser,
    permissions: permissionsForRoleName(roleName),
  };
}

/** @deprecated Use mapBackendUserToSession — JWT is no longer stored on the client */
export function mapBackendLoginToSession(
  _token: string,
  user: Omit<BackendAuthUser, "role"> & { role?: string },
): AuthSession {
  return mapBackendUserToSession({
    ...user,
    role: user.role ?? "admin",
  });
}
