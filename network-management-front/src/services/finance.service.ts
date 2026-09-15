import { apiGet } from "@/lib/apiClient";
import type { Customer } from "@/types/customer";
import type { FinancialStats } from "@/types/finance";

interface FinanceEnvelope<T> {
  success?: boolean;
  data: T;
}

export const financeService = {
  async getStats(): Promise<FinancialStats> {
    const response = await apiGet<FinanceEnvelope<FinancialStats>>("/finance/stats");
    return response.data;
  },

  async getDebtors(): Promise<Customer[]> {
    const response = await apiGet<FinanceEnvelope<Customer[]>>("/finance/debtors");
    return response.data ?? [];
  },
};
