import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  createLocalInvoice,
  deleteLocalInvoice,
  getLocalInvoicesForSubscriber,
  summarizeInvoices,
  type CreateLocalInvoiceInput,
} from "@/lib/localInvoices";
import type { InvoiceSummary } from "@/types/invoice";

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function useLocalSubscriberInvoices(lineId: string) {
  const version = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem("wepaltel-local-invoices-v2") ?? "",
    () => "",
  );

  const invoices = useMemo(
    () => (lineId ? getLocalInvoicesForSubscriber(lineId) : []),
    [lineId, version],
  );

  const summary: InvoiceSummary = useMemo(() => summarizeInvoices(invoices), [invoices]);

  const addInvoice = useCallback(
    (input: Omit<CreateLocalInvoiceInput, "lineId">) => {
      if (!lineId) return null;
      const created = createLocalInvoice({ ...input, lineId });
      notify();
      return created;
    },
    [lineId],
  );

  const removeInvoice = useCallback(
    (invoiceId: number) => {
      if (!lineId) return;
      deleteLocalInvoice(lineId, invoiceId);
      notify();
    },
    [lineId],
  );

  return {
    invoices,
    summary,
    addInvoice,
    removeInvoice,
    isLocalPreview: true as const,
  };
}
