import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { availableUsernamesQueryKey } from "@/hooks/useAvailableUsernames";
import { usernamesService } from "@/services/usernames.service";
import { getSpeedPoolCounts } from "@/types/availableUsername";
import type { SpeedTier } from "@/types/speeds";

export interface SpeedPoolCountSummary {
  total: number;
  available: number;
}

export function useAllSpeedPoolCounts(speedTiers: SpeedTier[], enabled = true) {
  const speedIds = useMemo(() => speedTiers.map((tier) => tier.id), [speedTiers]);

  const queries = useQueries({
    queries: speedIds.map((speedId) => ({
      queryKey: availableUsernamesQueryKey(speedId),
      queryFn: () => usernamesService.list(speedId),
      enabled: enabled && speedId > 0,
      staleTime: 30_000,
    })),
  });

  const countsBySpeedId = useMemo(() => {
    const map = new Map<number, SpeedPoolCountSummary>();

    speedIds.forEach((speedId, index) => {
      const rows = queries[index]?.data ?? [];
      const counts = getSpeedPoolCounts(rows, speedId);
      map.set(speedId, { total: counts.total, available: counts.new });
    });

    return map;
  }, [queries, speedIds]);

  const isLoading = queries.some((query) => query.isLoading);

  return { countsBySpeedId, isLoading };
}
