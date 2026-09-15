import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TicketFormValues } from "@/components/pages/support";
import { supportService } from "@/services/support.service";
import type { TicketStatus } from "@/types/supportTicket";

export const SUPPORT_TICKETS_QUERY_KEY = ["support", "tickets"] as const;

export function useSupportTicketsQuery(status?: TicketStatus) {
  return useQuery({
    queryKey: status ? [...SUPPORT_TICKETS_QUERY_KEY, status] : SUPPORT_TICKETS_QUERY_KEY,
    queryFn: () => supportService.list(status),
  });
}

export function useSupportMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (values: TicketFormValues) => supportService.create(values),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: TicketFormValues }) =>
      supportService.update(id, values),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => supportService.remove(id),
    onSuccess: invalidate,
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => supportService.removeAll(),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, deleteAllMutation };
}
