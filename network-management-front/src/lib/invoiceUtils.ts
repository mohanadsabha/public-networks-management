import type { TFunction } from "i18next";
import type { InvoiceStatus, PaymentMethod } from "@/types/subscriber";

export const INVOICE_USERNAME_PREFIX = "@username:";

export function extractInvoiceUsername(notes: string | null): string | null {
  if (!notes?.trim()) return null;
  const match = notes.match(/@username:([^\s\n]+)/);
  return match?.[1]?.trim() || null;
}

export function formatInvoiceUsernameNote(username: string): string {
  return `${INVOICE_USERNAME_PREFIX}${username.trim()}`;
}

export function computeInvoiceStatus(amount: number, paidAmount: number): InvoiceStatus {
  if (amount <= 0 && paidAmount > 0) return "paid";
  if (paidAmount <= 0 && amount > 0) return "debt";
  if (paidAmount <= 0) return "unpaid";
  if (paidAmount >= amount) return "paid";
  return "partial";
}

/** Running balance change per invoice: paid − amount (e.g. 120→50 = −70). */
export function balanceDeltaForInvoice(amount: number, paidAmount: number): number {
  return paidAmount - amount;
}

/** Undo balance change when removing an invoice */
export function balanceDeltaForDeletedInvoice(amount: number, paidAmount: number): number {
  return -balanceDeltaForInvoice(amount, paidAmount);
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = ["cash", "transfer", "credit"];

export function getPaymentMethodLabel(
  method: PaymentMethod | null | undefined,
  t: TFunction,
): string {
  if (!method) return t("subscribers.invoices.paymentMethodUnset");
  return t(`subscribers.invoices.paymentMethod_${method}`);
}
