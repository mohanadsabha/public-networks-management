import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveSpeedTiers } from "@/lib/mapSpeedTiers";
import { attachFairUsageToTiers } from "@/lib/speedFairUsageStorage";
import { speedsService } from "@/services/speeds.service";
import type { SpeedTier } from "@/types/speeds";

export const SPEEDS_QUERY_KEY = ["speeds"] as const;

/** Returns only non-deleted speed tiers (`deleted: false`). */
export function useSpeedsQuery() {
  return useQuery({
    queryKey: SPEEDS_QUERY_KEY,
    queryFn: async () =>
      attachFairUsageToTiers(getActiveSpeedTiers(await speedsService.list())),
  });
}

export function useSpeedMutations() {
  const queryClient = useQueryClient();

  const invalidateSpeeds = () =>
    queryClient.invalidateQueries({ queryKey: SPEEDS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: ({ valueMbps, price }: { valueMbps: number; price: number }) =>
      speedsService.create(valueMbps, price),
    onSuccess: invalidateSpeeds,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      valueMbps,
      price,
    }: {
      id: number;
      valueMbps: number;
      price: number;
    }) => speedsService.update(id, valueMbps, price),
    onSuccess: invalidateSpeeds,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => speedsService.remove(id),
    onSuccess: (_void, deletedId) => {
      queryClient.setQueryData<SpeedTier[]>(SPEEDS_QUERY_KEY, (prev) =>
        (prev ?? []).filter((tier) => tier.id !== deletedId),
      );
      invalidateSpeeds();
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
