import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { isDevAuthMode } from "@/lib/devAuth";
import type { UserRole } from "@/types/auth";

const ROLE_KEYS: UserRole[] = ["admin", "viewer"];

function isUserRole(value: string): value is UserRole {
  return ROLE_KEYS.includes(value as UserRole);
}

export function useAuthUserLabels() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return { displayName: "", displayRole: "" };
  }

  const displayName = isDevAuthMode() ? t("dev.userName") : user.name;

  let displayRole = user.role_display_name ?? "";
  if (user.role_name && isUserRole(user.role_name)) {
    displayRole = t(`roles.${user.role_name}`);
  }

  return { displayName, displayRole };
}
