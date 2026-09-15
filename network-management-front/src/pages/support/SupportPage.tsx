import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  SupportChartsSection,
  SupportStatCards,
  SupportTicketsTable,
  TicketFormModal,
  TicketWhatsAppSuccessDialog,
  type TicketFormValues,
} from "@/components/pages/support";
import { ConfirmDialog } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useSupportMutations, useSupportTicketsQuery } from "@/hooks/useSupport";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { computeSupportStats } from "@/lib/supportAnalytics";
import { ApiError } from "@/types/api";
import type { SupportTicket, TicketStatus } from "@/types/supportTicket";
import { cn } from "@/lib/cn";

type TicketDialog =
  | { type: "add" }
  | { type: "edit"; ticket: SupportTicket }
  | { type: "delete"; ticket: SupportTicket }
  | { type: "deleteAll" };

type StatusFilter = TicketStatus | "all";

export function SupportPage() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const { data: tickets = [], isLoading, isError, error, refetch } = useSupportTicketsQuery();
  const { createMutation, updateMutation, deleteMutation, deleteAllMutation } = useSupportMutations();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dialog, setDialog] = useState<TicketDialog | null>(null);
  const [whatsappTicket, setWhatsappTicket] = useState<SupportTicket | null>(null);

  const stats = useMemo(() => computeSupportStats(tickets), [tickets]);

  const filteredTickets = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter((ticket) => ticket.status === statusFilter);
  }, [tickets, statusFilter]);

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    deleteAllMutation.isPending;

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const statusFilters: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: t("common.all") },
    { value: "open", label: t("support.status.open") },
    { value: "in_progress", label: t("support.status.in_progress") },
    { value: "waiting_customer", label: t("support.status.waiting_customer") },
    { value: "resolved", label: t("support.status.resolved") },
  ];

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

  const handleDeleteAll = async () => {
    try {
      const result = await deleteAllMutation.mutateAsync();
      toast.success(t("support.form.deleteAllSuccess", { count: result.deleted }));
      setDialog(null);
      setStatusFilter("all");
    } catch (err) {
      showError(err);
    }
  };

  const deleteTicket = dialog?.type === "delete" ? dialog.ticket : null;

  if (isError) {
    return (
      <div className="space-y-4 text-center">
        <Text muted>
          {error instanceof ApiError ? error.message : t("common.unexpectedError")}
        </Text>
        <Button variant="outline" onClick={() => refetch()}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 lg:flex lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <Heading as="h1">{t("support.title")}</Heading>
          <Text muted className="mt-2">
            {t("support.subtitle")}
          </Text>
        </div>

        {canManage ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              size="sm"
              className="text-danger hover:border-danger/50 hover:bg-danger/5"
              onClick={() => setDialog({ type: "deleteAll" })}
              disabled={isSubmitting || isLoading || tickets.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              {t("support.actions.deleteAll")}
            </Button>
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => setDialog({ type: "add" })}
              disabled={isSubmitting || isLoading}
            >
              <Plus className="h-4 w-4" />
              {t("support.actions.addTicket")}
            </Button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingState layout="support-content" variant="section" />
      ) : (
        <>
      <SupportStatCards stats={stats} />
      <SupportChartsSection tickets={tickets} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading as="h2" className="text-lg">
              {t("support.table.sectionTitle")}
            </Heading>
            <Text muted className="mt-1 text-sm">
              {t("support.table.sectionSubtitle", { count: filteredTickets.length })}
            </Text>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  statusFilter === filter.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <SupportTicketsTable
          rows={filteredTickets}
          onEdit={canManage ? (ticket) => setDialog({ type: "edit", ticket }) : undefined}
          onDelete={canManage ? (ticket) => setDialog({ type: "delete", ticket }) : undefined}
        />
      </section>
        </>
      )}

      <Text muted className="text-sm">
        {t("support.hint")}
      </Text>

      <TicketFormModal
        open={dialog?.type === "add"}
        mode="add"
        onClose={() => setDialog(null)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />

      <TicketFormModal
        open={dialog?.type === "edit"}
        mode="edit"
        initialTicket={dialog?.type === "edit" ? dialog.ticket : undefined}
        onClose={() => setDialog(null)}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title={t("support.form.deleteTitle")}
        message={t("support.form.deleteMessage", { ticket: deleteTicket?.ticketNumber ?? "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
      />

      <TicketWhatsAppSuccessDialog
        ticket={whatsappTicket}
        onClose={() => setWhatsappTicket(null)}
      />

      <ConfirmDialog
        open={dialog?.type === "deleteAll"}
        onClose={() => setDialog(null)}
        onConfirm={handleDeleteAll}
        title={t("support.form.deleteAllTitle")}
        message={t("support.form.deleteAllMessage", { count: tickets.length })}
        confirmLabel={t("support.actions.deleteAll")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
        variant="danger"
      />
    </div>
  );
}
