export function formatMoney(amount: number, locale?: string): string {
  const value = Number(amount) || 0;
  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ₪`;
}

export function formatMoneyILS(value: number): string {
  if (!Number.isFinite(value)) return "0 ₪";
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `${text} ₪`;
}
