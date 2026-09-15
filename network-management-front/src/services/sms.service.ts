import { apiClient, apiDelete, apiPost, apiPut, SMS_TIMEOUT_MS } from "@/lib/apiClient";
import { mapSmsGroup, mapSmsGroups, type BackendSmsGroup } from "@/lib/mapSmsGroups";
import { smsRecipientsApiAudience } from "@/lib/smsUtils";
import type { SmsAudienceFilter, SmsCustomGroup, SmsLog, SmsRecipient, SmsTemplate } from "@/types/sms";

interface SmsRecipientsResponse {
  success: boolean;
  data: {
    items: SmsRecipient[];
    total: number;
  };
}

export interface SendSmsPayload {
  recipientType: "subscribers" | "custom";
  message: string;
  subscriberIds?: number[];
  phone?: string;
  phones?: string[];
  templateId?: number;
}

export interface SendSmsResult {
  totalRequested: number;
  sentCount: number;
  failedCount: number;
  sent: Array<{ phone: string; providerResponse?: unknown }>;
  failed: Array<{ phone: string; error: string }>;
}

interface SendSmsResponse {
  success: boolean;
  message?: string;
  data: SendSmsResult;
}

interface SmsLogsResponse {
  success: boolean;
  data: {
    items: SmsLog[];
    total: number;
    page: number;
    limit: number;
  };
}

interface SmsTemplatesResponse {
  success: boolean;
  data: {
    items: SmsTemplate[];
  };
}

export const smsService = {
  async listRecipients(audience: SmsAudienceFilter, search?: string): Promise<SmsRecipient[]> {
    const apiAudience = smsRecipientsApiAudience(audience);
    const { data: response } = await apiClient.get<SmsRecipientsResponse>("/sms/recipients", {
      params: {
        audience: apiAudience,
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    });
    return response.data?.items ?? [];
  },

  async listLogs(page = 1, limit = 50): Promise<SmsLogsResponse["data"]> {
    const { data: response } = await apiClient.get<SmsLogsResponse>("/sms/logs", {
      params: { page, limit },
    });
    if (!response.data) throw new Error("Invalid SMS logs response");
    return response.data;
  },

  async listTemplates(): Promise<SmsTemplate[]> {
    const { data: response } = await apiClient.get<SmsTemplatesResponse>("/sms/templates");
    return response.data?.items ?? [];
  },

  async createTemplate(payload: { name: string; body: string }): Promise<SmsTemplate> {
    const response = await apiPost<{ success: boolean; data: SmsTemplate }>("/sms/templates", payload);
    if (!response.data) throw new Error("Invalid template response");
    return response.data;
  },

  async updateTemplate(id: number, payload: { name?: string; body?: string }): Promise<SmsTemplate> {
    const response = await apiPut<{ success: boolean; data: SmsTemplate }>(`/sms/templates/${id}`, payload);
    if (!response.data) throw new Error("Invalid template response");
    return response.data;
  },

  async deleteTemplate(id: number): Promise<void> {
    await apiDelete(`/sms/templates/${id}`);
  },

  async send(payload: SendSmsPayload): Promise<SendSmsResult> {
    const { data: response } = await apiClient.post<SendSmsResponse>("/sms", payload, {
      timeout: SMS_TIMEOUT_MS,
    });
    if (!response.data) throw new Error("Invalid SMS send response");
    return response.data;
  },

  async listGroups(): Promise<SmsCustomGroup[]> {
    const { data: response } = await apiClient.get<{
      success: boolean;
      data: { items: BackendSmsGroup[] };
    }>("/sms/groups");
    return mapSmsGroups(response.data?.items ?? []);
  },

  async createGroup(payload: {
    name: string;
    description?: string | null;
    memberIds: number[];
  }): Promise<SmsCustomGroup> {
    const response = await apiPost<{ success: boolean; data: BackendSmsGroup }>("/sms/groups", payload);
    if (!response.data) throw new Error("Invalid SMS group response");
    return mapSmsGroup(response.data);
  },

  async updateGroup(
    id: number,
    payload: { name: string; description?: string | null; memberIds: number[] },
  ): Promise<SmsCustomGroup> {
    const response = await apiPut<{ success: boolean; data: BackendSmsGroup }>(`/sms/groups/${id}`, payload);
    if (!response.data) throw new Error("Invalid SMS group response");
    return mapSmsGroup(response.data);
  },

  async deleteGroup(id: number): Promise<void> {
    await apiDelete(`/sms/groups/${id}`);
  },
};
