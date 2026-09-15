import {
  balanceDeltaForInvoice,
  computeInvoiceStatus,
  extractInvoiceUsername,
} from "@/lib/invoiceUtils";
import type { InvoiceSummary } from "@/types/invoice";
import type { SubscriberInvoice } from "@/types/subscriber";

const STORAGE_KEY = "wepaltel-local-invoices-v2";

interface SubscriberInvoiceStore {
  invoices: SubscriberInvoice[];
  nextId: number;
}

type InvoiceStoreMap = Record<string, SubscriberInvoiceStore>;

function readStore(): InvoiceStoreMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as InvoiceStoreMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: InvoiceStoreMap): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function normalizeInvoice(invoice: SubscriberInvoice): SubscriberInvoice {
  const amount = Math.max(0, Number(invoice.amount) || 0);
  const paidAmount = Math.max(0, Number(invoice.paidAmount) || 0);

  return {
    ...invoice,
    amount,
    paidAmount,
    status: computeInvoiceStatus(amount, paidAmount),
    relatedUsername: invoice.relatedUsername ?? extractInvoiceUsername(invoice.notes),
  };
}

function seedStore(_lineId: string): SubscriberInvoiceStore {
  return {
    invoices: [],
    nextId: 1,
  };
}

export function getLocalInvoicesForSubscriber(lineId: string): SubscriberInvoice[] {
  const store = readStore();
  const entry = store[lineId] ?? seedStore(lineId);
  if (!store[lineId]) {
    store[lineId] = entry;
    writeStore(store);
  }
  return [...entry.invoices].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function invoiceBalanceDelta(invoice: SubscriberInvoice): number {
  return balanceDeltaForInvoice(invoice.amount, invoice.paidAmount);
}

export function summarizeInvoices(invoices: SubscriberInvoice[]): InvoiceSummary {
  let totalPaid = 0;
  let totalBilled = 0;

  for (const row of invoices) {
    totalPaid += row.paidAmount;
    totalBilled += row.amount;
  }

  const balance = invoices.reduce((sum, row) => sum + invoiceBalanceDelta(row), 0);
  const outstanding = Math.max(0, -balance);

  return {
    balance,
    totalPaid,
    totalCharged: totalBilled,
    outstanding,
  };
}

export interface CreateLocalInvoiceInput {
  lineId: string;
  amount: number;
  paidAmount: number;
  paymentMethod?: SubscriberInvoice["paymentMethod"];
  notes: string;
  relatedUsername?: string | null;
}

export function createLocalInvoice(input: CreateLocalInvoiceInput): SubscriberInvoice {
  const store = readStore();
  const entry = store[input.lineId] ?? seedStore(input.lineId);
  const now = new Date().toISOString();
  const amount = Math.max(0, input.amount);
  const paidAmount = Math.max(0, input.paidAmount);

  const invoice: SubscriberInvoice = normalizeInvoice({
    id: entry.nextId,
    subscriberLineId: input.lineId,
    amount,
    paidAmount,
    status: computeInvoiceStatus(amount, paidAmount),
    paymentMethod: input.paymentMethod ?? null,
    notes: input.notes.trim(),
    description: null,
    relatedUsername: input.relatedUsername?.trim() || null,
    createdAt: now,
    paidAt: paidAmount > 0 ? now : null,
  });

  entry.invoices = [invoice, ...entry.invoices];
  entry.nextId += 1;
  store[input.lineId] = entry;
  writeStore(store);
  return invoice;
}

export function deleteLocalInvoice(lineId: string, invoiceId: number): void {
  const store = readStore();
  const entry = store[lineId];
  if (!entry) return;
  entry.invoices = entry.invoices.filter((row) => row.id !== invoiceId);
  store[lineId] = entry;
  writeStore(store);
}

export function listAllLocalInvoices(): SubscriberInvoice[] {
  const store = readStore();
  const lineIds = Object.keys(store);
  const all = lineIds.flatMap((lineId) =>
    (store[lineId]?.invoices ?? []).map(normalizeInvoice),
  );
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Cumulative balance after each invoice (oldest → newest). */
export function runningBalancesChronological(invoices: SubscriberInvoice[]): Map<number, number> {
  const sorted = [...invoices].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const map = new Map<number, number>();
  let running = 0;
  for (const row of sorted) {
    running += invoiceBalanceDelta(row);
    map.set(row.id, running);
  }
  return map;
}
