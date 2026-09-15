import { parseRouterPortDisplay } from "@/lib/routerUtils";

export interface ParsedOnlineHost {
  /** Full host for URLs, e.g. 10.15.1.155:8080 */
  host: string;
  ip: string;
  port: string | null;
}

function normalizePortToken(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  return trimmed.startsWith(":") ? trimmed.slice(1) : trimmed;
}

/** Parse MikroTik online host (IP or IP:port). */
export function parseOnlineHost(value: string | null | undefined): ParsedOnlineHost | null {
  const raw = value?.trim();
  if (!raw) return null;

  const lastColon = raw.lastIndexOf(":");
  if (lastColon > 0 && /^\d+$/.test(raw.slice(lastColon + 1))) {
    const ip = raw.slice(0, lastColon);
    const port = raw.slice(lastColon + 1);
    return { host: `${ip}:${port}`, ip, port };
  }

  return { host: raw, ip: raw, port: null };
}

export function resolveConfiguredPort(
  routerPort: string | number | null | undefined,
): string | null {
  return normalizePortToken(parseRouterPortDisplay(routerPort).display);
}

/** Prefer live online host; fall back to configured port only. */
export function resolveSubscriberConnectionHost(options: {
  onlineHost?: string | null;
  routerPort?: string | number | null;
}): ParsedOnlineHost | null {
  const parsedOnline = parseOnlineHost(options.onlineHost);
  const configuredPort = resolveConfiguredPort(options.routerPort);

  if (parsedOnline?.ip) {
    if (!parsedOnline.port && configuredPort) {
      return {
        host: `${parsedOnline.ip}:${configuredPort}`,
        ip: parsedOnline.ip,
        port: configuredPort,
      };
    }
    return parsedOnline;
  }

  if (!configuredPort) return null;

  return {
    host: `:${configuredPort}`,
    ip: "",
    port: configuredPort,
  };
}

export function formatConnectionHostLabel(parsed: ParsedOnlineHost | null): string | null {
  if (!parsed) return null;
  if (parsed.ip && parsed.port) return `${parsed.ip}:${parsed.port}`;
  if (parsed.ip) return parsed.ip;
  if (parsed.port) return `:${parsed.port}`;
  return null;
}

export function buildAccessUrl(host: string | null | undefined): string | null {
  const parsed = parseOnlineHost(host);
  if (!parsed?.ip) return null;
  return `http://${parsed.host}`;
}

export function buildAccessUrlFromConnection(options: {
  onlineHost?: string | null;
  routerPort?: string | number | null;
}): string | null {
  const parsed = resolveSubscriberConnectionHost(options);
  if (!parsed?.ip) return null;
  return `http://${parsed.host}`;
}
