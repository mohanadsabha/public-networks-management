export interface FinanceCountRevenue {
  revenue: number;
  count: number;
}

export interface FinanceSpeedRevenue {
  label: string;
  speed: number;
  revenue: number;
  count: number;
}

export interface FinanceMonthPoint {
  month: string;
  revenue: number;
  count: number;
}

export interface FinanceTopSubscriber {
  lineId: string;
  fullName: string;
  username: string | null;
  monthlyPrice: number;
  speedMbps: number;
  totalPaid: number;
  invoiceCount: number;
}

export interface FinanceMethodBreakdown {
  method: string;
  total: number;
  count: number;
}

export interface FinancialStats {
  monthly: FinanceCountRevenue;
  weekly: FinanceCountRevenue;
  newThisMonth: FinanceCountRevenue;
  averagePrice: number;
  allTimePaid: FinanceCountRevenue;
  debt: FinanceCountRevenue;
  expiring: FinanceCountRevenue;
  expired: FinanceCountRevenue;
  stopped: { count: number };
  revenueBySpeed: FinanceSpeedRevenue[];
  monthlyTrend: FinanceMonthPoint[];
  topSubscribers: FinanceTopSubscriber[];
  byMethod: FinanceMethodBreakdown[];
}
