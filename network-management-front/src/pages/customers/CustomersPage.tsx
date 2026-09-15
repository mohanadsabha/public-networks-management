import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  CustomerFilters,
  CustomerFormModal,
  CustomersTable,
  type CustomerFormValues,
} from "@/components/pages/customers";
import { ConfirmDialog } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { buttonBaseClassName, buttonSizes, buttonVariants } from "@/components/ui/buttons/buttonStyles";
import { Heading, Text } from "@/components/ui/typography";
import { useCustomerMutations, useCustomersQuery } from "@/hooks/useCustomers";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import type { Customer } from "@/types/customer";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/cn";

type Dialog =
  | { type: "edit"; row: Customer }
  | { type: "delete"; row: Customer }
  | { type: "deleteBulk" };

export function CustomersPage() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dialog, setDialog] = useState<Dialog | null>(null);

  const listParams = useMemo(
    () => ({
      search,
      limit: 500,
    }),
    [search],
  );

  const { data: rows = [], isLoading, isError, error, refetch } = useCustomersQuery(listParams);
  const { updateMutation, deleteMutation, deleteBulkMutation } = useCustomerMutations();

  const isSubmitting =
    updateMutation.isPending || deleteMutation.isPending || deleteBulkMutation.isPending;

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(rows.map((r) => r.id)));
    else setSelectedIds(new Set());
  };

  const handleEdit = async (values: CustomerFormValues) => {
    if (dialog?.type !== "edit") return;
    try {
      await updateMutation.mutateAsync({ id: dialog.row.id, values });
      toast.success(t("customers.form.updateSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async () => {
    if (dialog?.type !== "delete") return;
    try {
      await deleteMutation.mutateAsync(dialog.row.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(dialog.row.id);
        return next;
      });
      toast.success(t("customers.form.deleteSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteBulk = async () => {
    const count = selectedIds.size;
    try {
      await deleteBulkMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      toast.success(t("customers.form.deleteBulkSuccess", { count }));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <Heading as="h1">{t("customers.title")}</Heading>
          <Text muted className="mt-2 max-w-2xl">
            {t("customers.subtitle")}
          </Text>
        </div>

        {canManage ? (
          <Link
            to="/customers/new"
            className={cn(buttonBaseClassName, buttonVariants.primary, buttonSizes.sm, "w-full sm:w-auto")}
          >
            <Plus className="h-4 w-4" />
            {t("customers.actions.add")}
          </Link>
        ) : null}
      </div>

      <section className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border/70 bg-muted/10 px-3 py-2.5 sm:px-4">
          <CustomerFilters search={search} onSearchChange={setSearch} />
        </div>

        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <Text muted className="mb-3 text-sm">
            {t("customers.table.sectionSubtitle", { count: rows.length })}
          </Text>

          {canManage && selectedIds.size > 0 ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <Text className="text-sm">{t("customers.table.selectedCount", { count: selectedIds.size })}</Text>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                  {t("common.cancel")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDialog({ type: "deleteBulk" })}>
                  <Trash2 className="h-4 w-4" />
                  {t("customers.actions.deleteSelected", { count: selectedIds.size })}
                </Button>
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <LoadingState layout="customers-table" variant="section" showCheckboxes={canManage} />
          ) : isError ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
              <Text muted>
                {error instanceof ApiError ? error.message : t("common.unexpectedError")}
              </Text>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                {t("common.retry")}
              </Button>
            </div>
          ) : (
            <CustomersTable
              rows={rows}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              showCheckboxes={canManage}
              onEdit={canManage ? (row) => setDialog({ type: "edit", row }) : undefined}
              onDelete={canManage ? (row) => setDialog({ type: "delete", row }) : undefined}
            />
          )}
        </div>
      </section>

      <CustomerFormModal
        open={dialog?.type === "edit"}
        mode="edit"
        initial={dialog?.type === "edit" ? dialog.row : undefined}
        onClose={() => setDialog(null)}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title={t("customers.form.deleteTitle")}
        message={t("customers.form.deleteMessage", {
          lineId: dialog?.type === "delete" ? dialog.row.lineId : "",
        })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "deleteBulk"}
        onClose={() => setDialog(null)}
        onConfirm={handleDeleteBulk}
        title={t("customers.form.deleteBulkTitle")}
        message={t("customers.form.deleteBulkMessage", { count: selectedIds.size })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isSubmitting}
        variant="danger"
      />

    </div>
  );
}
