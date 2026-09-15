const APP_TIMEZONE = "Asia/Gaza";
const DATE_LOCALE = "en-GB";

function parseSnapshotValue(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date(Number.NaN);

  if (trimmed.includes("T")) {
    return new Date(trimmed);
  }

  // Legacy API values were UTC without a timezone suffix.
  return new Date(`${trimmed.replace(" ", "T")}Z`);
}

/** Palestine local time, always shown in English (Western digits). */
export function formatSnapshotDateTime(value: string): string {
  if (!value.trim()) return "—";

  const date = parseSnapshotValue(value);
  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat(DATE_LOCALE, {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
