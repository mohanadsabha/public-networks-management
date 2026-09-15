import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AvailableUsernameStatusBadgeCompact,
} from "@/components/pages/available-usernames/AvailableUsernameStatusBadge";
import { AvailableUsernameExpiryLabel } from "@/components/pages/available-usernames/AvailableUsernameExpiryLabel";
import { AvailableUsernameUsageLabel } from "@/components/pages/available-usernames/AvailableUsernameUsageLabel";
import { UsernameChangeCauseField } from "@/components/pages/subscribers/UsernameChangeCauseField";
import {
  resolveUsernameChangeCause,
  type UsernameChangeCauseTemplate,
} from "@/lib/usernameChangeCause";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import { useAvailableUsernamesQuery } from "@/hooks/useAvailableUsernames";
import { getAvailablePoolForSubscriber } from "@/lib/availableUsernamePool";
import { buildSpeedLabel } from "@/lib/subscriberUtils";
import { isInAvailablePool, type AvailableUsername } from "@/types/availableUsername";
import { cn } from "@/lib/cn";

export interface PickedUsername {
  id: number;
  username: string;
  password: string;
  changeCause: string;
}

interface PickAvailableUsernameModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hint: string;
  speedMbps: number;
  packageLine: number;
  /** When set, loads pool from API (`/speeds/:id/usernames`) instead of mocks. */
  speedId?: number | null;
  excludeUsername?: string | null;
  onConfirm: (picked: PickedUsername) => void;
  isSubmitting?: boolean;
}

export function PickAvailableUsernameModal({
  open,
  onClose,
  title,
  hint,
  speedMbps,
  packageLine,
  speedId,
  excludeUsername,
  onConfirm,
  isSubmitting = false,
}: PickAvailableUsernameModalProps) {
  const { t } = useTranslation();

  const useApi = speedId != null && speedId > 0;
  const { data: apiRows = [], isLoading: poolLoading } = useAvailableUsernamesQuery(
    speedId ?? 0,
    open && useApi,
  );

  const pool = useMemo(() => {
    const list = useApi
      ? apiRows.filter((u) => isInAvailablePool(u))
      : getAvailablePoolForSubscriber(speedMbps, packageLine, { excludeUsername });

    if (!excludeUsername) return list;
    return list.filter((u) => u.username !== excludeUsername);
  }, [useApi, apiRows, speedMbps, packageLine, excludeUsername]);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [causeTemplate, setCauseTemplate] =
    useState<UsernameChangeCauseTemplate>("username_expired");
  const [customCause, setCustomCause] = useState("");
  const [causeError, setCauseError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedId(pool[0]?.id ?? null);
    setCauseTemplate("username_expired");
    setCustomCause("");
    setCauseError(null);
  }, [open, pool]);

  const selected = pool.find((u) => u.id === selectedId);

  const handleConfirm = () => {
    if (!selected) return;
    const templateLabels = {
      username_expired: t("subscribers.username.changeCauseTemplates.username_expired"),
      quota_finished: t("subscribers.username.changeCauseTemplates.quota_finished"),
      subscriber_request: t("subscribers.username.changeCauseTemplates.subscriber_request"),
      other: "",
    };
    const resolvedCause = resolveUsernameChangeCause(causeTemplate, customCause, templateLabels);
    if (!resolvedCause) {
      setCauseError(t("subscribers.username.changeCauseRequired"));
      return;
    }
    setCauseError(null);
    onConfirm({
      id: selected.id,
      username: selected.username,
      password: selected.password,
      changeCause: resolvedCause,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={title} className="sm:max-w-lg">
      <Text muted className="mb-4 text-sm">
        {hint}
      </Text>

      {speedMbps > 0 ? (
        <div className="mb-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <Text className="text-xs font-medium text-muted-foreground">
            {t("subscribers.username.poolSpeedLabel")}
          </Text>
          <Text className="mt-1 text-sm font-medium">{buildSpeedLabel(speedMbps)}</Text>
          <Text muted className="mt-1 text-xs">{t("subscribers.username.poolSpeedHint")}</Text>
        </div>
      ) : null}

      <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
        {poolLoading ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : pool.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {t("subscribers.username.poolEmpty")}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {pool.map((row) => (
              <PoolUsernameOption
                key={row.id}
                row={row}
                speedMbps={speedMbps}
                selected={selectedId === row.id}
                onSelect={() => setSelectedId(row.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <UsernameChangeCauseField
          className="mt-4"
          template={causeTemplate}
          customText={customCause}
          onTemplateChange={(next) => {
            setCauseTemplate(next);
            setCauseError(null);
          }}
          onCustomTextChange={(text) => {
            setCustomCause(text);
            setCauseError(null);
          }}
          error={causeError ?? undefined}
        />
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <ModalFooterButton variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </ModalFooterButton>
        <ModalFooterButton
          disabled={!selected || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleConfirm}
        >
          {t("subscribers.username.confirmPick")}
        </ModalFooterButton>
      </div>
    </Modal>
  );
}

function PoolUsernameOption({
  row,
  speedMbps,
  selected,
  onSelect,
}: {
  row: AvailableUsername;
  speedMbps: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-start transition-colors",
          selected ? "bg-muted/70" : "hover:bg-muted/40",
        )}
      >
        <span
          className={cn(
            "mt-1.5 h-4 w-4 shrink-0 rounded-full border-2",
            selected ? "border-primary bg-primary" : "border-border bg-background",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-medium text-foreground" dir="ltr">
            {row.username}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <AvailableUsernameStatusBadgeCompact row={row} />
            <span className="text-xs text-muted-foreground">
              {t("availableUsernames.table.expires")}:
            </span>
            <AvailableUsernameExpiryLabel row={row} />
            <span className="text-xs text-muted-foreground">
              {t("availableUsernames.table.usage")}:
            </span>
            <AvailableUsernameUsageLabel row={row} speedMbps={speedMbps} />
          </div>
        </div>
      </button>
    </li>
  );
}
