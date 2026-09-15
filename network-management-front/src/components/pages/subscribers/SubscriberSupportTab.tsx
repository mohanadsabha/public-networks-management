import { ExternalLink, Headphones, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  SupportTicketsTable,
  TicketFormModal,
  TicketWhatsAppSuccessDialog,
  type TicketFormValues,
} from "@/components/pages/support";
import { ConfirmDialog } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { FilterChipBar } from "@/components/ui/data";
import { LoadingState } from "@/components/ui/feedback";
import { ProfileSection } from "@/components/ui/profile";
import { Text } from "@/components/ui/typography";
import { useSupportMutations, useSupportTicketsQuery } from "@/hooks/useSupport";
import { filterSupportTicketsForSubscriber } from "@/lib/supportSubscriberUtils";
import { ApiError } from "@/types/api";
import type { Subscriber } from "@/types/subscriber";
import type { SupportTicket, TicketStatus } from "@/types/supportTicket";
import { cn } from "@/lib/cn";

type StatusFilter = TicketStatus | "all";
type DialogState =
  | { type: "add" }
  | { type: "edit"; ticket: SupportTicket }
  | { type: "delete"; ticket: SupportTicket };

interface SubscriberSupportTabProps {
  subscriber: Subscriber;
  canManage?: boolean;
}

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "open",
  "in_progress",
  "waiting_customer",
  "resolved",
];

export function SubscriberSupportTab({ subscriber, canManage = false }: SubscriberSupportTabProps) {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [whatsappTicket, setWhatsappTicket] = useState<SupportTicket | null>(null);

  const ticketsQuery = useSupportTicketsQuery();
  const { createMutation, updateMutation, deleteMutation } = useSupportMutations();

  const subscriberTickets = useMemo(
    () => filterSupportTicketsForSubscriber(ticketsQuery.data ?? [], subscriber),
    [ticketsQuery.data, subscriber],
  );

  const filteredTickets = useMemo(() => {
    if (statusFilter === "all") return subscriberTickets;
    return subscriberTickets.filter((ticket) => ticket.status === statusFilter);
  }, [subscriberTickets, statusFilter]);

  const openCount = useMemo(
    () => subscriberTickets.filter((ticket) => ticket.status !== "resolved").length,
    [subscriberTickets],
  );

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const showError = (err: unknown) => {
    toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
  };

  const handleCreate = async (values: TicketFormValues) => {
    try {
      const created = await createMutation.mutateAsync(values);
      setDialog(null);
      setWhatsappTicket(created);
      toast.success(t("support.form.createSuccess"));
    } catch (err) {
      showError(err);
    }
  };

  const handleUpdate = async (values: TicketFormValues) => {
    if (dialog?.type !== "edit") return;
    try {
      await updateMutation.mutateAsync({ id: dialog.ticket.id, values });
      toast.success(t("support.form.updateSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async () => {
    if (dialog?.type !== "delete") return;
    try {
      await deleteMutation.mutateAsync(dialog.ticket.id);
      toast.success(t("support.form.deleteSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="space-y-5">
      <ProfileSection
        title={t("subscribers.profile.support.title")}
        description={t("subscribers.profile.support.subtitle")}
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <SummaryCard label={t("subscribers.profile.support.totalCount")} value={subscriberTickets.length} />
          <SummaryCard
            label={t("subscribers.profile.support.openCount")}
            value={openCount}
            valueClassName={openCount > 0 ? "text-warning" : undefined}
          />
          <SummaryCard
            label={t("subscribers.profile.support.resolvedCount")}
            value={subscriberTickets.filter((ticket) => ticket.status === "resolved").length}
            valueClassName="text-success"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <FilterChipBar
            size="compact"
            wrap
            value={statusFilter}
            onChange={(id) => setStatusFilter(id as StatusFilter)}
            options={STATUS_FILTERS.map((value) => ({
              id: value,
              label: value === "all" ? t("common.all") : t(`support.status.${value}`),
              count:
                value === "all"
                  ? subscriberTickets.length
                  : subscriberTickets.filter((ticket) => ticket.status === value).length,
            }))}
          />

          <div className="flex flex-wrap gap-2">
            <Link to="/support">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
                {t("subscribers.profile.support.viewAll")}
              </Button>
            </Link>
            {canManage ? (
              <Button size="sm" onClick={() => setDialog({ type: "add" })}>
                <Plus className="h-4 w-4" />
                {t("subscribers.profile.support.addTicket")}
              </Button>
            ) : null}
          </div>
        </div>
      </ProfileSection>

      {ticketsQuery.isLoading ? <LoadingState variant="section" /> : null}

      {!ticketsQuery.isLoading && filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
          <Headphones className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} aria-hidden />
          <Text className="mt-3 text-sm font-medium">{t("subscribers.profile.support.empty")}</Text>
          <Text muted className="mt-1 max-w-md text-xs">
            {t("subscribers.profile.support.emptyHint")}
          </Text>
          {canManage ? (
            <Button size="sm" className="mt-4" onClick={() => setDialog({ type: "add" })}>
              <Plus className="h-4 w-4" />
              {t("subscribers.profile.support.addTicket")}
            </Button>
          ) : null}
        </div>
      ) : (
        <SupportTicketsTable
          rows={filteredTickets}
          hideSubscriberColumn
          onEdit={canManage ? (ticket) => setDialog({ type: "edit", ticket }) : undefined}
          onDelete={canManage ? (ticket) => setDialog({ type: "delete", ticket }) : undefined}
        />
      )}

      <TicketFormModal
        open={dialog?.type === "add" || dialog?.type === "edit"}
        mode={dialog?.type === "edit" ? "edit" : "add"}
        initialTicket={dialog?.type === "edit" ? dialog.ticket : undefined}
        prefill={
          dialog?.type === "add"
            ? {
                subscriberName: subscriber.fullName,
                subscriberPhone: subscriber.phone?.trim() ?? "",
              }
            : undefined
        }
        onClose={() => setDialog(null)}
        onSubmit={dialog?.type === "edit" ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title={t("support.form.deleteTitle")}
        message={t("support.form.deleteMessage", {
          ticket: dialog?.type === "delete" ? dialog.ticket.ticketNumber : "",
        })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      <TicketWhatsAppSuccessDialog
        ticket={whatsappTicket}
        onClose={() => setWhatsappTicket(null)}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", valueClassName)} dir="ltr">
        {value}
      </p>
    </div>
  );
}
