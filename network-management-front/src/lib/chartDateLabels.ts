const MONTH_SHORT_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const MONTH_SHORT_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function chartMonthLabel(monthKey: string, lang: string): string {
  const [y, mo] = monthKey.split("-");
  const idx = parseInt(mo, 10) - 1;
  const names = lang.startsWith("ar") ? MONTH_SHORT_AR : MONTH_SHORT_EN;
  return `${names[idx] ?? mo} ${y}`;
}

export function chartDayLabel(dateKey: string, lang: string): string {
  const [, mo, da] = dateKey.split("-");
  return lang.startsWith("ar") ? `${da}/${mo}` : `${mo}/${da}`;
}
