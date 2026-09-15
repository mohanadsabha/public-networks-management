import { useTranslation } from "react-i18next";
import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { cn } from "@/lib/cn";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/invoiceUtils";
import type { PaymentMethod } from "@/types/subscriber";

interface PaymentMethodSelectProps<T extends FieldValues> {
  register: UseFormRegister<T>;
  error?: FieldError;
  required?: boolean;
}

export function PaymentMethodSelect<T extends FieldValues>({
  register,
  error,
  required = true,
}: PaymentMethodSelectProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor="paymentMethod" className="text-sm font-medium text-foreground">
        {t("subscribers.invoices.paymentMethod")}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      <select
        id="paymentMethod"
        className={cn(
          "flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-start",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
          error && "border-danger focus-visible:ring-danger",
        )}
        defaultValue=""
        {...register("paymentMethod" as Path<T>, {
          required: required ? t("subscribers.invoices.paymentMethodRequired") : false,
          validate: (value) =>
            !required || PAYMENT_METHOD_OPTIONS.includes(value as PaymentMethod)
              ? true
              : t("subscribers.invoices.paymentMethodRequired"),
        })}
      >
        <option value="" disabled>
          {t("subscribers.invoices.paymentMethodSelect")}
        </option>
        {PAYMENT_METHOD_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {t(`subscribers.invoices.paymentMethod_${m}`)}
          </option>
        ))}
      </select>
      {error?.message ? <p className="text-xs text-danger">{error.message}</p> : null}
    </div>
  );
}
