import { apiGet, apiPost } from "@/lib/apiClient";
import { mapBackendUserToSession, type BackendAuthUser } from "@/lib/mapAuthSession";
import { isDevAuthMode } from "@/lib/devAuth";
import type { ApiResponse } from "@/types/api";
import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
} from "@/types/auth";

function devDelay<T>(data: T, ms = 600): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms);
  });
}

interface AuthUserResponse {
  success: boolean;
  message?: string;
  user?: BackendAuthUser;
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthSession>> {
    const response = await apiPost<AuthUserResponse>("/auth/login", payload);

    if (!response.success || !response.user) {
      return {
        success: false,
        message: response.message ?? "Login failed",
      };
    }

    return {
      success: true,
      data: mapBackendUserToSession(response.user),
    };
  },

  async logout(): Promise<ApiResponse> {
    try {
      return await apiPost<ApiResponse>("/auth/logout");
    } catch {
      return { success: true };
    }
  },

  async me(): Promise<ApiResponse<AuthSession>> {
    const response = await apiGet<AuthUserResponse>("/auth/me");

    if (!response.success || !response.user) {
      return { success: false };
    }

    return {
      success: true,
      data: mapBackendUserToSession(response.user),
    };
  },

  requestPasswordReset(payload: ForgotPasswordPayload) {
    if (isDevAuthMode()) {
      return devDelay<ApiResponse>({
        success: true,
        message: "dev",
      });
    }

    return apiPost<ApiResponse>("/auth/forgot-password", payload);
  },

  resetPassword(payload: ResetPasswordPayload) {
    if (isDevAuthMode()) {
      return devDelay<ApiResponse>({
        success: true,
        message: "dev",
      });
    }

    return apiPost<ApiResponse>("/auth/reset-password", {
      token: payload.token,
      newPassword: payload.password,
    });
  },
};
