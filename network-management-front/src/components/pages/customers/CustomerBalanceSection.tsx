import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { PaymentMethodSelect } from "@/components/pages/subscribers/PaymentMethodSelect";
import { SubscriberInvoicesTab } from "@/components/pages/subscribers/SubscriberInvoicesTab";
import { Heading, Text } from "@/components/ui/typography";
import { summarizeInvoices } from "@/lib/localInvoices";
import type { Customer } from "@/types/customer";
import type { PaymentMethod, SubscriberInvoice } from "@/types/subscriber";

interface PaymentFormValues {
  amount: number;
  paymentMethod: PaymentMethod | "";
  notes: string;
}

interface CustomerBalanceSectionProps {
  customer: Customer;
  invoices: SubscriberInvoice[];
  canManage?: boolean;
  showRecordPayment?: boolean;
  onRecordPayment: (amount: number, paymentMethod: PaymentMethod, notes?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function CustomerBalanceSection({
  customer,
  invoices,
  canManage = false,
  showRecordPayment = true,
  onRecordPayment,
  isSubmitting = false,
}: CustomerBalanceSectionProps) {
  const { t } = useTranslation();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const summary = useMemo(() => {
    const computed = summarizeInvoices(invoices);
    return {
      ...computed,
      balance: customer.balance,
    };
  }, [invoices, customer.balance]);
  const owesMoney = customer.balance < 0;
  const canRecordPayment = canManage && showRecordPayment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    defaultValues: {
      amount: 0,
      paymentMethod: "",
      notes: "",
    },
  });

  const openPaymentModal = () => {
    reset({
      amount: owesMoney ? Math.abs(customer.balance) : 0,
      paymentMethod: "",
      notes: "",
    });
    setPaymentOpen(true);
  };

  const submitPayment = async (values: PaymentFormValues) => {
    const paid = Number(values.amount) || 0;
    if (!values.paymentMethod) return;
    await onRecordPayment(paid, values.paymentMethod as PaymentMethod, values.notes);
    reset();
    setPaymentOpen(false);
  };

  return (
    <section className="space-y-4">
      <div>
        <Heading as="h2" className="text-base font-semibold">
          {t("customers.balance.sectionTitle")}
        </Heading>
        <Text muted className="mt-1 text-sm">
          {canRecordPayment
            ? t("customers.balance.sectionHint")
            : t("customers.balance.sectionHintReadOnly")}
        </Text>
      </div>

      <SubscriberInvoicesTab
        invoices={invoices}
        summary={summary}
        monthlyPrice={customer.monthlyPrice}
        subscriber={{
          lineId: customer.lineId,
          fullName: customer.fullName,
          phone: customer.phone,
          facilityType: "",
          username: customer.username,
        }}
        canManage={false}
      />

      {canRecordPayment ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={openPaymentModal}>
              <Plus className="h-4 w-4" />
              {t("customers.balance.recordPayment")}
            </Button>
          </div>
          {owesMoney ? (
            <Text muted className="text-xs">{t("customers.balance.stillOwes")}</Text>
          ) : null}
        </>
      ) : null}

      <Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title={t("customers.balance.paymentTitle")}>
        <form onSubmit={handleSubmit(submitPayment)} className="space-y-4">
          <Text muted className="text-sm">{t("customers.balance.paymentHint")}</Text>
          <Input
            label={t("customers.balance.amount")}
            type="number"
            step="0.01"
            dir="ltr"
            error={errors.amount?.message}
            {...register("amount", {
              required: t("customers.balance.amountRequired"),
              valueAsNumber: true,
              validate: (value) =>
                Number.isFinite(value) && value !== 0
                  ? true
                  : t("customers.balance.amountRequired"),
            })}
          />
          <PaymentMethodSelect register={register} error={errors.paymentMethod} />
          <Input label={t("customers.form.notes")} {...register("notes")} />
          <div className="flex justify-end gap-2">
            <ModalFooterButton variant="outline" type="button" onClick={() => setPaymentOpen(false)}>
              {t("common.cancel")}
            </ModalFooterButton>
            <ModalFooterButton type="submit" isLoading={isSubmitting}>
              {t("customers.balance.confirmPayment")}
            </ModalFooterButton>
          </div>
        </form>
      </Modal>
    </section>
  );
}
