import { apiClient, apiDelete, apiPost, apiPut } from "@/lib/apiClient";
import {
  mapSubscriberRecord,
  extractSubscriberListRows,
  type BackendSubscriberRow,
  type BackendSubscribersListResponse,
} from "@/lib/mapSubscribers";
import type { Customer } from "@/types/customer";
import type { CustomerRegistryKindFilter } from "@/lib/customerUtils";

export interface CustomersListParams {
  search?: string;
  kind?: CustomerRegistryKindFilter;
  speed?: number;
  page?: number;
  limit?: number;
}

export const customersService = {
  async list(params: CustomersListParams = {}): Promise<Customer[]> {
    const response = await apiClient.get<BackendSubscribersListResponse>("/customers", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 500,
        kind: params.kind ?? "all",
        ...(params.search?.trim() ? { search: params.search.trim() } : {}),
        ...(typeof params.speed === "number" && Number.isFinite(params.speed)
          ? { speed: params.speed }
          : {}),
      },
    }).then((r) => r.data);

    const rows = extractSubscriberListRows(response);
    return rows.map(mapSubscriberRecord);
  },

  async getByLineId(lineId: string): Promise<Customer> {
    const trimmed = lineId.trim();
    if (!trimmed) throw new Error("Customer not found");
    const rows = await this.list({ search: trimmed, kind: "all", limit: 500 });
    const match = rows.find((row) => row.lineId === trimmed);
    if (!match) throw new Error("Customer not found");
    return match;
  },

  async create(body: {
    fullName: string;
    facilityType: string;
    phone: string;
    lineId: string;
    balance?: number;
    notes?: string | null;
  }): Promise<Customer> {
    const response = await apiPost<{ success: boolean; data: BackendSubscriberRow }>("/customers", body);
    if (!response.data) throw new Error("Invalid create customer response");
    return mapSubscriberRecord(response.data);
  },

  async update(
    id: number,
    body: {
      fullName?: string;
      facilityType?: string | null;
      phone?: string | null;
      lineId?: string;
      notes?: string | null;
    },
  ): Promise<Customer> {
    const response = await apiPut<{ success: boolean; data: BackendSubscriberRow }>(
      `/customers/${id}`,
      body,
    );
    if (!response.data) throw new Error("Invalid update customer response");
    return mapSubscriberRecord(response.data);
  },

  async remove(id: number): Promise<void> {
    await apiDelete(`/customers/${id}`);
  },

  async removeBulk(ids: number[]): Promise<number> {
    const response = await apiPost<{ success: boolean; data: { deleted: number } }>(
      "/customers/bulk-delete",
      { ids },
    );
    return response.data?.deleted ?? 0;
  },

  async removeAll(): Promise<void> {
    await apiDelete("/customers");
  },
};
