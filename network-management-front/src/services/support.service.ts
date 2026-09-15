import { apiClient, apiDelete, apiPost, apiPut } from "@/lib/apiClient";
import type { TicketFormValues } from "@/components/pages/support";
import type { SupportTicket, TicketStatus } from "@/types/supportTicket";

interface SupportTicketsResponse {
  status: string;
  data: SupportTicket[];
}

interface SupportTicketResponse {
  status: string;
  data: SupportTicket;
  message?: string;
}

interface DeleteAllResponse {
  status: string;
  message?: string;
  data?: { deleted: number };
}

function toCreateBody(values: TicketFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    priority: values.priority,
    channel: values.channel,
    subscriberName: values.subscriberName.trim(),
    subscriberPhone: values.subscriberPhone.trim(),
    assignedTo: values.assignedTo.trim() || "Unassigned",
  };
}

export const supportService = {
  async list(status?: TicketStatus): Promise<SupportTicket[]> {
    const { data: response } = await apiClient.get<SupportTicketsResponse>("/support/tickets", {
      params: status ? { status } : undefined,
    });
    return response.data ?? [];
  },

  async create(values: TicketFormValues): Promise<SupportTicket> {
    const response = await apiPost<SupportTicketResponse>("/support/tickets", toCreateBody(values));
    if (!response.data) {
      throw new Error("Invalid support ticket response");
    }
    return response.data;
  },

  async update(id: number, values: TicketFormValues): Promise<SupportTicket> {
    const response = await apiPut<SupportTicketResponse>(`/support/tickets/${id}`, toCreateBody(values));
    if (!response.data) {
      throw new Error("Invalid support ticket response");
    }
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await apiDelete(`/support/tickets/${id}`);
  },

  async removeAll(): Promise<{ deleted: number; message: string }> {
    const response = await apiDelete<DeleteAllResponse>("/support/tickets/all");
    const deleted = response.data?.deleted ?? 0;
    return {
      deleted,
      message: response.message ?? `Deleted ${deleted} ticket(s)`,
    };
  },
};
