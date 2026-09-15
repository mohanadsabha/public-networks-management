import type { QueryClient } from "@tanstack/react-query";
import type { SubscriberProfileDto } from "@/lib/mapSubscribers";
import {
  customerByLineIdQueryKey,
  subscriberByLineIdQueryKey,
  subscriberConnectionQueryKey,
  subscriberProfileQueryKey,
} from "@/lib/queryKeys";
import { STATISTICS_QUERY_KEY } from "@/hooks/useStatistics";
import { SPEEDS_QUERY_KEY } from "@/hooks/useSpeeds";
import { FINANCE_QUERY_KEY } from "@/hooks/useFinance";
import { INVOICES_LIST_QUERY_KEY } from "@/hooks/useInvoices";
import type { Subscriber } from "@/types/subscriber";

export function patchSubscriberInCaches(queryClient: QueryClient, subscriber: Subscriber) {
  const lineId = subscriber.lineId?.trim();
  if (!lineId) return;

  const mergeProfile = (prev: SubscriberProfileDto | undefined) => {
    if (!prev) return prev;
    return { ...prev, subscriber: { ...prev.subscriber, ...subscriber } };
  };

  queryClient.setQueryData(subscriberByLineIdQueryKey(lineId), mergeProfile);
  queryClient.setQueryData(subscriberProfileQueryKey(subscriber.id), mergeProfile);
  queryClient.setQueryData(customerByLineIdQueryKey(lineId), (prev: Subscriber | undefined) =>
    prev ? { ...prev, ...subscriber } : prev,
  );
}

export function applyBalanceDelta(
  queryClient: QueryClient,
  subscriberId: number,
  lineId: string,
  delta: number,
) {
  if (!Number.isFinite(delta) || delta === 0) return;

  const adjust = (balance: number) => balance + delta;

  const mergeProfile = (prev: SubscriberProfileDto | undefined) => {
    if (!prev) return prev;
    return {
      ...prev,
      subscriber: { ...prev.subscriber, balance: adjust(prev.subscriber.balance) },
    };
  };

  const trimmedLineId = lineId.trim();
  if (trimmedLineId) {
    queryClient.setQueryData(subscriberByLineIdQueryKey(trimmedLineId), mergeProfile);
    queryClient.setQueryData(customerByLineIdQueryKey(trimmedLineId), (prev: Subscriber | undefined) =>
      prev ? { ...prev, balance: adjust(prev.balance) } : prev,
    );
  }

  queryClient.setQueryData(subscriberProfileQueryKey(subscriberId), mergeProfile);
}

export function invalidateSubscriberCaches(
  queryClient: QueryClient,
  options: { subscriberId: number; lineId?: string },
) {
  const { subscriberId, lineId } = options;

  queryClient.invalidateQueries({ queryKey: subscriberProfileQueryKey(subscriberId) });
  queryClient.invalidateQueries({ queryKey: ["subscribers", subscriberId, "logs"] });
  if (lineId?.trim()) {
    queryClient.invalidateQueries({ queryKey: subscriberByLineIdQueryKey(lineId.trim()) });
    queryClient.invalidateQueries({ queryKey: subscriberConnectionQueryKey(lineId.trim()) });
    queryClient.invalidateQueries({ queryKey: customerByLineIdQueryKey(lineId.trim()) });
  }
  queryClient.invalidateQueries({ queryKey: ["subscribers", "line"] });
  queryClient.invalidateQueries({ queryKey: ["subscribers"] });
  queryClient.invalidateQueries({ queryKey: ["customers"] });
}

export function invalidateFinanceCaches(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: INVOICES_LIST_QUERY_KEY });
}

export function invalidatePoolAndStatsCaches(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["available-usernames"] });
  queryClient.invalidateQueries({ queryKey: SPEEDS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: STATISTICS_QUERY_KEY });
  invalidateFinanceCaches(queryClient);
}
