import AppError from "../../utils/appError";
import { callTweetSmsApi } from "./tweetsms.http";

export const TWEETSMS_URL = "https://www.tweetsms.ps/api.php";
const SMS_REQUEST_TIMEOUT_MS = 15_000;
const SMS_SEND_TIMEOUT_MS = 45_000;
const SMS_SEND_MAX_ATTEMPTS = 5;
const SMS_SEND_RETRY_BASE_MS = 2_000;

const TWEETSMS_ERROR_MESSAGES: Record<number, string> = {
  2: "Invalid destination number or unsupported country",
  100: "Missing required fields (user, pass, to, message, sender)",
  102: "Missing required fields (phone, message, or sender)",
  103: "Insufficient TweetSMS balance",
  110: "Invalid TweetSMS username or password — check TWEETSMS_USER and TWEETSMS_PASSWORD",
  113: "Insufficient TweetSMS balance",
  115: "Sender ID (SMS_SENDER) is not enabled on your TweetSMS account",
  116: "Invalid sender name",
  999: "TweetSMS send failed",
};

type TweetSmsInterpretation =
  | { ok: true; value: string }
  | { ok: false; code: number; message: string };

function tweetSmsPass(): string {
  return (process.env.TWEETSMS_PASSWORD ?? "").trim() || (process.env.TWEETSMS_API_KEY ?? "").trim();
}

function tweetSmsSender(): string {
  return (process.env.SMS_SENDER ?? "").trim() || "WeNet";
}

export function isTweetSmsConfigured(): boolean {
  const pass = tweetSmsPass();
  const user = (process.env.TWEETSMS_USER ?? "").trim();
  return Boolean(user && pass);
}

function tweetSmsErrorMessage(code: number): string {
  return TWEETSMS_ERROR_MESSAGES[code] ?? `TweetSMS error (code -${code})`;
}

function previewBody(body: string, max = 240): string {
  return body.replace(/\s+/g, " ").trim().slice(0, max);
}

function isHtmlResponse(body: string): boolean {
  const trimmed = body.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype html") ||
    trimmed.startsWith("<html") ||
    trimmed.includes("<h1>unauthorized</h1>")
  );
}

export function interpretTweetSmsResult(result: unknown): TweetSmsInterpretation {
  if (typeof result === "number") {
    if (result < 0) {
      const code = Math.abs(result);
      return { ok: false, code, message: tweetSmsErrorMessage(code) };
    }
    if (result > 0) {
      return { ok: true, value: String(result) };
    }
    return { ok: false, code: 0, message: "SMS send failed" };
  }

  if (typeof result === "string") {
    const trimmed = result.trim();
    const withoutHtml = trimmed.replace(/<br\s*\/?>/gi, "").trim();
    const lower = withoutHtml.toLowerCase();

    if (lower.includes("unauthorized")) {
      return { ok: false, code: 110, message: tweetSmsErrorMessage(110) };
    }

    if (lower === "u") {
      return { ok: false, code: 0, message: "Unknown message status from TweetSMS" };
    }

    if (/^u:\d+:\d+:\d+$/i.test(withoutHtml)) {
      return { ok: true, value: withoutHtml };
    }

    if (/^\d+:\d+:\d+$/.test(withoutHtml) || withoutHtml === "1") {
      return { ok: true, value: withoutHtml };
    }

    if (/^1:\d+:\d+/i.test(withoutHtml)) {
      return { ok: true, value: withoutHtml };
    }

    const numeric = Number(withoutHtml);
    if (!Number.isNaN(numeric) && withoutHtml !== "") {
      if (numeric < 0) {
        const code = Math.abs(numeric);
        return { ok: false, code, message: tweetSmsErrorMessage(code) };
      }
      if (numeric > 0) {
        return { ok: true, value: trimmed };
      }
      return { ok: false, code: 0, message: "SMS send failed" };
    }

    if (lower.includes("error") || lower.includes("fail") || lower === "false") {
      return { ok: false, code: 0, message: trimmed || "SMS send failed" };
    }

    if (trimmed) {
      return { ok: false, code: 0, message: `Unexpected TweetSMS response: ${trimmed}` };
    }
  }

  if (result && typeof result === "object") {
    const payload = result as Record<string, unknown>;
    const status = String(payload.status ?? payload.success ?? "").toLowerCase();
    const error = payload.error ?? payload.message ?? payload.msg;

    if (status === "error" || status === "fail" || status === "failed" || status === "false") {
      return { ok: false, code: 0, message: String(error ?? "SMS send failed") };
    }

    if (error && (payload.success === false || payload.ok === false)) {
      return { ok: false, code: 0, message: String(error) };
    }

    return { ok: true, value: previewBody(JSON.stringify(payload)) };
  }

  return { ok: false, code: 0, message: "Unexpected TweetSMS response" };
}

function buildTweetSmsParams(comm: string, extra: Record<string, string> = {}): URLSearchParams {
  const params = new URLSearchParams({ comm, ...extra });
  const user = (process.env.TWEETSMS_USER ?? "").trim();
  const pass = tweetSmsPass();

  if (user) {
    params.set("user", user);
    params.set("pass", pass);
  } else if (process.env.TWEETSMS_API_KEY) {
    params.set("api_key", process.env.TWEETSMS_API_KEY);
  }

  if (extra.to) params.set("to", extra.to);
  if (extra.message) params.set("message", extra.message);
  if (comm === "sendsms") {
    params.set("sender", tweetSmsSender());
  }

  return params;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientTweetSmsError(err: unknown): boolean {
  if (!(err instanceof AppError)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("timed out") ||
    msg.includes("cannot reach tweetsms") ||
    msg.includes("failed to reach") ||
    msg.includes("fetch failed") ||
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    msg.includes("etimedout") ||
    msg.includes("eai_again") ||
    msg.includes("socket hang up") ||
    msg.includes("network") ||
    msg.includes("vpn")
  );
}

async function readTweetSmsBody(text: string): Promise<unknown> {
  if (isHtmlResponse(text)) {
    throw new AppError(tweetSmsErrorMessage(110), 502);
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function requestTweetSms(params: URLSearchParams, timeoutMs = SMS_REQUEST_TIMEOUT_MS): Promise<unknown> {
  const text = await callTweetSmsApi(params, timeoutMs);
  return readTweetSmsBody(text);
}

async function requestTweetSmsWithRetry(
  params: URLSearchParams,
  timeoutMs: number,
): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= SMS_SEND_MAX_ATTEMPTS; attempt++) {
    try {
      return await requestTweetSms(params, timeoutMs);
    } catch (err) {
      lastError = err;
      const canRetry = attempt < SMS_SEND_MAX_ATTEMPTS && isTransientTweetSmsError(err);
      if (!canRetry) throw err;
      await sleep(SMS_SEND_RETRY_BASE_MS * attempt);
    }
  }

  throw lastError;
}

function assertConfigured(): void {
  if (!tweetSmsPass()) {
    throw new AppError(
      "SMS provider is not configured (TWEETSMS_PASSWORD or TWEETSMS_API_KEY)",
      503,
    );
  }

  if (!(process.env.TWEETSMS_USER ?? "").trim()) {
    throw new AppError("SMS provider is not configured (TWEETSMS_USER)", 503);
  }
}

function assertTweetSmsSuccess(result: unknown): string {
  const interpreted = interpretTweetSmsResult(result);
  if (!interpreted.ok) {
    throw new AppError(interpreted.message, 502);
  }
  return interpreted.value;
}

/** Send one SMS via TweetSMS HTTP API (user + pass auth). */
export async function sendTweetSms(phone: string, message: string): Promise<string> {
  assertConfigured();

  const params = buildTweetSmsParams("sendsms", { to: phone, message });
  const result = await requestTweetSmsWithRetry(params, SMS_SEND_TIMEOUT_MS);
  return assertTweetSmsSuccess(result);
}

export type TweetSmsConnectionStatus = {
  configured: boolean;
  sender: string;
  ok: boolean;
  error: string | null;
  balance: string | null;
  responsePreview: string | null;
};

/** Balance check — does not send an SMS. */
export async function checkTweetSmsConnection(): Promise<TweetSmsConnectionStatus> {
  const sender = tweetSmsSender();
  const base: TweetSmsConnectionStatus = {
    configured: isTweetSmsConfigured(),
    sender,
    ok: false,
    error: null,
    balance: null,
    responsePreview: null,
  };

  if (!base.configured) {
    return {
      ...base,
      error: "Missing TWEETSMS_USER and TWEETSMS_PASSWORD (or TWEETSMS_API_KEY)",
    };
  }

  try {
    const params = buildTweetSmsParams("chk_balance");
    const result = await requestTweetSms(params);
    const interpreted = interpretTweetSmsResult(result);
    const preview = previewBody(typeof result === "string" ? result : JSON.stringify(result));

    if (interpreted.ok) {
      return {
        ...base,
        ok: true,
        balance: interpreted.value,
        responsePreview: preview,
      };
    }

    return {
      ...base,
      error: interpreted.message,
      responsePreview: preview,
    };
  } catch (err) {
    return {
      ...base,
      error: err instanceof AppError ? err.message : "TweetSMS connection check failed",
    };
  }
}
