import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface CanProps {
  permission?: string;
  anyOf?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, anyOf, children, fallback = null }: CanProps) {
  const { can, canAny } = usePermissions();

  if (permission && !can(permission)) {
    return <>{fallback}</>;
  }

  if (anyOf && anyOf.length > 0 && !canAny(anyOf)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
