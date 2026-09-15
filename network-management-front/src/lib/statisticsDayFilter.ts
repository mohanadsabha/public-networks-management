import { addDays, format, parseISO, subDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export const STATISTICS_DAY_LOOKBACK = 7;

export function todayDateKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function oldestStatisticsDateKey(): string {
  return format(subDays(new Date(), STATISTICS_DAY_LOOKBACK), "yyyy-MM-dd");
}

export function formatStatisticsDateLabel(dateKey: string, lang: string): string {
  const locale = lang.startsWith("ar") ? ar : enUS;
  try {
    return format(parseISO(dateKey), "dd/MM/yyyy", { locale });
  } catch {
    return dateKey;
  }
}

export function shiftStatisticsDate(dateKey: string, days: number): string {
  return format(addDays(parseISO(dateKey), days), "yyyy-MM-dd");
}

export function canGoToOlderDay(dateKey: string): boolean {
  return dateKey > oldestStatisticsDateKey();
}

export function canGoToNewerDay(dateKey: string): boolean {
  return dateKey < todayDateKey();
}
