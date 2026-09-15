import { useTranslation } from "react-i18next";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/data";
import { getUsernameLifecycleStatus, type AvailableUsername } from "@/types/availableUsername";

interface AvailableUsernameStatusBadgeProps {
  row: AvailableUsername;
}

export function AvailableUsernameStatusBadge({ row }: AvailableUsernameStatusBadgeProps) {
  const { t } = useTranslation();
  const lifecycle = getUsernameLifecycleStatus(row);

  if (lifecycle === "owner") {
    return (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge
          label={t("availableUsernames.status.owner")}
          variant="primary"
        />
        <span className="text-xs text-muted-foreground">
          {t("availableUsernames.status.ownerNeverExpires")}
        </span>
      </div>
    );
  }

  if (lifecycle === "new") {
    return (
      <StatusBadge label={t("availableUsernames.status.new")} variant="success" />
    );
  }

  if (lifecycle === "in_cooldown") {
    return (
      <StatusBadge label={t("availableUsernames.status.inCooldown")} variant="warning" />
    );
  }

  return (
    <StatusBadge label={t("availableUsernames.status.inCooldown")} variant="warning" />
  );
}

export function AvailableUsernameStatusBadgeCompact({ row }: AvailableUsernameStatusBadgeProps) {
  const { t } = useTranslation();
  const lifecycle = getUsernameLifecycleStatus(row);

  const config: Record<string, { label: string; variant: StatusBadgeVariant }> = {
    owner: { label: t("availableUsernames.status.owner"), variant: "primary" },
    new: { label: t("availableUsernames.status.new"), variant: "success" },
    in_cooldown: {
      label: t("availableUsernames.status.inCooldown"),
      variant: "warning",
    },
  };

  const { label, variant } = config[lifecycle] ?? config.in_cooldown;

  return <StatusBadge label={label} variant={variant} />;
}
