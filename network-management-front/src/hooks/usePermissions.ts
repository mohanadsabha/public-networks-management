import { hasAllPermissions, hasAnyPermission, hasPermission } from "@/lib/permissions";
import { useAuth } from "./useAuth";

export function usePermissions() {
  const { permissions } = useAuth();

  return {
    permissions,
    can: (permission: string) => hasPermission(permissions, permission),
    canAny: (required: string[]) => hasAnyPermission(permissions, required),
    canAll: (required: string[]) => hasAllPermissions(permissions, required),
  };
}
