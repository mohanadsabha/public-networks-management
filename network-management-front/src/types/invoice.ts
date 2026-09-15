import type { SubscriberInvoice } from "@/types/subscriber";

export type InvoiceType = "payment" | "charge";

export interface InvoiceListItem extends SubscriberInvoice {
  subscriberId: number;
  subscriberName: string;
  subscriberPhone: string | null;
  subscriberFacilityType: string;
}

export interface InvoicesListResult {
  items: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface InvoiceSummary {
  balance: number;
  totalPaid: number;
  totalCharged: number;
  outstanding: number;
}
