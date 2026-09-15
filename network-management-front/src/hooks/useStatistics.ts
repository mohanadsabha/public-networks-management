import { useQuery } from "@tanstack/react-query";
import { STATISTICS_RECENT_PAGE_SIZE } from "@/lib/statisticsRecent";
import { statisticsService } from "@/services/statistics.service";

export const STATISTICS_QUERY_KEY = ["statistics"] as const;

export function useStatisticsQuery(year: number) {
  return useQuery({
    queryKey: [...STATISTICS_QUERY_KEY, year],
    queryFn: () => statisticsService.getDashboard(year),
    staleTime: 60_000,
  });
}

export function useUsernameChangesByDateQuery(date: string, page: number) {
  return useQuery({
    queryKey: [...STATISTICS_QUERY_KEY, "username-changes", date, page],
    queryFn: () =>
      statisticsService.getUsernameChangesByDate(date, page, STATISTICS_RECENT_PAGE_SIZE),
    staleTime: 60_000,
  });
}

export function useNewSubscribersByDateQuery(date: string, page: number) {
  return useQuery({
    queryKey: [...STATISTICS_QUERY_KEY, "new-subscribers", date, page],
    queryFn: () =>
      statisticsService.getNewSubscribersByDate(date, page, STATISTICS_RECENT_PAGE_SIZE),
    staleTime: 60_000,
  });
}
