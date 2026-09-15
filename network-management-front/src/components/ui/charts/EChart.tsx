import { useEffect, useMemo, useRef } from "react";
import type { EChartsOption } from "echarts";
import { echarts } from "@/components/ui/charts/echartsCore";
import { cn } from "@/lib/cn";

interface EChartProps {
  option: EChartsOption;
  className?: string;
  /** Re-run setOption when this changes (e.g. language). */
  refreshKey?: string;
}

export function EChart({ option, className, refreshKey }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  const stableOption = useMemo(() => option, [option, refreshKey]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const instance = echarts.init(el, undefined, { renderer: "canvas" });
    chartRef.current = instance;

    const resize = () => instance.resize();
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      instance.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(stableOption, { notMerge: true, lazyUpdate: false });
  }, [stableOption]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full min-h-[200px] min-w-0", className)}
      role="img"
    />
  );
}
