import { apiClient } from "@/lib/apiClient";
import { STATISTICS_RECENT_PAGE_SIZE } from "@/lib/statisticsRecent";
import type {
  RecentSubscriberRow,
  StatisticsData,
  StatisticsDayListResult,
  UsernameChangeRow,
} from "@/types/statistics";

interface StatisticsResponse {
  status: string;
  data: StatisticsData;
}

interface PaginatedResponse<T> {
  status: string;
  data: StatisticsDayListResult<T>;
}

/** Statistics dashboard runs many aggregate queries — allow more time than the default client timeout. */
const STATISTICS_TIMEOUT_MS = 60_000;

export const statisticsService = {
  async getDashboard(year: number): Promise<StatisticsData> {
    const { data: response } = await apiClient.get<StatisticsResponse>("/statistics", {
      params: { year },
      timeout: STATISTICS_TIMEOUT_MS,
    });
    return response.data;
  },

  async getUsernameChangesByDate(
    date: string,
    page = 1,
    limit = STATISTICS_RECENT_PAGE_SIZE,
  ): Promise<StatisticsDayListResult<UsernameChangeRow>> {
    const { data: response } = await apiClient.get<PaginatedResponse<UsernameChangeRow>>(
      "/statistics/username-changes",
      { params: { date, page, limit }, timeout: STATISTICS_TIMEOUT_MS },
    );
    return (
      response.data ?? {
        items: [],
        total: 0,
        page,
        limit,
      }
    );
  },

  async getNewSubscribersByDate(
    date: string,
    page = 1,
    limit = STATISTICS_RECENT_PAGE_SIZE,
  ): Promise<StatisticsDayListResult<RecentSubscriberRow>> {
    const { data: response } = await apiClient.get<PaginatedResponse<RecentSubscriberRow>>(
      "/statistics/new-subscribers",
      { params: { date, page, limit }, timeout: STATISTICS_TIMEOUT_MS },
    );
    return (
      response.data ?? {
        items: [],
        total: 0,
        page,
        limit,
      }
    );
  },
};
