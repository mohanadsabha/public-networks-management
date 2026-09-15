import type { Request } from "express";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "refreshToken",
  "accessToken",
  "currentPassword",
  "newPassword",
]);

function sanitizeValue(key: string, value: unknown, depth = 0): unknown {
  if (depth > 4) return "[nested]";
  if (value === null || value === undefined) return value;

  const lowerKey = key.toLowerCase();
  if (SENSITIVE_KEYS.has(key) || lowerKey.includes("password") || lowerKey.includes("token")) {
    return "[redacted]";
  }

  if (Array.isArray(value)) {
    if (value.length > 20) return `[array:${value.length}]`;
    return value.map((item, index) => sanitizeValue(String(index), item, depth + 1));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.entries(record).slice(0, 30);
    const sanitized: Record<string, unknown> = {};
    for (const [childKey, childValue] of entries) {
      sanitized[childKey] = sanitizeValue(childKey, childValue, depth + 1);
    }
    if (Object.keys(record).length > entries.length) {
      sanitized._truncated = Object.keys(record).length - entries.length;
    }
    return sanitized;
  }

  if (typeof value === "string" && value.length > 500) {
    return `${value.slice(0, 500)}…`;
  }

  return value;
}

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  if (Buffer.isBuffer(body)) return "[buffer]";
  return sanitizeValue("body", body);
}

export function formatActivitySubjectLabel(parts: {
  lineId?: string | null;
  name?: string | null;
  fallback?: string;
}): string {
  const line = parts.lineId?.trim();
  const name = parts.name?.trim();
  if (line && name) return `${line} · ${name}`;
  return name || line || parts.fallback || "";
}

export function buildActivityDetails(
  req: Request,
  extra?: Record<string, unknown> | string,
): string {
  const payload: Record<string, unknown> = {
    path: req.originalUrl.split("?")[0],
  };

  const queryKeys = Object.keys(req.query ?? {});
  if (queryKeys.length > 0) {
    payload.query = sanitizeBody(req.query);
  }

  if (req.body && typeof req.body === "object" && Object.keys(req.body).length > 0) {
    payload.body = sanitizeBody(req.body);
  }

  if (req.params && Object.keys(req.params).length > 0) {
    payload.params = req.params;
  }

  if (typeof extra === "string") {
    payload.note = extra;
  } else if (extra) {
    Object.assign(payload, extra);
  }

  return JSON.stringify(payload);
}
