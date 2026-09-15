import { useCallback, useEffect, useState } from "react";
import { VPN_API_LIVE } from "@/lib/vpnConfig";
import { mikrotikConnectionService } from "@/services/mikrotikConnection.service";
import type { MikrotikConnectionMethod } from "@/types/mikrotikConnection";

interface UseMikrotikConnectionOptions {
  /** Only probe MikroTik when the VPN tunnel is up */
  enabled?: boolean;
}

/** MikroTik probe — fetch once when enabled; call `refresh()` manually after that. */
export function useMikrotikConnection(options: UseMikrotikConnectionOptions = {}) {
  const enabled = VPN_API_LIVE && (options.enabled ?? true);

  const [connectedTo, setConnectedTo] = useState<MikrotikConnectionMethod | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reset = useCallback(() => {
    setConnectedTo(null);
    setIsConnected(false);
    setOnlineCount(0);
  }, []);

  const refresh = useCallback(
    async (force = false) => {
      if (!VPN_API_LIVE || (!enabled && !force)) return;

      setIsRefreshing(true);
      try {
        const result = await mikrotikConnectionService.getStatus();
        setConnectedTo(result.connectedTo);
        setIsConnected(result.connected);
        setOnlineCount(result.onlineCount);
      } catch {
        reset();
      } finally {
        setIsRefreshing(false);
      }
    },
    [enabled, reset],
  );

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    void refresh();
  }, [enabled, refresh, reset]);

  return {
    apiLive: VPN_API_LIVE,
    connectedTo,
    isConnected,
    onlineCount,
    isRefreshing,
    refresh,
  };
}
