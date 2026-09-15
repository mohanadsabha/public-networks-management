/**
 * Default theme color presets.
 * Later: user picks a preset and we apply via applyThemeColors().
 */
export const themePresets = {
  wewifi: {
    name: "WeWiFi",
    primary: "234 88 12",
    primaryHover: "194 65 12",
    accent: "20 184 166",
    sidebar: "15 23 42",
  },
  ocean: {
    name: "Ocean",
    primary: "59 130 246",
    primaryHover: "37 99 235",
    accent: "6 182 212",
    sidebar: "15 23 42",
  },
  emerald: {
    name: "Emerald",
    primary: "16 185 129",
    primaryHover: "5 150 105",
    accent: "20 184 166",
    sidebar: "15 23 42",
  },
} as const;

export type ThemePresetKey = keyof typeof themePresets;

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  sidebar: string;
}

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  primary: "--color-primary",
  primaryHover: "--color-primary-hover",
  accent: "--color-accent",
  sidebar: "--color-sidebar",
};

/** Apply custom RGB triplets (e.g. "245 166 35") to CSS variables on :root */
export function applyThemeColors(colors: Partial<ThemeColors>): void {
  const root = document.documentElement;
  (Object.entries(colors) as [keyof ThemeColors, string][]).forEach(
    ([key, value]) => {
      const cssVar = CSS_VAR_MAP[key];
      if (cssVar && value) {
        root.style.setProperty(cssVar, value);
      }
    },
  );
}

export function applyThemePreset(preset: ThemePresetKey): void {
  const p = themePresets[preset];
  applyThemeColors({
    primary: p.primary,
    primaryHover: p.primaryHover,
    accent: p.accent,
    sidebar: p.sidebar,
  });
}

export const THEME_STORAGE_KEY = "wewifi-theme-preset";
