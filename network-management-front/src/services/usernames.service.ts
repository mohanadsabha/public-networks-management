import { apiClient, apiDelete, apiPost, apiPut, EXCEL_TIMEOUT_MS } from "@/lib/apiClient";
import {
  formValuesToCreateBody,
  formValuesToUpdateBody,
  mapBackendUsername,
  toApiStartDate,
  type BackendUsernameRecord,
  type UpdateUsernameApiBody,
} from "@/lib/mapAvailableUsernames";
import { normalizeAssignedAtInput } from "@/types/availableUsername";
import type { AvailableUsernameFormValues } from "@/components/pages/available-usernames";
import type { AvailableUsername } from "@/types/availableUsername";

const LIST_LIMIT = 10_000;

interface UsernamesListPayload {
  data: BackendUsernameRecord[];
  total: number;
  page: number;
  limit: number;
}

interface UsernamesListResponse {
  success?: boolean;
  status?: string;
  data: UsernamesListPayload;
}

interface UsernameMutationResponse {
  status: string;
  data: BackendUsernameRecord | BackendUsernameRecord[];
}

function extractUsernameRecord(
  data: BackendUsernameRecord | BackendUsernameRecord[],
): AvailableUsername {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    throw new Error("Invalid username response");
  }
  return mapBackendUsername(row);
}

function usernamesPath(speedId: number, suffix = ""): string {
  return `/speeds/${speedId}/usernames${suffix}`;
}

export const usernamesService = {
  async list(speedId: number): Promise<AvailableUsername[]> {
    const { data: response } = await apiClient.get<UsernamesListResponse>(usernamesPath(speedId), {
      params: { page: 1, limit: LIST_LIMIT },
    });

    const rows = response.data?.data ?? [];
    return rows.map(mapBackendUsername);
  },

  async create(speedId: number, values: AvailableUsernameFormValues): Promise<AvailableUsername> {
    const body = formValuesToCreateBody(values);
    const response = await apiPost<UsernameMutationResponse>(usernamesPath(speedId), body);
    return extractUsernameRecord(response.data);
  },

  async update(
    speedId: number,
    id: number,
    values: AvailableUsernameFormValues,
  ): Promise<AvailableUsername> {
    const body = formValuesToUpdateBody(values);
    const response = await apiPut<UsernameMutationResponse>(usernamesPath(speedId, `/${id}`), body);
    return extractUsernameRecord(response.data);
  },

  async updateStartDate(speedId: number, id: number, dateValue: string): Promise<AvailableUsername> {
    const body: UpdateUsernameApiBody = {
      isUsed: true,
      startDate: toApiStartDate(normalizeAssignedAtInput(dateValue)),
    };
    const response = await apiPut<UsernameMutationResponse>(usernamesPath(speedId, `/${id}`), body);
    return extractUsernameRecord(response.data);
  },

  async remove(speedId: number, id: number): Promise<void> {
    await apiDelete(usernamesPath(speedId, `/${id}`));
  },

  async removeAllForSpeed(speedId: number): Promise<{ deleted: number; message: string }> {
    const response = await apiDelete<{
      status: string;
      message?: string;
      data?: { deleted: number };
    }>(usernamesPath(speedId, "/all"));

    const deleted = response.data?.deleted ?? 0;
    return {
      deleted,
      message: response.message ?? `Deleted ${deleted} username(s)`,
    };
  },

  async resetBillingCycle(speedId: number, usernameId: number): Promise<AvailableUsername> {
    const response = await apiPost<UsernameMutationResponse>(
      usernamesPath(speedId, `/${usernameId}/reset-cycle`),
      {},
    );
    return extractUsernameRecord(response.data);
  },

  async importExcel(
    speedId: number,
    file: File,
  ): Promise<{ imported: number; skipped: number; message: string }> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    // Do not set Content-Type manually — axios must add multipart boundary (Postman does this automatically).
    const response = await apiClient.post<{
      status: string;
      message?: string;
      data?: { imported: number; skipped?: number };
    }>(usernamesPath(speedId, "/import"), formData, {
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
      message: response.data.message ?? `Imported ${imported} usernames`,
    };
  },

  async exportExcel(speedId: number): Promise<void> {
    const response = await apiClient.get(usernamesPath(speedId, "/export"), {
      responseType: "blob",
      timeout: EXCEL_TIMEOUT_MS,
    });

    const disposition = response.headers["content-disposition"] as string | undefined;
    const fileNameMatch = disposition?.match(/filename=([^;]+)/i);
    const fileName = fileNameMatch?.[1]?.trim() ?? `available_usernames_${speedId}.xlsx`;

    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
