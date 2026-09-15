import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { SearchField, StatusBadge } from "@/components/ui/data";
import type { StatusBadgeVariant } from "@/components/ui/data";
import { Text } from "@/components/ui/typography";
import { UsernameChangeCauseField } from "@/components/pages/subscribers/UsernameChangeCauseField";
import {
  resolveUsernameChangeCause,
  type UsernameChangeCauseTemplate,
} from "@/lib/usernameChangeCause";
import { useCustomersQuery } from "@/hooks/useCustomers";
import {
  groupAssignUsernameRecipients,
  type AssignUsernameRecipientGroup,
} from "@/lib/assignUsernameRecipients";
import { isCustomerOnly } from "@/lib/customerUtils";
import { invalidatePoolAndStatsCaches, invalidateSubscriberCaches } from "@/lib/queryCache";
import { buildSpeedLabel, getDaysUntilDisconnect } from "@/lib/subscriberUtils";
import { subscribersService } from "@/services/subscribers.service";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/cn";
import type { AvailableUsername } from "@/types/availableUsername";
import type { Customer } from "@/types/customer";

interface AssignUsernameToSubscriberModalProps {
  open: boolean;
  username: AvailableUsername | null;
  speedLabel?: string;
  speedMbps?: number;
  onClose: () => void;
  /** Called after a successful assignment (e.g. to refetch the pool). */
  onAssigned?: () => void;
}

export function AssignUsernameToSubscriberModal({
  open,
  username,
  speedLabel,
  speedMbps = 0,
  onClose,
  onAssigned,
}: AssignUsernameToSubscriberModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [causeTemplate, setCauseTemplate] =
    useState<UsernameChangeCauseTemplate>("subscriber_request");
  const [customCause, setCustomCause] = useState("");
  const [causeError, setCauseError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setDebouncedSearch("");
    setSelectedId(null);
    setCauseTemplate("subscriber_request");
    setCustomCause("");
    setCauseError(null);
  }, [open]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { data: customers = [], isLoading } = useCustomersQuery(
    {
      kind: "all",
      search: debouncedSearch || undefined,
      limit: 500,
    },
    { enabled: open },
  );

  const groupedRecipients = useMemo(
    () => groupAssignUsernameRecipients(customers),
    [customers],
  );

  const recipientCount = useMemo(
    () => groupedRecipients.reduce((total, group) => total + group.rows.length, 0),
    [groupedRecipients],
  );

  const selected = useMemo(
    () => customers.find((row) => row.id === selectedId) ?? null,
    [customers, selectedId],
  );

  const assignMutation = useMutation({
    mutationFn: ({ subscriberId, changeCause }: { subscriberId: number; changeCause: string }) =>
      subscribersService.assignUsername(subscriberId, username!.id, changeCause),
    onSuccess: (subscriber) => {
      invalidateSubscriberCaches(queryClient, {
        subscriberId: subscriber.id,
        lineId: subscriber.lineId,
      });
      invalidatePoolAndStatsCaches(queryClient);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  if (!username) return null;

  const handleConfirm = async () => {
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
    try {
      await assignMutation.mutateAsync({
        subscriberId: selected.id,
        changeCause: resolvedCause,
      });
      toast.success(
        t("availableUsernames.assign.success", {
          username: username.username,
          name: selected.fullName || selected.lineId,
        }),
      );
      onAssigned?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("availableUsernames.assign.title", { username: username.username })}
      closeLabel={t("common.cancel")}
      className="sm:max-w-lg"
      footer={
        <>
          <ModalFooterButton variant="outline" onClick={onClose} disabled={assignMutation.isPending}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton
            onClick={handleConfirm}
            disabled={!selected || assignMutation.isPending}
            isLoading={assignMutation.isPending}
          >
            {t("availableUsernames.assign.confirm")}
          </ModalFooterButton>
        </>
      }
    >
      <div className="space-y-4">
        <Text muted className="text-sm">
          {t("availableUsernames.assign.hint")}
        </Text>

        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
          <div className="min-w-0">
            <Text className="text-xs font-medium text-muted-foreground">
              {t("availableUsernames.assign.usernameLabel")}
            </Text>
            <p className="mt-1 truncate font-mono text-sm font-semibold" dir="ltr">
              {username.username}
            </p>
          </div>
          <div className="min-w-0">
            <Text className="text-xs font-medium text-muted-foreground">
              {t("availableUsernames.assign.speedLabel")}
            </Text>
            <p className="mt-1 truncate text-sm font-medium">
              {speedLabel ?? (speedMbps > 0 ? buildSpeedLabel(speedMbps) : "—")}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <Text className="text-sm font-medium">
              {t("availableUsernames.assign.pickRecipient")}
            </Text>
            {!isLoading && recipientCount > 0 ? (
              <Text muted className="text-xs tabular-nums">
                {recipientCount}
              </Text>
            ) : null}
          </div>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={t("availableUsernames.assign.searchPlaceholder")}
            ariaLabel={t("availableUsernames.assign.searchLabel")}
            className="max-w-full"
          />
        </div>

        <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          ) : recipientCount === 0 ? (
            <div className="px-4 py-8 text-center">
              <Text muted className="text-sm">
                {t("availableUsernames.assign.empty")}
              </Text>
              <Text muted className="mt-1 text-xs">
                {t("availableUsernames.assign.emptyHint")}
              </Text>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {groupedRecipients.map((group) => (
                <section key={group.id}>
                  <div className="sticky top-0 z-10 border-b border-border/70 bg-muted/50 px-4 py-2">
                    <Text className="text-xs font-semibold text-foreground">
                      {t(`availableUsernames.assign.groups.${group.id}`)}
                    </Text>
                  </div>
                  <ul className="divide-y divide-border/70">
                    {group.rows.map((row) => (
                      <RecipientOption
                        key={row.id}
                        row={row}
                        group={group.id}
                        selected={selectedId === row.id}
                        onSelect={() => setSelectedId(row.id)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <SelectionNotes recipient={selected} targetSpeedMbps={speedMbps} />
        ) : null}

        {selected ? (
          <UsernameChangeCauseField
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
      </div>
    </Modal>
  );
}

function recipientBadge(
  row: Customer,
  group: AssignUsernameRecipientGroup,
): { label: string; variant: StatusBadgeVariant } {
  if (group === "customer") {
    return { label: "availableUsernames.assign.badgeCustomer", variant: "muted" };
  }
  if (group === "expiring") {
    const daysLeft = getDaysUntilDisconnect(row);
    if (daysLeft !== null && daysLeft < 0) {
      return { label: "availableUsernames.assign.badgeExpired", variant: "danger" };
    }
    return { label: "availableUsernames.assign.badgeExpiring", variant: "warning" };
  }
  return { label: "availableUsernames.assign.badgeActive", variant: "success" };
}

function RecipientOption({
  row,
  group,
  selected,
  onSelect,
}: {
  row: Customer;
  group: AssignUsernameRecipientGroup;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const badge = recipientBadge(row, group);
  const daysLeft = getDaysUntilDisconnect(row);

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
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">{row.fullName || "—"}</p>
            <StatusBadge label={t(badge.label)} variant={badge.variant} />
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            <span dir="ltr">{row.lineId}</span>
            {isCustomerOnly(row) ? (
              <> · {t("availableUsernames.assign.noCurrentUsername")}</>
            ) : row.username ? (
              <> · {t("availableUsernames.assign.currentUsername", { username: row.username })}</>
            ) : null}
            {group === "expiring" && daysLeft !== null ? (
              <>
                {" · "}
                {daysLeft < 0
                  ? t("availableUsernames.assign.daysExpired")
                  : t("availableUsernames.assign.daysLeftValue", { days: daysLeft })}
              </>
            ) : null}
          </p>
        </div>
      </button>
    </li>
  );
}

function SelectionNotes({
  recipient,
  targetSpeedMbps,
}: {
  recipient: Customer;
  targetSpeedMbps: number;
}) {
  const { t } = useTranslation();
  const notes: string[] = [];

  if (recipient.isSuspended) {
    notes.push(t("availableUsernames.assign.stoppedNote"));
  }
  if (isCustomerOnly(recipient)) {
    notes.push(t("availableUsernames.assign.customerNote"));
  }
  if (
    targetSpeedMbps > 0 &&
    recipient.speedMbps > 0 &&
    recipient.speedMbps !== targetSpeedMbps
  ) {
    notes.push(
      t("availableUsernames.assign.speedChangeWarning", {
        current: buildSpeedLabel(recipient.speedMbps),
        target: buildSpeedLabel(targetSpeedMbps),
      }),
    );
  }

  if (notes.length === 0) return null;

  return (
    <div className="space-y-1 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
      {notes.map((note) => (
        <Text key={note} className="text-xs text-warning">
          {note}
        </Text>
      ))}
    </div>
  );
}
