import { apiClient } from "@/lib/apiClient";
import { ApiError } from "@/types/api";
import type { MikrotikConnectionMethod, MikrotikConnectionStatus } from "@/types/mikrotikConnection";
import type { OnlineUser } from "@/types/onlineUser";

interface MikrotikOnlineUsersResponse {
  status?: "success" | "failed";
  success?: boolean;
  data?: {
    onlineUsers?: OnlineUser[];
    connectedTo?: MikrotikConnectionMethod;
  };
  message?: string;
}

export const mikrotikConnectionService = {
  async getStatus(): Promise<MikrotikConnectionStatus> {
    const { data } = await apiClient.get<MikrotikOnlineUsersResponse>("/mikrotik/online-users", {
      timeout: 30_000,
    });

    if (data.status === "failed" || data.success === false) {
      throw new ApiError(data.message ?? "Failed to reach MikroTik", 500);
    }

    const payload = data.data;
    const connectedTo =
      payload && !Array.isArray(payload) && payload.connectedTo ? payload.connectedTo : null;
    const onlineUsers =
      payload && !Array.isArray(payload) && Array.isArray(payload.onlineUsers)
        ? payload.onlineUsers
        : Array.isArray(payload)
          ? payload
          : [];

    return {
      connected: connectedTo === "API" || connectedTo === "SSH",
      connectedTo,
      onlineCount: onlineUsers.length,
    };
  },
};
