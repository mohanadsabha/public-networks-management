export const CHART_COLORS = {
  primary: "#ea580c",
  accent: "#14b8a6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#64748b",
  secondary: "#1e293b",
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.accent,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.muted,
] as const;
