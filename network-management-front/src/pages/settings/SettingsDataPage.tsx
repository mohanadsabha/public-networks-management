import { AlertTriangle, Trash2, UserRound, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { Card } from "@/components/ui/cards";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useCustomerMutations, useCustomersQuery } from "@/hooks/useCustomers";
import { useSubscriberListMutations, useSubscribersQuery } from "@/hooks/useSubscribers";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { isOnSubscribersList } from "@/lib/customerUtils";
import { cn } from "@/lib/cn";
import { ApiError } from "@/types/api";
import type { LucideIcon } from "lucide-react";

type ConfirmTarget = "customers" | "subscribers";

export function SettingsDataPage() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget | null>(null);

  const { data: customerRows = [], isLoading: customersLoading } = useCustomersQuery({ limit: 500 });
  const { data: subscriberRows = [], isLoading: subscribersLoading } = useSubscribersQuery({
    suspended: false,
    expired: false,
    includePaused: true,
  });

  const subscriberCount = useMemo(
    () => subscriberRows.filter((row) => isOnSubscribersList(row)).length,
    [subscriberRows],
  );

  const { deleteAllMutation: deleteAllCustomersMutation } = useCustomerMutations();
  const { deleteAllMutation: deleteAllSubscribersMutation } = useSubscriberListMutations();

  const isDeleting =
    deleteAllCustomersMutation.isPending || deleteAllSubscribersMutation.isPending;

  const showError = (err: unknown) => {
    const message =
      err instanceof ApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : t("common.unexpectedError");
    toast.error(message);
  };

  const handleDeleteCustomers = async () => {
    try {
      await deleteAllCustomersMutation.mutateAsync();
      toast.success(t("customers.form.deleteAllSuccess"));
      setConfirmTarget(null);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteSubscribers = async () => {
    try {
      await deleteAllSubscribersMutation.mutateAsync();
      toast.success(t("subscribers.form.deleteAllSuccess"));
      setConfirmTarget(null);
    } catch (err) {
      showError(err);
    }
  };

  if (!canManage) {
    return <Navigate to="/settings" replace />;
  }

  const isLoading = customersLoading || subscribersLoading;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span>
          {t("settings.data.backToSettings")}
        </Link>
        <Heading as="h1">{t("settings.data.title")}</Heading>
        <Text muted className="mt-2 max-w-2xl">
          {t("settings.data.subtitle")}
        </Text>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0">
          <Text className="text-sm font-medium text-foreground">{t("settings.data.dangerZoneTitle")}</Text>
          <Text muted className="mt-1 text-sm">
            {t("settings.data.dangerZoneHint")}
          </Text>
        </div>
      </div>

      {isLoading ? (
        <LoadingState variant="section" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <DangerDeleteCard
            icon={UserRound}
            title={t("settings.data.customers.title")}
            description={t("settings.data.customers.description")}
            countLabel={t("settings.data.customers.recordCount", { count: customerRows.length })}
            actionLabel={t("customers.actions.deleteAll")}
            disabled={customerRows.length === 0 || isDeleting}
            onDelete={() => setConfirmTarget("customers")}
          />
          <DangerDeleteCard
            icon={Users}
            title={t("settings.data.subscribers.title")}
            description={t("settings.data.subscribers.description")}
            countLabel={t("settings.data.subscribers.recordCount", { count: subscriberCount })}
            actionLabel={t("subscribers.actions.deleteAll")}
            disabled={subscriberCount === 0 || isDeleting}
            onDelete={() => setConfirmTarget("subscribers")}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmTarget === "customers"}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteCustomers}
        title={t("customers.form.deleteAllTitle")}
        message={t("customers.form.deleteAllMessage", { count: customerRows.length })}
        confirmLabel={t("customers.actions.deleteAll")}
        cancelLabel={t("common.cancel")}
        isLoading={deleteAllCustomersMutation.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={confirmTarget === "subscribers"}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDeleteSubscribers}
        title={t("subscribers.form.deleteAllTitle")}
        message={t("subscribers.form.deleteAllMessage", { count: subscriberCount })}
        confirmLabel={t("subscribers.actions.deleteAll")}
        cancelLabel={t("common.cancel")}
        isLoading={deleteAllSubscribersMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

interface DangerDeleteCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  countLabel: string;
  actionLabel: string;
  disabled: boolean;
  onDelete: () => void;
}

function DangerDeleteCard({
  icon: Icon,
  title,
  description,
  countLabel,
  actionLabel,
  disabled,
  onDelete,
}: DangerDeleteCardProps) {
  return (
    <Card className="overflow-hidden border-destructive/25 bg-surface">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{title}</p>
            <Text muted className="mt-1.5 text-sm leading-relaxed">
              {description}
            </Text>
            <p className="mt-3 inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {countLabel}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onDelete}
          className={cn(
            "w-full shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 sm:w-auto",
          )}
        >
          <Trash2 className="h-4 w-4" />
          {actionLabel}
        </Button>
      </div>
    </Card>
  );
}
