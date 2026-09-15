import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleAccess } from "@/hooks/useRoleAccess";

interface RequirePermissionProps {
  permission?: string;
  anyOf?: string[];
  /** Block read-only viewer accounts even if permissions were misconfigured */
  adminOnly?: boolean;
  children: ReactNode;
}

/** Redirects to home when the user lacks the required permission. */
export function RequirePermission({ permission, anyOf, adminOnly, children }: RequirePermissionProps) {
  const { can, canAny } = usePermissions();
  const { isViewer } = useRoleAccess();

  if (adminOnly && isViewer) {
    return <Navigate to="/" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/" replace />;
  }

  if (anyOf && anyOf.length > 0 && !canAny(anyOf)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
