/** Store router port as plain digits in numeric column (e.g. "8080", not ":8080"). */
export function normalizeRouterPortForDb(port: string | null | undefined): string | null {
  if (port == null) return null;
  const trimmed = port.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/^:/, "").trim();
  if (!/^\d+$/.test(digits)) return null;
  const num = Number(digits);
  if (!Number.isFinite(num) || num <= 0 || num > 65535) return null;
  return digits;
}
