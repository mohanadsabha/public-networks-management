import { useQuery } from "@tanstack/react-query";
import { invoicesService } from "@/services/invoices.service";

export const INVOICES_LIST_QUERY_KEY = ["invoices", "list"] as const;

export function useInvoicesListQuery(page: number, search: string) {
  const trimmedSearch = search.trim();

  return useQuery({
    queryKey: [...INVOICES_LIST_QUERY_KEY, page, trimmedSearch],
    queryFn: () =>
      invoicesService.list({
        page,
        limit: 50,
        search: trimmedSearch || undefined,
      }),
    placeholderData: (prev) => prev,
  });
}
