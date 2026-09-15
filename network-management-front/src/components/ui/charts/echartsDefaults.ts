import type { EChartsOption } from "echarts";

export const CHART_AXIS_COLOR = "#94a3b8";
export const CHART_GRID_COLOR = "rgba(148, 163, 184, 0.18)";

export const CHART_GRID = {
  left: 12,
  right: 16,
  top: 28,
  bottom: 8,
  containLabel: true,
} as const;

export const CHART_GRID_WITH_LEGEND = {
  ...CHART_GRID,
  bottom: 36,
} as const;

const LEGEND_TEXT = {
  color: CHART_AXIS_COLOR,
  fontSize: 11,
} as const;

function bottomLegend(
  names: string[],
  icon: "circle" | "roundRect" = "roundRect",
): NonNullable<EChartsOption["legend"]> {
  return {
    type: "scroll",
    bottom: 0,
    left: "center",
    selectedMode: true,
    icon,
    itemWidth: icon === "circle" ? 8 : 10,
    itemHeight: icon === "circle" ? 8 : 10,
    itemGap: 16,
    textStyle: LEGEND_TEXT,
    pageIconColor: CHART_AXIS_COLOR,
    pageTextStyle: LEGEND_TEXT,
    data: names,
  };
}

const TOOLTIP_BASE = {
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  borderColor: "#e2e8f0",
  borderWidth: 1,
  padding: [10, 14] as [number, number],
  textStyle: {
    color: "#1e293b",
    fontSize: 12,
    fontFamily: "inherit",
  },
  extraCssText:
    "border-radius: 10px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); backdrop-filter: blur(8px);",
};

export function categoryAxis(categories: string[]) {
  return {
    type: "category" as const,
    data: categories,
    boundaryGap: true,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: CHART_AXIS_COLOR,
      fontSize: 11,
      margin: 10,
    },
  };
}

export function valueAxis(formatter?: (value: number) => string) {
  return {
    type: "value" as const,
    minInterval: 1,
    splitLine: {
      lineStyle: { color: CHART_GRID_COLOR, type: "dashed" as const },
    },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: CHART_AXIS_COLOR,
      fontSize: 11,
      formatter: formatter ? (value: number) => formatter(value) : undefined,
    },
  };
}

export function itemTooltip(): EChartsOption["tooltip"] {
  return {
    trigger: "item",
    ...TOOLTIP_BASE,
  };
}

export function axisTooltip(
  valueFormatter?: (value: number) => string,
): EChartsOption["tooltip"] {
  return {
    trigger: "axis",
    axisPointer: {
      type: "line",
      lineStyle: { color: CHART_GRID_COLOR, width: 1 },
    },
    ...TOOLTIP_BASE,
    valueFormatter: valueFormatter
      ? (value) => valueFormatter(Number(value))
      : undefined,
  };
}

export interface ColoredDatum {
  name: string;
  value: number;
  color: string;
  key?: string;
}

export interface LineSeriesDef {
  key: string;
  name: string;
  color: string;
}

export function donutChartOption(
  data: ColoredDatum[],
  innerRadius = "58%",
  outerRadius = "82%",
): EChartsOption {
  const names = data.map((d) => d.name);
  return {
    animationDuration: 600,
    animationEasing: "cubicOut",
    tooltip: itemTooltip(),
    legend: bottomLegend(names),
    series: [
      {
        type: "pie",
        radius: [innerRadius, outerRadius],
        center: ["50%", "44%"],
        padAngle: 2,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 12, shadowColor: "rgba(15, 23, 42, 0.12)" },
        },
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  };
}

export function pieChartOption(
  data: ColoredDatum[],
  innerRadius?: string,
  outerRadius = "78%",
): EChartsOption {
  const radius: string | [string, string] = innerRadius
    ? [innerRadius, outerRadius]
    : outerRadius;

  const names = data.map((d) => d.name);
  return {
    animationDuration: 600,
    animationEasing: "cubicOut",
    tooltip: itemTooltip(),
    legend: bottomLegend(names),
    series: [
      {
        type: "pie",
        radius,
        center: ["50%", "45%"],
        padAngle: 2,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: { shadowBlur: 12, shadowColor: "rgba(15, 23, 42, 0.12)" },
        },
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  };
}

function seriesValues(rows: object[], key: string): number[] {
  return rows.map((row) => Number((row as Record<string, unknown>)[key] ?? 0));
}

export function multiLineChartOption(
  categories: string[],
  rows: object[],
  series: LineSeriesDef[],
  valueFormatter?: (value: number) => string,
): EChartsOption {
  return {
    animationDuration: 700,
    grid: CHART_GRID_WITH_LEGEND,
    tooltip: axisTooltip(valueFormatter),
    legend: bottomLegend(
      series.map((s) => s.name),
      "circle",
    ),
    xAxis: categoryAxis(categories),
    yAxis: valueAxis(valueFormatter),
    series: series.map((s) => ({
      name: s.name,
      type: "line" as const,
      smooth: 0.35,
      symbol: "circle",
      symbolSize: 7,
      showSymbol: rows.length <= 14,
      lineStyle: { width: 2.5, color: s.color },
      itemStyle: { color: s.color, borderWidth: 2, borderColor: "#fff" },
      emphasis: { focus: "series" as const },
      data: seriesValues(rows, s.key),
    })),
  };
}

export function singleLineChartOption(
  categories: string[],
  values: number[],
  color: string,
  name?: string,
  valueFormatter?: (value: number) => string,
): EChartsOption {
  const seriesName = name ?? "";
  const rows = categories.map((label, i) => ({ label, count: values[i] ?? 0 }));
  return multiLineChartOption(
    categories,
    rows,
    [{ key: "count", name: seriesName, color }],
    valueFormatter,
  );
}

export function stackedBarChartOption(
  categories: string[],
  rows: object[],
  series: LineSeriesDef[],
  valueFormatter?: (value: number) => string,
): EChartsOption {
  return {
    animationDuration: 650,
    grid: CHART_GRID_WITH_LEGEND,
    tooltip: axisTooltip(valueFormatter),
    legend: bottomLegend(series.map((s) => s.name)),
    xAxis: { ...categoryAxis(categories), boundaryGap: true },
    yAxis: valueAxis(valueFormatter),
    series: series.map((s, index) => ({
      name: s.name,
      type: "bar" as const,
      stack: "total",
      barMaxWidth: 36,
      itemStyle: {
        color: s.color,
        borderRadius:
          index === series.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0],
      },
      emphasis: { focus: "series" as const },
      data: seriesValues(rows, s.key),
    })),
  };
}

export function verticalBarChartOption(
  categories: string[],
  values: number[],
  color: string,
  name?: string,
  valueFormatter?: (value: number) => string,
): EChartsOption {
  const seriesName = name ?? "";
  return {
    animationDuration: 650,
    grid: seriesName ? CHART_GRID_WITH_LEGEND : CHART_GRID,
    tooltip: axisTooltip(valueFormatter),
    ...(seriesName ? { legend: bottomLegend([seriesName]) } : {}),
    xAxis: categoryAxis(categories),
    yAxis: valueAxis(valueFormatter),
    series: [
      {
        name: seriesName,
        type: "bar",
        barMaxWidth: 40,
        itemStyle: { color, borderRadius: [6, 6, 0, 0] },
        data: values,
      },
    ],
  };
}

export function groupedBarChartOption(
  categories: string[],
  rows: object[],
  series: LineSeriesDef[],
  valueFormatter?: (value: number) => string,
): EChartsOption {
  return {
    animationDuration: 650,
    grid: CHART_GRID_WITH_LEGEND,
    tooltip: axisTooltip(valueFormatter),
    legend: bottomLegend(series.map((s) => s.name)),
    xAxis: categoryAxis(categories),
    yAxis: valueAxis(valueFormatter),
    series: series.map((s) => ({
      name: s.name,
      type: "bar" as const,
      barMaxWidth: 28,
      barGap: "20%",
      itemStyle: { color: s.color, borderRadius: [6, 6, 0, 0] },
      emphasis: { focus: "series" as const },
      data: seriesValues(rows, s.key),
    })),
  };
}

export function coloredVerticalBarChartOption(
  data: ColoredDatum[],
  valueFormatter?: (value: number) => string,
): EChartsOption {
  return {
    animationDuration: 650,
    grid: CHART_GRID_WITH_LEGEND,
    tooltip: axisTooltip(valueFormatter),
    legend: bottomLegend(data.map((d) => d.name)),
    xAxis: categoryAxis(data.map((d) => d.name)),
    yAxis: valueAxis(valueFormatter),
    series: [
      {
        type: "bar",
        barMaxWidth: 40,
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color, borderRadius: [6, 6, 0, 0] },
        })),
      },
    ],
  };
}

export function horizontalBarChartOption(
  data: ColoredDatum[],
  valueFormatter?: (value: number) => string,
): EChartsOption {
  return {
    animationDuration: 650,
    grid: { ...CHART_GRID_WITH_LEGEND, left: 8 },
    tooltip: axisTooltip(valueFormatter),
    legend: bottomLegend(data.map((d) => d.name)),
    xAxis: valueAxis(valueFormatter),
    yAxis: {
      type: "category",
      data: data.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: CHART_AXIS_COLOR,
        fontSize: 11,
        width: 96,
        overflow: "truncate",
      },
    },
    series: [
      {
        type: "bar",
        barMaxWidth: 22,
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color, borderRadius: [0, 6, 6, 0] },
        })),
      },
    ],
  };
}
