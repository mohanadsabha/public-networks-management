import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AvailableUsernameStatusBadge } from "@/components/pages/available-usernames/AvailableUsernameStatusBadge";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { MaskedPasswordCell } from "@/components/ui/data";
import {
  formatConnectionDateTime,
  formatCreatedDate,
  getDaysUntilExpiry,
  getUsernameLifecycleStatus,
  type AvailableUsername,
} from "@/types/availableUsername";

interface AvailableUsernameDetailsModalProps {
  open: boolean;
  row: AvailableUsername | null;
  speedLabel?: string;
  onClose: () => void;
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-0 sm:grid-cols-[minmax(8rem,34%)_1fr] sm:gap-4">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function AvailableUsernameDetailsModal({
  open,
  row,
  speedLabel,
  onClose,
}: AvailableUsernameDetailsModalProps) {
  const { t, i18n } = useTranslation();

  if (!row) return null;

  const lifecycle = getUsernameLifecycleStatus(row);
  const daysRemaining =
    lifecycle === "in_cooldown" && row.expiryDate
      ? getDaysUntilExpiry(row.expiryDate)
      : null;

  const dash = <span className="text-muted-foreground">—</span>;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("availableUsernames.details.title", { username: row.username })}
      closeLabel={t("common.cancel")}
      footer={
        <ModalFooterButton variant="outline" onClick={onClose}>
          {t("availableUsernames.details.close")}
        </ModalFooterButton>
      }
    >
      <dl className="divide-y divide-border rounded-lg border border-border bg-muted/10 px-4">
        <DetailRow label={t("availableUsernames.table.username")}>
          <span className="font-medium">{row.username}</span>
        </DetailRow>

        <DetailRow label={t("availableUsernames.table.password")}>
          <MaskedPasswordCell value={row.password} />
        </DetailRow>

        {speedLabel ? (
          <DetailRow label={t("availableUsernames.table.speed")}>{speedLabel}</DetailRow>
        ) : null}

        <DetailRow label={t("availableUsernames.table.status")}>
          <AvailableUsernameStatusBadge row={row} />
        </DetailRow>

        <DetailRow label={t("availableUsernames.details.firstConnection")}>
          {row.assignedAt
            ? formatConnectionDateTime(row.assignedAt, i18n.language)
            : dash}
        </DetailRow>

        <DetailRow label={t("availableUsernames.details.expiresAt")}>
          {row.expiryDate ? formatConnectionDateTime(row.expiryDate, i18n.language) : dash}
        </DetailRow>

        <DetailRow label={t("availableUsernames.table.expires")}>
          {daysRemaining !== null
            ? t("availableUsernames.status.expiresIn", { count: daysRemaining })
            : lifecycle === "owner"
              ? t("availableUsernames.status.ownerNeverExpires")
              : dash}
        </DetailRow>

        <DetailRow label={t("availableUsernames.details.addedDate")}>
          {formatCreatedDate(row.createdAt, i18n.language)}
        </DetailRow>

        <DetailRow label={t("availableUsernames.details.addedFull")}>
          {formatConnectionDateTime(row.createdAt, i18n.language)}
        </DetailRow>
      </dl>
    </Modal>
  );
}
