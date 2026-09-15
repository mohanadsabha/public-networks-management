import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AdminUserFormModal,
  AdminUsersFilters,
  AdminUsersTable,
} from "@/components/pages/users";
import { Button } from "@/components/ui/buttons";
import { TablePagination } from "@/components/ui/data/TablePagination";
import { LoadingState } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/modals";
import { Heading, Text } from "@/components/ui/typography";
import { useAdminUserMutations, useAdminUsersQuery } from "@/hooks/useAdminUsers";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import type { AdminUser, AdminUserFormValues } from "@/types/adminUser";
import { ApiError } from "@/types/api";

const PAGE_SIZE = 10;
import { isDevAuthMode } from "@/lib/devAuth";

const USE_MOCK =
  import.meta.env.VITE_USE_ADMIN_USERS_API === "false" ||
  (import.meta.env.VITE_USE_ADMIN_USERS_API !== "true" && isDevAuthMode());

type Dialog =
  | { type: "create" }
  | { type: "edit"; row: AdminUser }
  | { type: "delete"; row: AdminUser };

export function AdminUsersPage() {
  const { t } = useTranslation();
  const { canManageUsers } = useRoleAccess();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<Dialog | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useAdminUsersQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const { createMutation, updateMutation, deleteMutation, statusMutation } = useAdminUserMutations();

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const showInitialLoading = isLoading && rows.length === 0;
  const isBackgroundRefresh = isFetching && !showInitialLoading;
  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    statusMutation.isPending;

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const handleSubmit = async (values: AdminUserFormValues) => {
    try {
      if (dialog?.type === "create") {
        await createMutation.mutateAsync(values);
        toast.success(t("users.form.createSuccess"));
      } else if (dialog?.type === "edit") {
        await updateMutation.mutateAsync({ id: dialog.row.id, values });
        toast.success(t("users.form.updateSuccess"));
      }
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async () => {
    if (dialog?.type !== "delete") return;
    try {
      await deleteMutation.mutateAsync(dialog.row.id);
      toast.success(t("users.form.deleteSuccess"));
      setDialog(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleToggleStatus = async (row: AdminUser) => {
    const next = row.status === "active" ? "inactive" : "active";
    try {
      await statusMutation.mutateAsync({ id: row.id, status: next });
      toast.success(t("users.form.statusSuccess"));
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <Heading as="h1">{t("users.title")}</Heading>
          <Text muted className="mt-2 max-w-2xl">
            {t("users.subtitle")}
          </Text>
          {USE_MOCK ? (
            <p className="mt-2 text-xs text-warning">{t("users.mockHint")}</p>
          ) : null}
        </div>

        {canManageUsers ? (
          <Button className="w-full sm:w-auto" size="sm" onClick={() => setDialog({ type: "create" })}>
            <Plus className="h-4 w-4" />
            {t("users.actions.add")}
          </Button>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <AdminUsersFilters search={search} onSearchChange={setSearch} />
        </div>

        <div className="px-4 py-4 sm:px-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Text muted className="text-sm">
              {t("users.table.sectionSubtitle", { count: rows.length })}
            </Text>
            {isBackgroundRefresh ? (
              <Text muted className="text-xs">
                {t("common.loading")}
              </Text>
            ) : null}
          </div>

          {showInitialLoading ? (
            <LoadingState layout="table" variant="section" />
          ) : (
            <>
              <AdminUsersTable
                rows={rows}
                hasSearch={Boolean(debouncedSearch)}
                canManage={canManageUsers}
                onEdit={(row) => setDialog({ type: "edit", row })}
                onDelete={(row) => setDialog({ type: "delete", row })}
                onToggleStatus={handleToggleStatus}
              />
              <TablePagination
                page={page}
                limit={data?.limit ?? PAGE_SIZE}
                total={total}
                onPageChange={setPage}
                disabled={isFetching}
                className="mt-4"
              />
            </>
          )}
        </div>
      </section>

      <AdminUserFormModal
        open={dialog?.type === "create" || dialog?.type === "edit"}
        mode={dialog?.type === "edit" ? "edit" : "create"}
        initial={dialog?.type === "edit" ? dialog.row : undefined}
        onClose={() => setDialog(null)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={dialog?.type === "delete"}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
        title={t("users.form.deleteTitle")}
        message={t("users.form.deleteMessage", {
          username: dialog?.type === "delete" ? dialog.row.username : "",
        })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
