import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CHART_COLORS,
  CHART_PALETTE,
  ChartCard,
  ChartEmpty,
  coloredVerticalBarChartOption,
  donutChartOption,
  EChart,
  horizontalBarChartOption,
  multiLineChartOption,
  pieChartOption,
  singleLineChartOption,
  stackedBarChartOption,
} from "@/components/ui/charts";
import { chartDayLabel, chartMonthLabel } from "@/lib/chartDateLabels";
import type {
  CustomerKindBreakdown,
  StatisticsData,
  SubscriptionStatusKey,
} from "@/types/statistics";

const STATUS_COLORS: Record<SubscriptionStatusKey, string> = {
  new: CHART_COLORS.accent,
  active: CHART_COLORS.primary,
  disabled: CHART_COLORS.danger,
  suspended: CHART_COLORS.warning,
};

const KIND_COLORS = {
  customer: CHART_COLORS.muted,
  subscriber: CHART_COLORS.primary,
  expiring: CHART_COLORS.warning,
  stopped: CHART_COLORS.danger,
} as const;

const TREND_KEYS: SubscriptionStatusKey[] = ["new", "active", "disabled", "suspended"];

interface StatisticsChartsSectionProps {
  data: StatisticsData;
}

export function StatisticsChartsSection({ data }: StatisticsChartsSectionProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const statusLabel = (key: SubscriptionStatusKey) => t(`statistics.charts.status_${key}`);

  const distribution = useMemo(
    () =>
      data.subscription.distribution
        .filter((d) => d.count > 0)
        .map((d) => ({
          key: d.status,
          name: statusLabel(d.status),
          value: d.count,
          color: STATUS_COLORS[d.status],
        })),
    [data.subscription.distribution, t],
  );

  const kindData = useMemo(
    () => buildKindChartData(data.customerBreakdown, t),
    [data.customerBreakdown, t],
  );

  const trendData = useMemo(
    () =>
      data.subscription.monthlyTrend.map((m) => ({
        key: m.month,
        label: chartMonthLabel(m.month, lang),
        new: m.new,
        active: m.active,
        disabled: m.disabled,
        suspended: m.suspended,
      })),
    [data.subscription.monthlyTrend, lang],
  );

  const trendCategories = trendData.map((row) => row.label);
  const trendSeries = TREND_KEYS.map((key) => ({
    key,
    name: statusLabel(key),
    color: STATUS_COLORS[key],
  }));

  const speedSubData = useMemo(
    () =>
      data.subscribersBySpeed.map((s, i) => ({
        key: String(s.speed),
        name: s.label,
        value: s.count,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      })),
    [data.subscribersBySpeed],
  );

  const speedPoolData = useMemo(
    () =>
      data.availableBySpeed.map((s, i) => ({
        key: String(s.speed),
        name: s.label,
        value: s.count,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      })),
    [data.availableBySpeed],
  );

  const dailyNew = useMemo(
    () =>
      data.charts.dailyNewSubscribers.map((d) => ({
        label: chartDayLabel(d.date, lang),
        count: d.count,
      })),
    [data.charts.dailyNewSubscribers, lang],
  );

  const dailyAvailable = useMemo(
    () =>
      data.charts.dailyAvailableAdded.map((d) => ({
        label: chartDayLabel(d.date, lang),
        count: d.count,
      })),
    [data.charts.dailyAvailableAdded, lang],
  );

  const facilityData = useMemo(
    () =>
      data.facilityTypes.map((f, i) => ({
        key: f.facilityType,
        name: f.facilityType,
        value: f.count,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      })),
    [data.facilityTypes],
  );

  const chartKey = lang;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard
        title={t("statistics.charts.statusDonut")}
        description={t("statistics.charts.statusDonutSub")}
      >
        {distribution.length === 0 ? (
          <ChartEmpty />
        ) : (
          <EChart option={donutChartOption(distribution)} refreshKey={chartKey} />
        )}
      </ChartCard>

      <ChartCard
        title={t("statistics.charts.customerKinds")}
        description={t("statistics.charts.customerKindsSub")}
      >
        {kindData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <EChart option={pieChartOption(kindData)} refreshKey={chartKey} />
        )}
      </ChartCard>

      <ChartCard
        className="xl:col-span-2"
        title={t("statistics.charts.monthlyTrend")}
        description={t("statistics.charts.monthlyTrendSub", { year: data.subscription.year })}
        chartClassName="h-64"
      >
        <EChart
          option={multiLineChartOption(trendCategories, trendData, trendSeries)}
          refreshKey={chartKey}
        />
      </ChartCard>

      <ChartCard
        className="xl:col-span-2"
        title={t("statistics.charts.monthlyBars")}
        description={t("statistics.charts.monthlyBarsSub")}
        chartClassName="h-64"
      >
        <EChart
          option={stackedBarChartOption(trendCategories, trendData, trendSeries)}
          refreshKey={chartKey}
        />
      </ChartCard>

      <ChartCard
        title={t("statistics.charts.subscribersBySpeed")}
        description={t("statistics.charts.subscribersBySpeedSub")}
      >
        {speedSubData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <EChart option={donutChartOption(speedSubData, "50%", "78%")} refreshKey={chartKey} />
        )}
      </ChartCard>

      <ChartCard
        title={t("statistics.charts.availableBySpeed")}
        description={t("statistics.charts.availableBySpeedSub")}
      >
        {speedPoolData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <EChart
            option={coloredVerticalBarChartOption(speedPoolData)}
            refreshKey={chartKey}
          />
        )}
      </ChartCard>

      <ChartCard
        title={t("statistics.charts.dailyNew")}
        description={t("statistics.charts.dailyNewSub")}
      >
        <EChart
          option={singleLineChartOption(
            dailyNew.map((d) => d.label),
            dailyNew.map((d) => d.count),
            CHART_COLORS.primary,
            t("statistics.activity.newSubscribers"),
          )}
          refreshKey={chartKey}
        />
      </ChartCard>

      <ChartCard
        title={t("statistics.charts.dailyAvailable")}
        description={t("statistics.charts.dailyAvailableSub")}
      >
        <EChart
          option={singleLineChartOption(
            dailyAvailable.map((d) => d.label),
            dailyAvailable.map((d) => d.count),
            CHART_COLORS.accent,
            t("statistics.activity.usernamesAdded"),
          )}
          refreshKey={chartKey}
        />
      </ChartCard>

      <ChartCard
        className="xl:col-span-2"
        title={t("statistics.charts.facilityTypes")}
        description={t("statistics.charts.facilityTypesSub")}
      >
        {facilityData.length === 0 ? (
          <ChartEmpty />
        ) : (
          <EChart option={horizontalBarChartOption(facilityData)} refreshKey={chartKey} />
        )}
      </ChartCard>
    </div>
  );
}

function buildKindChartData(breakdown: CustomerKindBreakdown, t: (key: string) => string) {
  const rows = [
    { key: "customer", name: t("statistics.customers.customer"), value: breakdown.customer, color: KIND_COLORS.customer },
    { key: "subscriber", name: t("statistics.customers.subscriber"), value: breakdown.subscriber, color: KIND_COLORS.subscriber },
    { key: "expiring", name: t("statistics.customers.expiring"), value: breakdown.expiring, color: KIND_COLORS.expiring },
    { key: "stopped", name: t("statistics.customers.stopped"), value: breakdown.stopped, color: KIND_COLORS.stopped },
  ];
  return rows.filter((r) => r.value > 0);
}
