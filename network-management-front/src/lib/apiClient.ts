import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import i18n from "@/lib/i18n";
import { ApiError } from "@/types/api";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

/** Bulk Excel import/export can run longer than normal CRUD requests. */
export const EXCEL_TIMEOUT_MS = 300_000;

/** Multipart image uploads (e.g. router catalog) include server-side Cloudinary transfer. */
export const UPLOAD_TIMEOUT_MS = 180_000;

/** Profile loads may include MikroTik online lookup when VPN is enabled. */
export const PROFILE_TIMEOUT_MS = 45_000;

/** SMS send waits on TweetSMS (up to 15s per recipient on the server; bulk sends run in parallel). */
export const SMS_TIMEOUT_MS = 120_000;

function parseContentDispositionFileName(disposition: string | undefined, fallback: string): string {
  const fileNameMatch = disposition?.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i);
  return fileNameMatch?.[1]?.trim() ?? fallback;
}

/** Trigger a file download from an axios blob response (Excel exports). */
export async function downloadBlobResponse(
  response: { data: Blob; headers: Record<string, unknown>; status?: number },
  fallbackFileName: string,
): Promise<void> {
  const blob = response.data;
  const contentType = String(response.headers["content-type"] ?? "");

  if (contentType.includes("application/json") || blob.type.includes("json")) {
    const text = await blob.text();
    try {
      const body = JSON.parse(text) as { message?: string };
      throw new ApiError(body.message ?? "Export failed", response.status ?? 400);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(text || "Export failed", response.status ?? 400);
    }
  }

  const fileName = parseContentDispositionFileName(
    response.headers["content-disposition"] as string | undefined,
    fallbackFileName,
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function getApiErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }
  const body = data as Record<string, unknown>;
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  const nested = body.error;
  if (nested && typeof nested === "object" && typeof (nested as { message?: string }).message === "string") {
    return (nested as { message: string }).message;
  }
  return fallback;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? (error.code === "ECONNABORTED" ? 408 : 0);
    const message =
      status === 0
        ? i18n.t("common.networkError")
        : getApiErrorMessage(error.response?.data, error.message || i18n.t("common.unexpectedError"));

    const isAuthMe = error.config?.url?.includes("/auth/me");
    const isAuthLogin = error.config?.url?.includes("/auth/login");
    const inactiveAccount =
      status === 403 &&
      /not active|inactive/i.test(message);

    if ((status === 401 && !isAuthMe) || (inactiveAccount && !isAuthLogin)) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(new ApiError(message, status));
  },
);

export async function apiGet<T>(url: string, config?: InternalAxiosRequestConfig) {
  const { data } = await apiClient.get<T>(url, config);
  return data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: InternalAxiosRequestConfig,
) {
  const { data } = await apiClient.post<T>(url, body, config);
  return data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: InternalAxiosRequestConfig,
) {
  const { data } = await apiClient.put<T>(url, body, config);
  return data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: InternalAxiosRequestConfig,
) {
  const { data } = await apiClient.patch<T>(url, body, config);
  return data;
}

export async function apiDelete<T>(url: string, config?: InternalAxiosRequestConfig) {
  const { data } = await apiClient.delete<T>(url, config);
  return data;
}
