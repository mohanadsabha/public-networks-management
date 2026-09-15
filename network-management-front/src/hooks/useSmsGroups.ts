import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { smsService } from "@/services/sms.service";
import type { SmsCustomGroup, SmsGroupMember } from "@/types/sms";

export const SMS_GROUPS_QUERY_KEY = ["sms", "groups"] as const;

export function useSmsGroupsQuery() {
  return useQuery({
    queryKey: SMS_GROUPS_QUERY_KEY,
    queryFn: () => smsService.listGroups(),
  });
}

export function useSmsGroupMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: SMS_GROUPS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string | null; memberIds: number[] }) =>
      smsService.createGroup(input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: number;
      name: string;
      description?: string | null;
      memberIds: number[];
    }) => smsService.updateGroup(id, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => smsService.deleteGroup(id),
    onSuccess: (_void, deletedId) => {
      queryClient.setQueryData<SmsCustomGroup[]>(SMS_GROUPS_QUERY_KEY, (prev) =>
        (prev ?? []).filter((group) => group.id !== deletedId),
      );
      invalidate();
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}

/** SMS custom groups from API. */
export function useSmsGroups() {
  const { data: groups = [], isLoading, isFetching } = useSmsGroupsQuery();
  const { createMutation, updateMutation, deleteMutation } = useSmsGroupMutations();

  return {
    groups,
    isLoading: isLoading || isFetching,
    upsert: async (input: {
      id?: number;
      name: string;
      description?: string | null;
      members: SmsGroupMember[];
    }) => {
      const payload = {
        name: input.name,
        description: input.description,
        memberIds: input.members.map((member) => member.subscriberId),
      };
      if (input.id) {
        return updateMutation.mutateAsync({ id: input.id, ...payload });
      }
      return createMutation.mutateAsync(payload);
    },
    remove: (id: number) => deleteMutation.mutateAsync(id),
  };
}
