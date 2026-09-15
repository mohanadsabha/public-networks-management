import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invalidateSubscriberCaches } from "@/lib/queryCache";
import { customerByLineIdQueryKey, subscriberByLineIdQueryKey, subscriberProfileQueryKey } from "@/lib/queryKeys";
import { routersService } from "@/services/routers.service";
import { subscribersService } from "@/services/subscribers.service";
import type { RouterCatalogItem } from "@/types/router";

export const ROUTERS_QUERY_KEY = ["routers"] as const;

export function useRoutersQuery() {
  return useQuery({
    queryKey: ROUTERS_QUERY_KEY,
    queryFn: () => routersService.list(),
  });
}

export function useRouterMutations() {
  const queryClient = useQueryClient();

  const invalidateRouters = () =>
    queryClient.invalidateQueries({ queryKey: ROUTERS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: ({
      name,
      imageFile,
    }: {
      name: string;
      imageFile?: File;
      subscriberId?: number;
      lineId?: string;
    }) => routersService.create(name, imageFile),
    onSuccess: async (_created, vars) => {
      invalidateRouters();
      if (vars.subscriberId) {
        try {
          const profile = await subscribersService.getProfile(vars.subscriberId);
          const lineId = vars.lineId?.trim() || profile.subscriber.lineId?.trim();
          if (lineId) {
            queryClient.setQueryData(subscriberByLineIdQueryKey(lineId), profile);
          }
          queryClient.setQueryData(subscriberProfileQueryKey(vars.subscriberId), profile);
        } catch {
          invalidateSubscriberCaches(queryClient, {
            subscriberId: vars.subscriberId,
            lineId: vars.lineId,
          });
        }
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      name,
      imageFile,
    }: {
      id: number;
      name: string;
      imageFile?: File;
      subscriberId?: number;
      lineId?: string;
    }) => routersService.update(id, name, imageFile),
    onSuccess: async (_updated, vars) => {
      invalidateRouters();
      if (vars.subscriberId) {
        try {
          const profile = await subscribersService.getProfile(vars.subscriberId);
          const lineId = vars.lineId?.trim() || profile.subscriber.lineId?.trim();
          if (lineId) {
            queryClient.setQueryData(subscriberByLineIdQueryKey(lineId), profile);
          }
          queryClient.setQueryData(subscriberProfileQueryKey(vars.subscriberId), profile);
        } catch {
          invalidateSubscriberCaches(queryClient, {
            subscriberId: vars.subscriberId,
            lineId: vars.lineId,
          });
        }
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => routersService.remove(id),
    onSuccess: (_void, deletedId) => {
      queryClient.setQueryData<RouterCatalogItem[]>(ROUTERS_QUERY_KEY, (prev) =>
        (prev ?? []).filter((item) => item.id !== deletedId),
      );
      invalidateRouters();
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({
      routerId,
      subscriberId,
      routerPort,
    }: {
      routerId: number;
      subscriberId: number;
      routerPort?: string | null;
      lineId?: string;
    }) => routersService.assignToSubscriber(routerId, subscriberId, routerPort),
    onSuccess: async (_void, vars) => {
      invalidateSubscriberCaches(queryClient, {
        subscriberId: vars.subscriberId,
        lineId: vars.lineId,
      });

      try {
        const profile = await subscribersService.getProfile(vars.subscriberId);
        const lineId = vars.lineId?.trim() || profile.subscriber.lineId?.trim();
        if (lineId) {
          queryClient.setQueryData(subscriberByLineIdQueryKey(lineId), profile);
          queryClient.setQueryData(customerByLineIdQueryKey(lineId), profile.subscriber);
        }
        queryClient.setQueryData(subscriberProfileQueryKey(vars.subscriberId), profile);
      } catch {
        // invalidateSubscriberCaches already schedules a refetch
      }
    },
  });

  return { createMutation, updateMutation, deleteMutation, assignMutation };
}
