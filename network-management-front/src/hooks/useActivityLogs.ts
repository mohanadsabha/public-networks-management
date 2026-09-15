import { useQuery } from "@tanstack/react-query";
import { logsService, type ActivityLogsListParams } from "@/services/logs.service";

export const activityLogsQueryKey = (params: ActivityLogsListParams) =>
  ["activity-logs", params] as const;

export function useActivityLogsQuery(params: ActivityLogsListParams) {
  return useQuery({
    queryKey: activityLogsQueryKey(params),
    queryFn: () => logsService.list(params),
    placeholderData: (previous) => previous,
  });
}
