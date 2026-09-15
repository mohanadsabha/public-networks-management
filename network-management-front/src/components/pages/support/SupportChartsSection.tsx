import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  CHART_COLORS,
  CHART_PALETTE,
  ChartCard,
  donutChartOption,
  EChart,
  groupedBarChartOption,
  multiLineChartOption,
  pieChartOption,
} from "@/components/ui/charts";
import {
  getChannelChartData,
  getDailyTrendData,
  getStatusChartData,
} from "@/lib/supportAnalytics";
import type {
  ChartCountItem,
  DailyTrendPoint,
  SupportTicket,
  TicketStatus,
} from "@/types/supportTicket";

const TICKET_STATUS_CHART_COLORS: Record<TicketStatus, string> = {
  open: CHART_COLORS.warning,
  in_progress: CHART_COLORS.primary,
  waiting_customer: CHART_COLORS.accent,
  resolved: CHART_COLORS.success,
};

function statusChartColor(key: string): string {
  return TICKET_STATUS_CHART_COLORS[key as TicketStatus] ?? CHART_COLORS.muted;
}

interface SupportChartsSectionProps {
  tickets: SupportTicket[];
}

export function SupportChartsSection({ tickets }: SupportChartsSectionProps) {
  const { t } = useTranslation();
  const statusData = getStatusChartData(tickets);
  const channelData = getChannelChartData(tickets);
  const dailyTrend = getDailyTrendData(tickets);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <StatusDonutChart data={statusData} title={t("support.charts.byStatus")} />
      <DailyTrendChart data={dailyTrend} title={t("support.charts.dailyTrend")} />
      <WeeklyBarChart data={dailyTrend} title={t("support.charts.weeklyActivity")} />
      <ChannelPieChart data={channelData} title={t("support.charts.byChannel")} />
    </div>
  );
}

function StatusDonutChart({ data, title }: { data: ChartCountItem[]; title: string }) {
  const { t, i18n } = useTranslation();

  const chartData = useMemo(
    () =>
      data
        .filter((item) => item.value > 0)
        .map((item) => ({
          key: item.key,
          name: t(`support.status.${item.key}`),
          value: item.value,
          color: statusChartColor(item.key),
        })),
    [data, t],
  );

  return (
    <ChartCard title={title} description={t("support.charts.byStatusHint")}>
      <EChart option={donutChartOption(chartData)} refreshKey={i18n.language} />
    </ChartCard>
  );
}

function DailyTrendChart({ data, title }: { data: DailyTrendPoint[]; title: string }) {
  const { t, i18n } = useTranslation();

  const series = useMemo(
    () => [
      { key: "created", name: t("support.charts.created"), color: CHART_COLORS.primary },
      { key: "resolved", name: t("support.charts.resolved"), color: CHART_COLORS.success },
    ],
    [t],
  );

  return (
    <ChartCard title={title} description={t("support.charts.dailyTrendHint")}>
      <EChart
        option={multiLineChartOption(
          data.map((row) => row.label),
          data,
          series,
        )}
        refreshKey={i18n.language}
      />
    </ChartCard>
  );
}

function WeeklyBarChart({ data, title }: { data: DailyTrendPoint[]; title: string }) {
  const { t, i18n } = useTranslation();

  const series = useMemo(
    () => [
      { key: "created", name: t("support.charts.created"), color: CHART_COLORS.primary },
      { key: "resolved", name: t("support.charts.resolved"), color: CHART_COLORS.success },
    ],
    [t],
  );

  return (
    <ChartCard title={title} description={t("support.charts.weeklyActivityHint")}>
      <EChart
        option={groupedBarChartOption(
          data.map((row) => row.label),
          data,
          series,
        )}
        refreshKey={i18n.language}
      />
    </ChartCard>
  );
}

function ChannelPieChart({ data, title }: { data: ChartCountItem[]; title: string }) {
  const { t, i18n } = useTranslation();

  const chartData = useMemo(
    () =>
      data
        .filter((item) => item.value > 0)
        .map((item, index) => ({
          key: item.key,
          name: t(`support.channel.${item.key}`),
          value: item.value,
          color: CHART_PALETTE[index % CHART_PALETTE.length],
        })),
    [data, t],
  );

  return (
    <ChartCard title={title} description={t("support.charts.byChannelHint")}>
      <EChart option={pieChartOption(chartData)} refreshKey={i18n.language} />
    </ChartCard>
  );
}
