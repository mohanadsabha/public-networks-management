import { apiClient, apiDelete, apiPost, UPLOAD_TIMEOUT_MS } from "@/lib/apiClient";
import { mapRouterRecord, type BackendRouterRow } from "@/lib/mapRouters";
import type { RouterCatalogItem } from "@/types/router";

interface RoutersListEnvelope {
  success?: boolean;
  data: {
    data: BackendRouterRow[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface RouterEnvelope {
  success?: boolean;
  data: BackendRouterRow;
  message?: string;
}

function stripMultipartContentType(data: unknown, headers: Record<string, string>) {
  if (data instanceof FormData) {
    delete headers["Content-Type"];
  }
  return data;
}

function buildRouterFormData(name: string, imageFile?: File): FormData {
  const formData = new FormData();
  formData.append("routerName", name);
  if (imageFile) {
    formData.append("routerImage", imageFile, imageFile.name);
  }
  return formData;
}

export const routersService = {
  async list(params?: { page?: number; limit?: number }): Promise<RouterCatalogItem[]> {
    const { data: response } = await apiClient.get<RoutersListEnvelope>("/routers", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 200,
      },
    });
    return (response.data?.data ?? [])
      .map(mapRouterRecord)
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  },

  async create(name: string, imageFile?: File): Promise<RouterCatalogItem> {
    const formData = buildRouterFormData(name, imageFile);
    const { data: response } = await apiClient.post<RouterEnvelope>("/routers", formData, {
      timeout: UPLOAD_TIMEOUT_MS,
      transformRequest: [stripMultipartContentType],
    });
    if (!response?.data) {
      throw new Error("Invalid router create response");
    }
    return mapRouterRecord(response.data);
  },

  async update(id: number, name: string, imageFile?: File): Promise<RouterCatalogItem> {
    const formData = buildRouterFormData(name, imageFile);
    const { data: response } = await apiClient.put<RouterEnvelope>(`/routers/${id}`, formData, {
      timeout: UPLOAD_TIMEOUT_MS,
      transformRequest: [stripMultipartContentType],
    });
    if (!response?.data) {
      throw new Error("Invalid router update response");
    }
    return mapRouterRecord(response.data);
  },

  async remove(id: number): Promise<void> {
    await apiDelete(`/routers/${id}`);
  },

  async assignToSubscriber(
    routerId: number,
    subscriberId: number,
    routerPort?: string | null,
  ): Promise<void> {
    await apiPost(`/routers/${routerId}/assign`, {
      subscriberId,
      routerPort: routerPort ?? null,
    });
  },
};
