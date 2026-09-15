import { apiGet, apiPost } from "@/lib/apiClient";
import type { VpnStatus } from "@/types/vpn";

function vpnApiBase(): string {
  const base = import.meta.env.VITE_API_BASE_URL || "/api/v1";
  return base.replace(/\/$/, "");
}

export function vpnStatusStreamUrl(): string {
  return `${vpnApiBase()}/vpn/status`;
}

export type VpnCurrentStatus = {
  vpnStatus: VpnStatus;
  enabled: boolean;
  syncTime: number | null;
};

export const vpnService = {
  async getCurrentStatus(): Promise<VpnCurrentStatus> {
    const response = await apiGet<{
      status: string;
      data: { vpnStatus: VpnStatus; enabled?: boolean; syncTime?: number };
    }>("/vpn/current-status");
    const syncTime =
      response.data.syncTime !== undefined && Number.isFinite(Number(response.data.syncTime))
        ? Number(response.data.syncTime)
        : null;
    return {
      vpnStatus: response.data.vpnStatus,
      enabled: Boolean(response.data.enabled),
      syncTime,
    };
  },

  async enable(): Promise<void> {
    await apiPost("/vpn/enable");
  },

  async disable(): Promise<void> {
    await apiPost("/vpn/disable");
  },
};
