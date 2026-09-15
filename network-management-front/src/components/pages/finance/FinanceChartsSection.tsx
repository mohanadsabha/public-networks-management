import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CHART_COLORS,
  CHART_PALETTE,
  ChartCard,
  ChartEmpty,
  donutChartOption,
  EChart,
  pieChartOption,
  singleLineChartOption,
  verticalBarChartOption,
} from "@/components/ui/charts";
import { chartMonthLabel } from "@/lib/chartDateLabels";
import { formatMoney } from "@/lib/formatMoney";
import { formatFinanceMethodLabel } from "@/lib/financeUtils";
import type { FinancialStats } from "@/types/finance";

interface FinanceChartsSectionProps {
  stats: FinancialStats;
}

export function FinanceChartsSection({ stats }: FinanceChartsSectionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const formatValue = (value: number) => formatMoney(value, lang);

  const trendData = useMemo(
    () =>
      stats.monthlyTrend.map((m) => ({
        key: m.month,
        label: chartMonthLabel(m.month, lang),
        revenue: m.revenue,
        count: m.count,
      })),
    [stats.monthlyTrend, lang],
  );

  const speedData = useMemo(
    () =>
      stats.revenueBySpeed
        .filter((s) => s.revenue > 0)
        .map((s, i) => ({
          key: String(s.speed),
          name: s.label,
          value: s.revenue,
          color: CHART_PALETTE[i % CHART_PALETTE.length],
        })),
    [stats.revenueBySpeed],
  );

  const methodData = useMemo(
    () =>
      stats.byMethod.map((m, i) => ({
        key: m.method,
        name: formatFinanceMethodLabel(m.method, t),
        value: m.total,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      })),
    [stats.byMethod, t],
  );

  const chartKey = lang;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <ChartCard
        className="md:col-span-2"
        title={t("finance.charts.revenueTrend")}
        description={t("finance.charts.revenueTrendSub")}
        chartClassName="h-64"
      >
        <EChart
          option={singleLineChartOption(
            trendData.map((row) => row.label),
            trendData.map((row) => row.revenue),
            CHART_COLORS.primary,
            t("finance.charts.paidLabel"),
            formatValue,
          )}
          refreshKey={chartKey}
        />
      </ChartCard>

      <ChartCard
        title={t("finance.charts.revenueBySpeed")}
        description={t("finance.charts.revenueBySpeedSub")}
      >
        {speedData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <EChart option={donutChartOption(speedData)} refreshKey={chartKey} />
        )}
      </ChartCard>

      <ChartCard
        title={t("finance.charts.byMethod")}
        description={t("finance.charts.byMethodSub")}
      >
        {methodData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <EChart option={pieChartOption(methodData, "50%", "78%")} refreshKey={chartKey} />
        )}
      </ChartCard>

      <ChartCard
        className="md:col-span-2"
        title={t("finance.charts.monthlyBars")}
        description={t("finance.charts.monthlyBarsSub")}
        chartClassName="h-64"
      >
        <EChart
          option={verticalBarChartOption(
            trendData.map((row) => row.label),
            trendData.map((row) => row.revenue),
            CHART_COLORS.primary,
            t("finance.charts.paidLabel"),
            formatValue,
          )}
          refreshKey={chartKey}
        />
      </ChartCard>

      <section className="md:col-span-2 overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <h3 className="text-base font-semibold">{t("finance.charts.topSubscribers")}</h3>
          <p className="text-sm text-muted-foreground">{t("finance.charts.topSubscribersSub")}</p>
        </div>
        {stats.topSubscribers.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-muted-foreground">—</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                    {t("finance.topTable.name")}
                  </th>
                  <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                    {t("finance.topTable.lineId")}
                  </th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">
                    {t("finance.topTable.totalPaid")}
                  </th>
                  <th className="px-4 py-3 text-end font-medium text-muted-foreground">
                    {t("finance.topTable.invoices")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topSubscribers.map((row) => (
                  <tr key={row.lineId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{row.fullName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.lineId}</td>
                    <td className="px-4 py-3 text-end tabular-nums">{formatMoney(row.totalPaid, lang)}</td>
                    <td className="px-4 py-3 text-end tabular-nums">{row.invoiceCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
