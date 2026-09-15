import { vpnManager } from "../modules/vpn/vpn.manager";

/**
 * MikroTik / online-user checks require the VPN tunnel on the API server.
 * Checks the *runtime* VPN connection state — not the static VPN_ENABLED env var.
 * Returns true only when the tunnel is fully CONNECTED.
 */
export function isMikrotikLive(): boolean {
  return vpnManager.status === "CONNECTED";
}
