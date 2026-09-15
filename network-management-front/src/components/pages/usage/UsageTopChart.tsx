import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { EChartsOption } from "echarts";
import {
  ChartCard,
  ChartLegendRow,
  EChart,
  CHART_COLORS,
  useChartThemeColors,
} from "@/components/ui/charts";
import { useTheme } from "@/providers/ThemeProvider";
import { formatDataUsageMb, formatUsageRatio } from "@/lib/speedFairUsage";
import type { SubscriberUsageRow, UsageLevel } from "@/lib/usageUtils";

const LEVEL_COLOR: Record<UsageLevel, string> = {
  over: CHART_COLORS.danger,
  critical: CHART_COLORS.warning,
  high: CHART_COLORS.accent,
  normal: CHART_COLORS.primary,
  unknown: CHART_COLORS.muted,
};

interface UsageTopChartProps {
  rows: SubscriberUsageRow[];
  limit?: number;
}

function chartRowLabel(row: SubscriberUsageRow): string {
  return row.fullName?.trim() || row.lineId;
}

/** Horizontal bar of the heaviest consumers (already sorted by the page). */
export function UsageTopChart({ rows, limit = 10 }: UsageTopChartProps) {
  const { t, i18n } = useTranslation();
  const { mode } = useTheme();
  const theme = useChartThemeColors();

  const top = useMemo(() => rows.slice(0, limit), [rows, limit]);
  const hasUsage = useMemo(() => top.some((r) => r.usedMb > 0), [top]);
  const chartHeightPx = Math.max(380, top.length * 46 + 64);

  const option = useMemo<EChartsOption>(() => {
    const data = [...top].reverse();
    return {
      animationDuration: 700,
      animationEasing: "cubicOut",
      grid: { left: 4, right: 96, top: 8, bottom: 32, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(148,163,184,0.10)" } },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: theme.foreground, fontSize: 12 },
        extraCssText: "border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,0.12);",
        formatter: (params: unknown) => {
          const arr = params as Array<{ dataIndex: number }>;
          const row = data[arr[0]?.dataIndex ?? 0];
          if (!row) return "";
          const ratio = formatUsageRatio(row.usedMb, row.limitMb);
          const pct = row.percent != null ? ` · ${row.percent}%` : "";
          const speed =
            row.speedMbps > 0
              ? `<br/><span style="color:${theme.mutedForeground}">${row.speedMbps} Mbps</span>`
              : "";
          const sub = row.username
            ? `<br/><span style="color:${theme.mutedForeground}">${row.username}</span>`
            : "";
          return `<strong>${row.fullName || row.lineId}</strong>${speed}${sub}<br/>${ratio}${pct}`;
        },
      },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: theme.gridLine, type: "dashed" } },
        axisLabel: {
          color: theme.mutedForeground,
          fontSize: 11,
          margin: 10,
          formatter: (value: number) => formatDataUsageMb(value),
        },
      },
      yAxis: {
        type: "category",
        data: data.map(chartRowLabel),
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: theme.rowDivider, width: 1 },
        },
        axisLabel: {
          color: theme.foreground,
          fontWeight: 500,
          fontSize: 12,
          lineHeight: 18,
          width: 172,
          overflow: "truncate",
          align: "right",
          margin: 12,
        },
      },
      series: [
        {
          type: "bar",
          barWidth: 11,
          barCategoryGap: "48%",
          label: {
            show: true,
            position: "right",
            color: theme.mutedForeground,
            fontSize: 11,
            fontWeight: 500,
            distance: 6,
            formatter: (p: { dataIndex: number }) => {
              const row = data[p.dataIndex];
              if (!row) return "";
              if (row.percent != null) return `${formatDataUsageMb(row.usedMb)} · ${row.percent}%`;
              return formatDataUsageMb(row.usedMb);
            },
          },
          data: data.map((r) => ({
            value: r.usedMb,
            itemStyle: { color: LEVEL_COLOR[r.level], borderRadius: [0, 6, 6, 0] },
          })),
        },
      ],
    };
  }, [top, theme]);

  const legendItems = (["over", "critical", "high", "normal"] as const).map((level) => ({
    label: t(`usage.level.${level}`),
    color: LEVEL_COLOR[level],
    type: "square" as const,
  }));

  return (
    <ChartCard
      title={t("usage.chart.title")}
      description={t("usage.chart.subtitle")}
      chartClassName="!h-auto"
      legend={hasUsage ? <ChartLegendRow items={legendItems} /> : undefined}
    >
      {top.length === 0 || !hasUsage ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm text-muted-foreground">{t("usage.chart.empty")}</p>
          <p className="max-w-xs text-xs text-muted-foreground/80">{t("usage.chart.emptyHint")}</p>
        </div>
      ) : (
        <div className="w-full" style={{ height: chartHeightPx }}>
          <EChart option={option} refreshKey={`${i18n.language}-${mode}`} />
        </div>
      )}
    </ChartCard>
  );
}
