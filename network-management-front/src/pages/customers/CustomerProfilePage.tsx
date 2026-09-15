import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AssignUsernameModal,
  CustomerAssignUsernameSection,
  CustomerBalanceSection,
  CustomerProfileForm,
  CustomerProfileHeader,
  type CustomerProfileFormValues,
} from "@/components/pages/customers";
import type { PickedUsername } from "@/components/pages/subscribers/PickAvailableUsernameModal";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { ProfileSection } from "@/components/ui/profile";
import { Text } from "@/components/ui/typography";
import { useCustomerByLineIdQuery, useCustomerMutations } from "@/hooks/useCustomers";
import {
  useSubscriberInvoiceMutations,
  useSubscriberInvoicesQuery,
  useSubscriberProfileMutations,
  useSubscriberSpeedHistoryQuery,
} from "@/hooks/useSubscribers";
import { useSpeedsQuery } from "@/hooks/useSpeeds";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { customerOwesMoney, isOnSubscribersList } from "@/lib/customerUtils";
import { isOnExpiringPage } from "@/lib/expiringUtils";
import { customerProfilePath, subscriberProfilePath } from "@/lib/routePaths";
import { isStoppedSubscriber } from "@/lib/subscriberUtils";
import { ApiError } from "@/types/api";
import type { PaymentMethod } from "@/types/subscriber";

export function CustomerProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canManage } = useRoleAccess();
  const { lineId } = useParams<{ lineId: string }>();
  const decodedLineId = lineId ? decodeURIComponent(lineId) : "";

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSpeedId, setAssignSpeedId] = useState<number | null>(null);

  const {
    data: customer,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomerByLineIdQuery(decodedLineId, Boolean(decodedLineId));

  const { updateMutation } = useCustomerMutations();
  const { assignUsernameMutation } = useSubscriberProfileMutations(customer?.id ?? 0);
  const invoicesQuery = useSubscriberInvoicesQuery(customer?.id ?? 0, customer?.lineId ?? "");
  const { createMutation: createInvoiceMutation } = useSubscriberInvoiceMutations(
    customer?.id ?? 0,
    customer?.lineId ?? "",
  );

  const { data: speedTiers = [] } = useSpeedsQuery();
  const speedHistoryQuery = useSubscriberSpeedHistoryQuery(customer?.id ?? 0, customer?.lineId ?? "");

  const poolSpeedMbps = useMemo(() => {
    if (!customer) return null;
    if (customer.speedMbps) return customer.speedMbps;
    const fromHistory = speedHistoryQuery.data?.[0]?.newSpeedMbps;
    return fromHistory && fromHistory > 0 ? fromHistory : null;
  }, [customer, speedHistoryQuery.data]);

  const defaultAssignSpeedId = useMemo(() => {
    if (!customer) return null;
    if (customer.speedId) return customer.speedId;
    if (poolSpeedMbps) {
      return speedTiers.find((tier) => tier.valueMbps === poolSpeedMbps)?.id ?? null;
    }
    return speedTiers[0]?.id ?? null;
  }, [customer, poolSpeedMbps, speedTiers]);

  useEffect(() => {
    setAssignSpeedId(defaultAssignSpeedId);
  }, [customer?.id, defaultAssignSpeedId]);

  const selectedAssignTier = speedTiers.find((tier) => tier.id === assignSpeedId) ?? null;

  if (isLoading) {
    return <LoadingState layout="profile" variant="page" />;
  }

  if (isError || !customer) {
    return (
      <div className="space-y-4 rounded-xl border border-border p-6 text-center">
        <Text muted>
          {error instanceof ApiError ? error.message : t("customers.profile.notFound")}
        </Text>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t("common.retry")}
          </Button>
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              {t("customers.profile.backToList")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stopped = isStoppedSubscriber(customer);
  const hasUsername = Boolean(customer.username);
  const expiring = hasUsername && isOnExpiringPage(customer);
  const onSubscribersList = hasUsername && isOnSubscribersList(customer);
  const owesMoney = customerOwesMoney(customer);
  const debtCleared = !owesMoney;
  const canAssignAfterStop = stopped && debtCleared && canManage;
  const showAssignSection = canAssignAfterStop || (!stopped && !hasUsername && canManage);

  const showError = (err: unknown) => {
    toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
  };

  const handleSave = async (values: CustomerProfileFormValues) => {
    try {
      const updated = await updateMutation.mutateAsync({
        id: customer.id,
        values: {
          fullName: values.fullName,
          facilityType: values.facilityType,
          phone: values.phone,
          packageLine: values.packageLine,
          notes: values.notes,
        },
      });
      toast.success(t("customers.form.updateSuccess"));
      if (updated.lineId !== customer.lineId) {
        navigate(customerProfilePath(updated.lineId), { replace: true });
      } else {
        refetch();
      }
    } catch (err) {
      showError(err);
    }
  };

  const handleAssign = async (picked: PickedUsername) => {
    const wasStopped = stopped;
    try {
      await assignUsernameMutation.mutateAsync({
        availableUsernameId: picked.id,
        changeCause: picked.changeCause,
      });
      toast.success(
        wasStopped
          ? t("customers.profile.restoreSubscriberSuccess")
          : t("customers.profile.assignSuccess"),
      );
      setAssignOpen(false);
      await refetch();
      if (wasStopped) {
        navigate(subscriberProfilePath(customer.lineId, "stats"));
      }
    } catch (err) {
      showError(err);
    }
  };

  const handleRecordPayment = async (amount: number, paymentMethod: PaymentMethod, notes?: string) => {
    if (!customer?.lineId) return;
    const trimmedNotes = notes?.trim() || t("customers.balance.recordPayment");
    try {
      await createInvoiceMutation.mutateAsync({
        amount: 0,
        paidAmount: amount,
        paymentMethod,
        notes: trimmedNotes,
      });
      toast.success(t("subscribers.invoices.createSuccess"));
      await refetch();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div className="space-y-6">
      <CustomerProfileHeader
        customer={customer}
        poolSpeedMbps={poolSpeedMbps}
        expiring={expiring}
        onSubscribersList={onSubscribersList}
        stoppedWithNoDebt={stopped && debtCleared}
      />

      {stopped ? (
        <ProfileSection title={t("customers.profile.afterStoppedTitle")}>
          <Text className="text-sm">{t("customers.profile.stoppedHint")}</Text>
          <Text muted className="mt-2 text-sm">
            {t("customers.balance.editProfileHint")}
          </Text>
          <Link
            to="/stopped"
            className="mt-3 inline-block text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            {t("nav.items.canceled")}
          </Link>
        </ProfileSection>
      ) : null}

      <CustomerBalanceSection
        customer={customer}
        invoices={invoicesQuery.data ?? []}
        canManage={canManage}
        showRecordPayment={canManage}
        onRecordPayment={handleRecordPayment}
        isSubmitting={createInvoiceMutation.isPending}
      />

      <CustomerProfileForm
        customer={customer}
        canManage={canManage}
        onSave={handleSave}
        isSubmitting={updateMutation.isPending}
      />

      {showAssignSection ? (
        <CustomerAssignUsernameSection
          speedTiers={speedTiers}
          selectedSpeedId={assignSpeedId}
          onSpeedSelect={(tier) => setAssignSpeedId(tier.id)}
          onAssignClick={() => setAssignOpen(true)}
          extraHint={canAssignAfterStop ? t("customers.balance.paidOff") : undefined}
        />
      ) : null}

      <AssignUsernameModal
        open={assignOpen}
        customer={customer}
        speedId={selectedAssignTier?.id ?? null}
        speedMbps={selectedAssignTier?.valueMbps ?? 0}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
        isSubmitting={assignUsernameMutation.isPending}
      />
    </div>
  );
}
