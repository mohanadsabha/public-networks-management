import { useTranslation } from "react-i18next";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/data";
import type { TicketStatus } from "@/types/supportTicket";

const STATUS_VARIANT: Record<TicketStatus, StatusBadgeVariant> = {
  open: "warning",
  in_progress: "primary",
  waiting_customer: "accent",
  resolved: "success",
};

interface TicketStatusBadgeProps {
  status: TicketStatus;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <StatusBadge
      label={t(`support.status.${status}`)}
      variant={STATUS_VARIANT[status]}
    />
  );
}
