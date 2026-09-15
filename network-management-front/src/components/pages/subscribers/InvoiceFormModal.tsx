import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Input, Textarea } from "@/components/ui/forms";
import { Text } from "@/components/ui/typography";
import { PaymentMethodSelect } from "@/components/pages/subscribers/PaymentMethodSelect";
import { balanceDeltaForInvoice } from "@/lib/invoiceUtils";
import { formatMoneyILS } from "@/lib/formatMoney";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/types/subscriber";

export interface InvoiceFormValues {
  amount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod | "";
  notes: string;
}

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: InvoiceFormValues) => void;
  isSubmitting?: boolean;
  monthlyPrice?: number;
  currentBalance?: number;
}

export function InvoiceFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  monthlyPrice = 0,
  currentBalance = 0,
}: InvoiceFormModalProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    defaultValues: {
      amount: 0,
      paidAmount: 0,
      paymentMethod: "",
      notes: "",
    },
  });

  const amount = useWatch({ control, name: "amount" }) ?? 0;
  const paidAmount = useWatch({ control, name: "paidAmount" }) ?? 0;
  const balanceChange = balanceDeltaForInvoice(Number(amount) || 0, Number(paidAmount) || 0);
  const owesMoney = currentBalance < 0;

  useEffect(() => {
    if (!open) return;
    reset({
      amount: monthlyPrice > 0 ? monthlyPrice : owesMoney ? Math.abs(currentBalance) : 0,
      paidAmount: 0,
      paymentMethod: "",
      notes: "",
    });
  }, [open, monthlyPrice, currentBalance, owesMoney, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const fillMonthlyBill = () => {
    if (monthlyPrice > 0) setValue("amount", monthlyPrice, { shouldValidate: true });
  };

  const fillPayDebt = () => {
    const debt = Math.abs(Math.min(0, currentBalance));
    if (debt > 0) {
      setValue("amount", debt, { shouldValidate: true });
      setValue("paidAmount", debt, { shouldValidate: true });
    }
  };

  const submitInvoice = (values: InvoiceFormValues) => {
    if (values.amount === 0 && values.paidAmount === 0) {
      const message = t("subscribers.invoices.amountOrPaidRequired");
      setError("amount", { message });
      setError("paidAmount", { message });
      return;
    }
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("subscribers.invoices.addTitle")}
      className="sm:max-w-lg"
    >
      <form onSubmit={handleSubmit(submitInvoice)} className="space-y-4">
        <Text muted className="text-sm">{t("subscribers.invoices.twoAmountHint")}</Text>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("subscribers.invoices.amountToPay")}
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            error={errors.amount?.message}
            {...register("amount", {
              valueAsNumber: true,
              min: { value: 0, message: t("subscribers.invoices.amountMin") },
              validate: (value) =>
                Number.isFinite(value) && value >= 0
                  ? true
                  : t("subscribers.invoices.amountMin"),
            })}
          />
          <Input
            label={t("subscribers.invoices.amountPaid")}
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            error={errors.paidAmount?.message}
            {...register("paidAmount", {
              valueAsNumber: true,
              min: { value: 0, message: t("subscribers.invoices.amountMin") },
              validate: (value) =>
                Number.isFinite(value) && value >= 0
                  ? true
                  : t("subscribers.invoices.amountMin"),
            })}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {monthlyPrice > 0 ? (
            <button
              type="button"
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={fillMonthlyBill}
            >
              {t("subscribers.invoices.quickMonthly", { amount: monthlyPrice })}
            </button>
          ) : null}
          {owesMoney ? (
            <button
              type="button"
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={fillPayDebt}
            >
              {t("subscribers.invoices.quickFullDebt", { amount: Math.abs(currentBalance) })}
            </button>
          ) : null}
        </div>

        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            balanceChange < 0 ? "border-danger/40 bg-danger/10" : "border-success/40 bg-success/10",
          )}
        >
          <Text className="font-medium">{t("subscribers.invoices.balanceChange")}</Text>
          <p
            className={cn(
              "mt-1 text-lg font-bold tabular-nums",
              balanceChange < 0 ? "text-danger" : balanceChange > 0 ? "text-success" : "text-foreground",
            )}
            dir="ltr"
          >
            {formatMoneyILS(balanceChange)}
          </p>
          <Text muted className="mt-1 text-xs">{t("subscribers.invoices.balanceChangeHint")}</Text>
        </div>

        <PaymentMethodSelect register={register} error={errors.paymentMethod} required />

        <Textarea
          label={t("subscribers.form.notes")}
          rows={3}
          placeholder={t("subscribers.invoices.notesPlaceholder")}
          error={errors.notes?.message}
          {...register("notes", {
            required: t("subscribers.invoices.notesRequired"),
            validate: (value) => (value?.trim() ? true : t("subscribers.invoices.notesRequired")),
          })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <ModalFooterButton variant="outline" type="button" onClick={handleClose}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton type="submit" isLoading={isSubmitting}>
            {t("subscribers.invoices.add")}
          </ModalFooterButton>
        </div>
      </form>
    </Modal>
  );
}
