import { computeStatisticsData } from "@/lib/statisticsAnalytics";
import type { StatisticsData } from "@/types/statistics";
import {
  mockAvailableUsernames,
  mockSpeedTiers,
} from "./availableUsernames.mock";
import {
  mockSpeedHistory,
  mockSubscribers,
  mockUsernameHistory,
} from "./subscribers.mock";

export function getStatisticsMock(year = new Date().getFullYear()): StatisticsData {
  return computeStatisticsData({
    subscribers: mockSubscribers,
    availableUsernames: mockAvailableUsernames,
    speedTiers: mockSpeedTiers,
    usernameHistory: mockUsernameHistory,
    speedHistory: mockSpeedHistory,
    year,
  });
}
