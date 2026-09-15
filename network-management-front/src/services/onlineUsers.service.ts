import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/types/api";
import type { OnlineUser } from "@/types/onlineUser";

interface OnlineUsersResponse {
  status?: "success" | "failed";
  success?: boolean;
  data?: {
    onlineUsers?: OnlineUser[];
  } | OnlineUser[];
  message?: string;
}

export const onlineUsersService = {
  async list(): Promise<OnlineUser[]> {
    const { data } = await apiClient.get<OnlineUsersResponse>("/mikrotik/online-users", {
      timeout: 30_000,
    });

    if (data.status === "failed" || data.success === false) {
      throw new ApiError(data.message ?? "Failed to fetch online users", 500);
    }

    const payload = data.data;
    if (payload && !Array.isArray(payload) && Array.isArray(payload.onlineUsers)) {
      return payload.onlineUsers;
    }
    if (Array.isArray(payload)) {
      return payload;
    }

    return [];
  },
};
