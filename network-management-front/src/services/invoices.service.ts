import { apiGet } from "@/lib/apiClient";
import { extractInvoiceUsername } from "@/lib/invoiceUtils";
import { mapInvoiceRecord, type BackendInvoiceRow } from "@/lib/mapSubscribers";
import type { InvoiceListItem, InvoicesListResult } from "@/types/invoice";

interface BackendInvoiceListRow extends BackendInvoiceRow {
  subscriberLineId: string;
  subscriberName: string;
  subscriberPhone: string | null;
  subscriberFacilityType: string | null;
}

interface InvoicesListResponse {
  status?: string;
  data: {
    items: BackendInvoiceListRow[];
    total: number;
    page: number;
    limit: number;
  };
}

function mapInvoiceListItem(row: BackendInvoiceListRow): InvoiceListItem {
  const invoice = mapInvoiceRecord(row, row.subscriberLineId);
  return {
    ...invoice,
    relatedUsername: extractInvoiceUsername(row.notes ?? null),
    subscriberId: row.subscriberId,
    subscriberName: row.subscriberName,
    subscriberPhone: row.subscriberPhone,
    subscriberFacilityType: row.subscriberFacilityType ?? "",
  };
}

export const invoicesService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<InvoicesListResult> {
    const response = await apiGet<InvoicesListResponse>(
      `/invoices?page=${params?.page ?? 1}&limit=${params?.limit ?? 50}${
        params?.search?.trim() ? `&search=${encodeURIComponent(params.search.trim())}` : ""
      }`,
    );
    const payload = response.data;
    return {
      items: (payload?.items ?? []).map(mapInvoiceListItem),
      total: payload?.total ?? 0,
      page: payload?.page ?? 1,
      limit: payload?.limit ?? 50,
    };
  },
};
