import { useAuth } from "@/hooks/useAuth";
import { isAdminRole, isSuperAdminRole, isViewerRole } from "@/lib/roles";

export function useRoleAccess() {
  const { user } = useAuth();
  const roleName = user?.role_name;

  return {
    roleName,
    isSuperAdmin: isSuperAdminRole(roleName),
    isAdmin: isAdminRole(roleName),
    isViewer: isViewerRole(roleName),
    /** Admin write actions (create, edit, delete, import) on operational pages */
    canManage: isAdminRole(roleName),
    /** Super admin only — admin users CRUD */
    canManageUsers: isSuperAdminRole(roleName),
    /** Admin-only: reveal subscriber / pool passwords */
    canViewPasswords: isAdminRole(roleName),
  };
}
