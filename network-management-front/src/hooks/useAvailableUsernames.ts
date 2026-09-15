import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invalidateFinanceCaches, invalidatePoolAndStatsCaches } from "@/lib/queryCache";
import { availableUsernamesQueryKey } from "@/lib/queryKeys";
import { usernamesService } from "@/services/usernames.service";
import type { AvailableUsernameFormValues } from "@/components/pages/available-usernames";

export { availableUsernamesQueryKey } from "@/lib/queryKeys";

export function useAvailableUsernamesQuery(speedId: number, enabled = true) {
  return useQuery({
    queryKey: availableUsernamesQueryKey(speedId),
    queryFn: () => usernamesService.list(speedId),
    enabled: enabled && speedId > 0,
  });
}

export function useUsernameMutations(speedId: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: availableUsernamesQueryKey(speedId) });
    invalidatePoolAndStatsCaches(queryClient);
  };

  const createMutation = useMutation({
    mutationFn: (values: AvailableUsernameFormValues) => usernamesService.create(speedId, values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: AvailableUsernameFormValues }) =>
      usernamesService.update(speedId, id, values),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usernamesService.remove(speedId, id),
    onSuccess: invalidate,
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => usernamesService.removeAllForSpeed(speedId),
    onSuccess: invalidate,
  });

  const resetCycleMutation = useMutation({
    mutationFn: (usernameId: number) => usernamesService.resetBillingCycle(speedId, usernameId),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      invalidateFinanceCaches(queryClient);
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => usernamesService.importExcel(speedId, file),
    onSuccess: invalidate,
  });

  const exportMutation = useMutation({
    mutationFn: () => usernamesService.exportExcel(speedId),
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    deleteAllMutation,
    resetCycleMutation,
    importMutation,
    exportMutation,
  };
}
