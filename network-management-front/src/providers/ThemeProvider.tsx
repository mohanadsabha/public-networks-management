import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyThemePreset,
  THEME_STORAGE_KEY,
  type ThemePresetKey,
} from "@/styles/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  preset: ThemePresetKey;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPreset: (preset: ThemePresetKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem("wewifi-theme-mode");
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

function getInitialPreset(): ThemePresetKey {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "wewifi" || stored === "ocean" || stored === "emerald") {
    return stored;
  }
  return "wewifi";
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [preset, setPresetState] = useState<ThemePresetKey>(getInitialPreset);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("wewifi-theme-mode", mode);
  }, [mode]);

  useEffect(() => {
    applyThemePreset(preset);
    localStorage.setItem(THEME_STORAGE_KEY, preset);
  }, [preset]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setPreset = useCallback((next: ThemePresetKey) => {
    setPresetState(next);
  }, []);

  const value = useMemo(
    () => ({ mode, preset, setMode, toggleMode, setPreset }),
    [mode, preset, setMode, toggleMode, setPreset],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
