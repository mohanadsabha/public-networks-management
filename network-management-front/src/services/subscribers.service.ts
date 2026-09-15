import { apiClient, apiDelete, apiGet, apiPatch, apiPost, apiPut, downloadBlobResponse, EXCEL_TIMEOUT_MS } from "@/lib/apiClient";
import {
  mapInvoiceRecord,
  mapPaymentMethodToApi,
  mapSpeedHistory,
  mapSubscriberConnectionResponse,
  mapSubscriberProfileResponse,
  mapSubscriberRecord,
  extractSubscriberListRows,
  mapUsernameHistory,
  type BackendInvoiceRow,
  type BackendSpeedHistoryRow,
  type BackendSubscriberRow,
  type BackendSubscriberProfileResponse,
  type BackendSubscribersListResponse,
  type BackendUsernameHistoryRow,
  type SubscriberConnectionDto,
  type SubscriberProfileDto,
} from "@/lib/mapSubscribers";
import {
  mapSubscriberActivityLog,
  type BackendSubscriberActivityLogRow,
} from "@/lib/mapSubscriberActivityLog";
import { listMockSubscriberActivityLogs } from "@/lib/mocks/subscriberActivityLogs.mock";
import type { Subscriber, SubscriberInvoice, SpeedHistoryEntry, UsernameHistoryEntry } from "@/types/subscriber";
import type {
  SubscriberActivityLogsListParams,
  SubscriberActivityLogsListResult,
} from "@/types/subscriberActivityLog";

const USE_SUBSCRIBER_LOGS_MOCK = import.meta.env.VITE_USE_SUBSCRIBER_LOGS_MOCK === "true";

export interface SubscriberUpdatePayload {
  fullName?: string;
  facilityType?: string | null;
  phone?: string | null;
  password?: string | null;
  monthlyPrice?: number;
  isSuspended?: boolean;
  isPaused?: boolean;
  speedId?: number;
  notes?: string | null;
  routerPort?: string | null;
}

export interface SubscribersListParams {
  suspended?: boolean;
  expired?: boolean;
  /** API filter — omit when using `includePaused`. */
  paused?: boolean;
  /** Main subscribers list: load active + paused rows (API uses separate `paused` queries). */
  includePaused?: boolean;
  search?: string;
  speed?: number;
  page?: number;
  limit?: number;
}

interface ApiListEnvelope<T> {
  status?: string;
  success?: boolean;
  data: T;
}

function mergeSubscriberRows(rows: Subscriber[]): Subscriber[] {
  const byId = new Map<number, Subscriber>();
  for (const row of rows) {
    byId.set(row.id, row);
  }
  return [...byId.values()];
}

async function fetchSubscriberListPage(params: SubscribersListParams & { paused: boolean }): Promise<Subscriber[]> {
  const response = await apiClient.get<BackendSubscribersListResponse>("/subscribers", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 200,
      suspended: params.suspended ?? false,
      expired: params.expired ?? false,
      paused: params.paused,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
      ...(typeof params.speed === "number" && Number.isFinite(params.speed)
        ? { speed: params.speed }
        : {}),
    },
  }).then((r) => r.data);

  const rows = extractSubscriberListRows(response);
  return rows.map(mapSubscriberRecord);
}

export const subscribersService = {
  async list(params: SubscribersListParams = {}): Promise<Subscriber[]> {
    const { includePaused, paused, ...rest } = params;

    if (includePaused) {
      const [activeRows, pausedRows] = await Promise.all([
        fetchSubscriberListPage({ ...rest, paused: false }),
        fetchSubscriberListPage({ ...rest, paused: true }),
      ]);
      return mergeSubscriberRows([...activeRows, ...pausedRows]);
    }

    return fetchSubscriberListPage({ ...rest, paused: paused ?? false });
  },

  async getProfile(id: number): Promise<SubscriberProfileDto> {
    const response = await apiClient.get<BackendSubscriberProfileResponse>(`/subscribers/profile/${id}`);
    return mapSubscriberProfileResponse(response.data);
  },

  /** Load profile by line ID — direct lookup (works for expired / stopped subscribers). */
  async getByLineId(lineId: string): Promise<SubscriberProfileDto> {
    const trimmed = lineId.trim();
    if (!trimmed) throw new Error("Subscriber not found");
    const response = await apiClient.get<BackendSubscriberProfileResponse>(
      `/subscribers/profile/line/${encodeURIComponent(trimmed)}`,
    );
    return mapSubscriberProfileResponse(response.data);
  },

  /** MikroTik session lookup — separate from profile so the page can load instantly. */
  async getConnectionByLineId(lineId: string): Promise<SubscriberConnectionDto> {
    const trimmed = lineId.trim();
    if (!trimmed) {
      return { isOnline: false, connectedTo: null, onlineHost: null };
    }
    const response = await apiClient.get<{ success: boolean; data: SubscriberConnectionDto }>(
      `/subscribers/profile/line/${encodeURIComponent(trimmed)}/connection`,
      { timeout: 10_000 },
    );
    return mapSubscriberConnectionResponse(response.data.data ?? {});
  },

  async update(id: number, body: SubscriberUpdatePayload): Promise<Subscriber> {
    const response = await apiPut<{ success: boolean; data: BackendSubscriberRow }>(`/subscribers/${id}`, {
      fullName: body.fullName,
      facilityType: body.facilityType,
      phone: body.phone,
      password: body.password,
      notes: body.notes,
      isSuspended: body.isSuspended,
      isPaused: body.isPaused,
      routerPort: body.routerPort,
      ...(body.speedId !== undefined ? { speedId: body.speedId } : {}),
      ...(body.monthlyPrice !== undefined ? { monthlyPrice: String(body.monthlyPrice) } : {}),
    });

    if (!response.data) {
      throw new Error("Invalid subscriber update response");
    }
    return mapSubscriberRecord(response.data);
  },

  async remove(id: number): Promise<void> {
    await apiDelete(`/subscribers/${id}`);
  },

  async removeAll(): Promise<void> {
    await apiDelete("/subscribers");
  },

  async assignUsername(
    subscriberId: number,
    availableUsernameId: number,
    changeCause?: string | null,
  ): Promise<Subscriber> {
    const response = await apiPost<ApiListEnvelope<Parameters<typeof mapSubscriberRecord>[0]>>(
      `/subscribers/${subscriberId}/assign-username/${availableUsernameId}`,
      changeCause != null && changeCause !== "" ? { changeCause } : {},
    );
    const row = response.data;
    if (!row) throw new Error("Invalid assign username response");
    return mapSubscriberRecord(row);
  },

  async autoAssignUsernameBySpeed(subscriberId: number, speedId: number): Promise<Subscriber> {
    const response = await apiPatch<ApiListEnvelope<Parameters<typeof mapSubscriberRecord>[0]>>(
      `/subscribers/${subscriberId}/assign-username-speed/${speedId}`,
    );
    const row = response.data;
    if (!row) throw new Error("Invalid auto-assign username response");
    return mapSubscriberRecord(row);
  },

  async renewUsernameBillingCycle(subscriberId: number): Promise<Subscriber> {
    const response = await apiPost<ApiListEnvelope<Parameters<typeof mapSubscriberRecord>[0]>>(
      `/subscribers/${subscriberId}/renew-username-cycle`,
      {},
    );
    const row = response.data;
    if (!row) throw new Error("Invalid renew username cycle response");
    return mapSubscriberRecord(row);
  },

  async getUsernameHistory(subscriberId: number, lineId: string): Promise<UsernameHistoryEntry[]> {
    const response = await apiGet<ApiListEnvelope<BackendUsernameHistoryRow[]>>(
      `/subscribers/${subscriberId}/username-history`,
    );
    return mapUsernameHistory(response.data ?? [], lineId);
  },

  async createUsernameHistoryEntry(
    subscriberId: number,
    lineId: string,
    body: {
      oldUsername: string;
      oldPassword?: string | null;
      usageStartDate?: string | null;
      usageEndDate?: string | null;
    },
  ): Promise<UsernameHistoryEntry> {
    const response = await apiPost<ApiListEnvelope<BackendUsernameHistoryRow>>(
      `/subscribers/${subscriberId}/username-history`,
      {
        oldUsername: body.oldUsername,
        oldPassword: body.oldPassword ?? null,
        usageStartDate: body.usageStartDate || null,
        usageEndDate: body.usageEndDate || null,
      },
    );
    const row = response.data;
    if (!row) throw new Error("Invalid username history response");
    return mapUsernameHistory([row], lineId)[0];
  },

  async updateUsernameHistoryEntry(
    subscriberId: number,
    lineId: string,
    historyId: number,
    body: {
      oldUsername: string;
      oldPassword?: string | null;
      usageStartDate?: string | null;
      usageEndDate?: string | null;
    },
  ): Promise<UsernameHistoryEntry> {
    const response = await apiPut<ApiListEnvelope<BackendUsernameHistoryRow>>(
      `/subscribers/${subscriberId}/username-history/${historyId}`,
      {
        oldUsername: body.oldUsername,
        oldPassword: body.oldPassword ?? null,
        usageStartDate: body.usageStartDate || null,
        usageEndDate: body.usageEndDate || null,
      },
    );
    const row = response.data;
    if (!row) throw new Error("Invalid username history response");
    return mapUsernameHistory([row], lineId)[0];
  },

  async deleteUsernameHistoryEntry(subscriberId: number, historyId: number): Promise<void> {
    await apiDelete(`/subscribers/${subscriberId}/username-history/${historyId}`);
  },

  async getSpeedHistory(subscriberId: number, lineId: string): Promise<SpeedHistoryEntry[]> {
    const response = await apiGet<ApiListEnvelope<BackendSpeedHistoryRow[]>>(
      `/subscribers/${subscriberId}/speed-history`,
    );
    return mapSpeedHistory(response.data ?? [], lineId);
  },

  async getActivityLogs(
    subscriberId: number,
    context: { lineId: string; fullName: string },
    params: SubscriberActivityLogsListParams = {},
  ): Promise<SubscriberActivityLogsListResult> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 15;

    if (USE_SUBSCRIBER_LOGS_MOCK) {
      await new Promise((r) => setTimeout(r, 180));
      return listMockSubscriberActivityLogs(
        {
          subscriberId,
          lineId: context.lineId,
          fullName: context.fullName,
        },
        { page, limit },
      );
    }

    const response = await apiClient
      .get<
        ApiListEnvelope<{
          items?: BackendSubscriberActivityLogRow[];
          total: number;
          page: number;
          limit: number;
        }>
      >(`/subscribers/${subscriberId}/logs`, { params: { page, limit } })
      .then((r) => r.data);

    const payload = response.data;
    const rows = Array.isArray(payload) ? payload : (payload?.items ?? []);

    return {
      items: rows.map(mapSubscriberActivityLog),
      total: Array.isArray(payload) ? rows.length : (payload?.total ?? rows.length),
      page: Array.isArray(payload) ? page : (payload?.page ?? page),
      limit: Array.isArray(payload) ? limit : (payload?.limit ?? limit),
    };
  },

  async listInvoices(subscriberId: number, lineId: string): Promise<SubscriberInvoice[]> {
    const response = await apiGet<ApiListEnvelope<BackendInvoiceRow[]>>(
      `/subscribers/${subscriberId}/invoices`,
    );
    return (response.data ?? [])
      .map((row) => mapInvoiceRecord(row, lineId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createInvoice(
    subscriberId: number,
    lineId: string,
    body: {
      amount: number;
      paidAmount: number;
      paymentMethod: import("@/types/subscriber").PaymentMethod;
      notes?: string;
    },
  ): Promise<SubscriberInvoice> {
    const paymentMethod = body.paymentMethod || "credit";
    const response = await apiPost<ApiListEnvelope<BackendInvoiceRow>>(
      `/subscribers/${subscriberId}/invoices`,
      {
        amount: String(body.amount),
        paidAmount: String(body.paidAmount),
        paymentMethod: mapPaymentMethodToApi(paymentMethod),
        notes: body.notes?.trim() || undefined,
      },
    );
    const row = response.data;
    if (!row) throw new Error("Invalid invoice response");
    return mapInvoiceRecord(row, lineId);
  },

  async deleteInvoice(subscriberId: number, invoiceId: number): Promise<void> {
    await apiDelete(`/subscribers/${subscriberId}/invoices/${invoiceId}`);
  },

  async importExcel(file: File): Promise<{
    imported: number;
    updated: number;
    skipped: number;
    message: string;
  }> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await apiClient.post<{
      status: string;
      message?: string;
      data?: { imported: number; updated: number; skipped?: number };
    }>("/subscribers/import", formData, {
      timeout: EXCEL_TIMEOUT_MS,
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    });

    const imported = response.data.data?.imported ?? 0;
    const updated = response.data.data?.updated ?? 0;
    const skipped = response.data.data?.skipped ?? 0;
    return {
      imported,
      updated,
      skipped,
      message: response.data.message ?? `Imported ${imported}, updated ${updated}`,
    };
  },

  async exportExcel(): Promise<void> {
    const response = await apiClient.get("/subscribers/export", {
      responseType: "blob",
      timeout: EXCEL_TIMEOUT_MS,
    });

    await downloadBlobResponse(
      response,
      `subscribers_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  },

  async exportExpiringExcel(ids: number[]): Promise<void> {
    const response = await apiClient.post(
      "/subscribers/expiring/export",
      { ids },
      {
        responseType: "blob",
        timeout: EXCEL_TIMEOUT_MS,
      },
    );

    await downloadBlobResponse(
      response,
      `expiring_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  },

  async importUsernameHistoryExcel(file: File): Promise<{
    imported: number;
    skipped: number;
    message: string;
  }> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const response = await apiClient.post<{
      status: string;
      message?: string;
      data?: { imported: number; skipped?: number };
    }>("/subscribers/username-history/import", formData, {
      timeout: EXCEL_TIMEOUT_MS,
      transformRequest: [
        (data, headers) => {
          if (data instanceof FormData) {
            delete headers["Content-Type"];
          }
          return data;
        },
      ],
    });

    const imported = response.data.data?.imported ?? 0;
    const skipped = response.data.data?.skipped ?? 0;
    return {
      imported,
      skipped,
      message: response.data.message ?? `Imported ${imported} history row(s)`,
    };
  },

  async exportUsernameHistoryExcel(): Promise<void> {
    const response = await apiClient.get("/subscribers/username-history/export", {
      responseType: "blob",
      timeout: EXCEL_TIMEOUT_MS,
    });

    const disposition = response.headers["content-disposition"] as string | undefined;
    const fileNameMatch = disposition?.match(/filename=([^;]+)/i);
    const fileName =
      fileNameMatch?.[1]?.trim() ?? `username_history_${new Date().toISOString().split("T")[0]}.xlsx`;

    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
