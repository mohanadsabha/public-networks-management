import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MIKROTIK_FEATURES_ENABLED } from "@/lib/vpnConfig";
import { onlineUsersService } from "@/services/onlineUsers.service";

export const onlineUsersQueryKey = ["online-users"] as const;

export function useOnlineUsersQuery(options?: {
  enabled?: boolean;
  /** Polling interval in ms. Omit or pass `false` for fetch-once until manual refetch. */
  refetchIntervalMs?: number | false;
}) {
  const enabled = MIKROTIK_FEATURES_ENABLED && (options?.enabled ?? true);
  const refreshMs = options?.refetchIntervalMs ?? false;
  const polling = typeof refreshMs === "number" && refreshMs > 0;

  return useQuery({
    queryKey: onlineUsersQueryKey,
    queryFn: () => onlineUsersService.list(),
    enabled,
    refetchInterval: enabled && polling ? refreshMs : false,
    refetchIntervalInBackground: false,
    refetchOnMount: polling,
    refetchOnWindowFocus: polling,
    refetchOnReconnect: polling,
    staleTime: polling ? refreshMs : Infinity,
    placeholderData: keepPreviousData,
    retry: enabled ? 1 : false,
  });
}
