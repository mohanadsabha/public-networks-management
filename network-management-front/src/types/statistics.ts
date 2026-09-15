export type SubscriptionStatusKey = "new" | "active" | "disabled" | "suspended";

export type CustomerKindKey = "customer" | "subscriber" | "expiring" | "stopped";

export type AvailableDaysCategory = "full" | "half" | "quarter" | "low";

export interface StatisticsOverview {
  totalRecords: number;
  totalSubscribers: number;
  customersOnly: number;
  activeSubscribers: number;
  totalAvailableUsernames: number;
  expiringSubscribers: number;
  expiredSubscribers: number;
  stoppedSubscribers: number;
  newThisMonth: number;
}

export interface StatisticsThisWeek {
  newSubscribers: number;
  availableUsernamesAdded: number;
  speedChanges: number;
  usernameChanges: number;
}

export interface SpeedCountRow {
  speed: number;
  label: string;
  count: number;
}

export interface StatusDistributionRow {
  status: SubscriptionStatusKey;
  count: number;
}

export interface MonthlyTrendRow {
  month: string;
  active: number;
  suspended: number;
  disabled: number;
  new: number;
}

export interface RecentSubscriberRow {
  id: number;
  lineId: string;
  username: string | null;
  fullName: string;
  phone: string | null;
  createdAt: string;
}

export interface UsernameChangeRow {
  id: number;
  subscriberId: number | null;
  lineId: string;
  fullName: string;
  phone: string | null;
  oldUsername: string;
  currentUsername: string;
  changedAt: string;
}

export interface FacilityTypeRow {
  facilityType: string;
  count: number;
}

export interface DailyCountRow {
  date: string;
  count: number;
}

export interface AvailableDaysBreakdownRow {
  speed: number;
  label: string;
  breakdown: Array<{ category: AvailableDaysCategory; count: number }>;
}

export interface SubscriptionSummary {
  total: number;
  active: number;
  suspended: number;
  disabled: number;
  new: number;
}

export interface CustomerKindBreakdown {
  customer: number;
  subscriber: number;
  expiring: number;
  stopped: number;
}

export interface StatisticsDayListResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface StatisticsData {
  overview: StatisticsOverview;
  thisWeek: StatisticsThisWeek;
  thisMonth: { newSubscribers: number };
  speedTiers: Array<{ id: number; speedMbps: number; label: string }>;
  subscribersBySpeed: SpeedCountRow[];
  availableBySpeed: SpeedCountRow[];
  facilityTypes: FacilityTypeRow[];
  newSubscriberDayCounts: DailyCountRow[];
  usernameChangeDayCounts: DailyCountRow[];
  charts: {
    dailyNewSubscribers: DailyCountRow[];
    dailyAvailableAdded: DailyCountRow[];
  };
  availableDaysBreakdownBySpeed: AvailableDaysBreakdownRow[];
  customerBreakdown: CustomerKindBreakdown;
  subscription: {
    year: number;
    summary: SubscriptionSummary;
    distribution: StatusDistributionRow[];
    monthlyTrend: MonthlyTrendRow[];
  };
}
