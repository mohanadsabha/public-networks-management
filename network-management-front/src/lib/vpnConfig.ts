/**
 * VPN + MikroTik flow — controlled by VITE_VPN_LIVE in .env.
 * When false, no VPN/MikroTik API calls are made from the frontend.
 */
export const VPN_API_LIVE = import.meta.env.VITE_VPN_LIVE === "true";

/** MikroTik-dependent features (online users, live connection status). */
export const MIKROTIK_FEATURES_ENABLED = VPN_API_LIVE;
