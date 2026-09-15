import { useMemo } from "react";
import { useTheme } from "@/providers/ThemeProvider";

export interface ChartThemeColors {
  /** Matches `text-foreground` — table body text in light, near-white in dark. */
  foreground: string;
  /** Matches `text-muted-foreground`. */
  mutedForeground: string;
  rowDivider: string;
  gridLine: string;
  tooltipBg: string;
  tooltipBorder: string;
}

function readCssRgbVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  return `rgb(${raw.split(/\s+/).join(", ")})`;
}

export function useChartThemeColors(): ChartThemeColors {
  const { mode } = useTheme();

  return useMemo(() => {
    const foreground = readCssRgbVar(
      "--color-foreground",
      mode === "dark" ? "rgb(241, 245, 249)" : "rgb(15, 32, 58)",
    );
    const mutedForeground = readCssRgbVar(
      "--color-muted-foreground",
      mode === "dark" ? "rgb(148, 163, 184)" : "rgb(92, 108, 132)",
    );

    return {
      foreground,
      mutedForeground,
      rowDivider: mode === "dark" ? "rgba(148,163,184,0.2)" : "rgba(148,163,184,0.26)",
      gridLine: mode === "dark" ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.14)",
      tooltipBg: mode === "dark" ? "rgba(15,23,42,0.96)" : "rgba(255,255,255,0.98)",
      tooltipBorder: mode === "dark" ? "rgb(51, 65, 85)" : "#e2e8f0",
    };
  }, [mode]);
}
