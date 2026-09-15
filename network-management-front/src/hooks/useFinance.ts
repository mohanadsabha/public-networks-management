import { useQuery } from "@tanstack/react-query";
import { financeService } from "@/services/finance.service";

export const FINANCE_QUERY_KEY = ["finance"] as const;

export function useFinanceStatsQuery() {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, "stats"],
    queryFn: () => financeService.getStats(),
    staleTime: 60_000,
  });
}

export function useFinanceDebtorsQuery() {
  return useQuery({
    queryKey: [...FINANCE_QUERY_KEY, "debtors"],
    queryFn: () => financeService.getDebtors(),
    staleTime: 60_000,
  });
}
