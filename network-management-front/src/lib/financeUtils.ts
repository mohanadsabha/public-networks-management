import { getPaymentMethodLabel } from "@/lib/invoiceUtils";
import type { TFunction } from "i18next";

export function formatFinanceMethodLabel(method: string, t: TFunction): string {
  if (method === "unset" || method === "غير محدد") {
    return t("finance.charts.methodUnset");
  }
  if (method === "cash" || method === "transfer" || method === "credit") {
    return getPaymentMethodLabel(method, t);
  }
  if (method === "bank_transfer") {
    return getPaymentMethodLabel("transfer", t);
  }
  return method;
}
