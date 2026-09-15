/** Split MikroTik session host from optional router remote port suffix (e.g. 192.168.1.5:8080). */
export function splitHostAndPort(address: string): { host: string; port: string | null } {
  const trimmed = address.trim();
  if (!trimmed) return { host: "", port: null };

  const match = /^(.*):(\d{1,5})$/.exec(trimmed);
  if (!match) return { host: trimmed, port: null };

  const host = match[1].trim();
  const port = match[2];
  if (!host) return { host: trimmed, port: null };
  return { host, port };
}
