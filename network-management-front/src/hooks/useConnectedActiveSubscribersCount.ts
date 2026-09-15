import { useMemo } from "react";
import { useOnlineUsersQuery } from "@/hooks/useOnlineUsers";
import { MIKROTIK_FEATURES_ENABLED } from "@/lib/vpnConfig";

/** Live PPP session count — fetched once per page visit; use `refetch` to refresh manually. */
export function useConnectedActiveSubscribersCount() {
  const { data: onlineUsers = [], refetch, isFetching } = useOnlineUsersQuery({
    enabled: MIKROTIK_FEATURES_ENABLED,
    refetchIntervalMs: false,
  });

  return useMemo(() => {
    if (!MIKROTIK_FEATURES_ENABLED) {
      return { statisticsActive: null, refetch, isFetching: false };
    }
    return { statisticsActive: onlineUsers.length, refetch, isFetching };
  }, [onlineUsers, refetch, isFetching]);
}
