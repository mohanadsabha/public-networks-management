import { useTranslation } from "react-i18next";
import {
  getDaysUntilExpiry,
  getUsernameLifecycleStatus,
  type AvailableUsername,
} from "@/types/availableUsername";
import { cn } from "@/lib/cn";

interface AvailableUsernameExpiryLabelProps {
  row: AvailableUsername;
  className?: string;
}

export function AvailableUsernameExpiryLabel({ row, className }: AvailableUsernameExpiryLabelProps) {
  const { t } = useTranslation();
  const lifecycle = getUsernameLifecycleStatus(row);

  if (lifecycle === "owner") {
    if (row.isUsed && row.expiryDate) {
      const days = getDaysUntilExpiry(row.expiryDate);
      return (
        <span className={cn("text-xs font-medium text-foreground", className)}>
          {t("availableUsernames.status.expiresIn", { count: days })}
        </span>
      );
    }
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        {t("availableUsernames.status.ownerNeverExpires")}
      </span>
    );
  }

  if (lifecycle === "new") {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  }

  if (lifecycle === "in_cooldown" && row.expiryDate) {
    const days = getDaysUntilExpiry(row.expiryDate);
    return (
      <span className={cn("text-xs font-medium text-foreground", className)}>
        {t("availableUsernames.status.expiresIn", { count: days })}
      </span>
    );
  }

  return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
}
