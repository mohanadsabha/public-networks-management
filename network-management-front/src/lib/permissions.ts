/** Check if the current user has a specific permission */
export function hasPermission(
  permissions: string[],
  permission: string,
): boolean {
  return permissions.includes(permission);
}

/** Check if user has at least one of the given permissions */
export function hasAnyPermission(
  permissions: string[],
  required: string[],
): boolean {
  return required.some((p) => permissions.includes(p));
}

/** Check if user has all of the given permissions */
export function hasAllPermissions(
  permissions: string[],
  required: string[],
): boolean {
  return required.every((p) => permissions.includes(p));
}
