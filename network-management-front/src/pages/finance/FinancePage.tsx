import { RefreshCw, Receipt } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FinanceChartsSection, FinanceDebtorsTable } from "@/components/pages/finance";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useFinanceDebtorsQuery, useFinanceStatsQuery } from "@/hooks/useFinance";
import { getAmountOwed } from "@/lib/customerUtils";
import { formatMoney } from "@/lib/formatMoney";
import { ApiError } from "@/types/api";

export function FinancePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErr,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useFinanceStatsQuery();

  const {
    data: debtors = [],
    isLoading: debtorsLoading,
    refetch: refetchDebtors,
    isFetching: debtorsFetching,
  } = useFinanceDebtorsQuery();

  const totalOwed = useMemo(
    () => debtors.reduce((sum, row) => sum + getAmountOwed(row), 0),
    [debtors],
  );

  const isLoading = statsLoading || debtorsLoading;
  const isFetching = statsFetching || debtorsFetching;

  const refetchAll = () => {
    void refetchStats();
    void refetchDebtors();
  };

  if (isLoading) {
    return <LoadingState layout="statistics" variant="page" />;
  }

  if (statsError || !stats) {
    return (
      <div className="flex min-h-[min(40vh,24rem)] flex-col items-center justify-center gap-4 px-4 text-center">
        <Text muted>
          {statsErr instanceof ApiError ? statsErr.message : t("common.unexpectedError")}
        </Text>
        <Button variant="outline" onClick={refetchAll}>
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  const kpis = [
    {
      label: t("finance.kpi.monthlyRevenue"),
      value: formatMoney(stats.monthly.revenue, lang),
      sub: t("finance.kpi.monthlyRevenueSub", { count: stats.monthly.count }),
    },
    {
      label: t("finance.kpi.weeklyRevenue"),
      value: formatMoney(stats.weekly.revenue, lang),
      sub: t("finance.kpi.weeklyRevenueSub", { count: stats.weekly.count }),
    },
    {
      label: t("finance.kpi.newMonthBilled"),
      value: formatMoney(stats.newThisMonth.revenue, lang),
      sub: t("finance.kpi.newMonthBilledSub", { count: stats.newThisMonth.count }),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading as="h1">{t("finance.title")}</Heading>
          <Text muted className="mt-2 max-w-2xl">
            {t("finance.subtitle")}
          </Text>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            to="/finance/invoices"
            className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            <Receipt className="h-4 w-4" />
            {t("finance.invoices.allInvoices")}
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={refetchAll}
            disabled={isFetching}
            isLoading={isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            {t("finance.refresh")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-surface px-4 py-4 sm:px-5 sm:py-5"
          >
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-foreground sm:text-2xl">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-surface">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{t("finance.debtors.title")}</h2>
            <Text muted className="mt-1 text-sm">
              {t("finance.debtors.subtitle")}
            </Text>
          </div>
          {debtors.length > 0 ? (
            <div className="shrink-0 text-end">
              <p className="text-xs text-muted-foreground">
                {t("finance.debtors.totalOwed", {
                  count: debtors.length,
                  amount: formatMoney(totalOwed, lang),
                })}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-danger sm:text-2xl">
                {formatMoney(totalOwed, lang)}
              </p>
            </div>
          ) : null}
        </div>

        <div className="px-4 py-4 sm:px-6">
          <FinanceDebtorsTable rows={debtors} />
        </div>
      </section>

      <FinanceChartsSection stats={stats} />
    </div>
  );
}
