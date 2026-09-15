import { useCallback } from "react";
import { useMikrotikConnection } from "@/hooks/useMikrotikConnection";
import { useVpnStatus } from "@/hooks/useVpnStatus";

export function useConnectionFlow() {
  const vpn = useVpnStatus();
  const mikrotik = useMikrotikConnection({
    enabled: vpn.apiLive && vpn.hasInitialStatus && vpn.enabled && vpn.status === "CONNECTED",
  });

  const refreshAll = useCallback(async () => {
    if (!vpn.enabled) return vpn.status;
    const nextVpnStatus = await vpn.refresh();
    if (nextVpnStatus === "CONNECTED") {
      await mikrotik.refresh(true);
    }
    return nextVpnStatus;
  }, [vpn.enabled, vpn.refresh, vpn.status, mikrotik.refresh]);

  const vpnActive = vpn.apiLive && vpn.enabled && vpn.status === "CONNECTED";
  const pathActive = vpnActive && mikrotik.isConnected;

  return {
    vpn,
    mikrotik,
    refreshAll,
    vpnActive,
    pathActive,
    preview: !vpn.apiLive,
  };
}
