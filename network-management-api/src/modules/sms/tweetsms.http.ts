import https from "node:https";
import { URL } from "node:url";
import AppError from "../../utils/appError";

const TWEETSMS_HOST = "www.tweetsms.ps";
const TWEETSMS_PATH = "/api.php";

/** Shared keep-alive agent — IPv4 only (avoids Docker IPv6/DNS flakiness). */
const tweetSmsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 4,
  family: 4,
});

function unwrapNetworkError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Cannot reach TweetSMS";
  }

  const cause = (err as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    const code = "code" in cause ? String((cause as NodeJS.ErrnoException).code ?? "") : "";
    if (code) {
      return `Cannot reach TweetSMS (${code})`;
    }
    if (cause.message) {
      return `Cannot reach TweetSMS (${cause.message})`;
    }
  }

  if (err.message === "fetch failed") {
    return "Cannot reach TweetSMS — server lost outbound internet (often caused by VPN routing all traffic through the tunnel)";
  }

  return err.message || "Cannot reach TweetSMS";
}

export function callTweetSmsApi(params: URLSearchParams, timeoutMs: number): Promise<string> {
  const query = params.toString();
  const url = new URL(`${TWEETSMS_PATH}?${query}`, `https://${TWEETSMS_HOST}`);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: "https:",
        hostname: url.hostname,
        port: 443,
        path: `${url.pathname}${url.search}`,
        method: "GET",
        agent: tweetSmsAgent,
        family: 4,
        headers: {
          Accept: "text/plain, application/json",
          "User-Agent": "WeWiFi-SMS/1.0",
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode && res.statusCode >= 400) {
            reject(new AppError(`TweetSMS HTTP ${res.statusCode}`, 502));
            return;
          }
          resolve(text);
        });
      },
    );

    const timer = setTimeout(() => {
      req.destroy(new Error("TweetSMS request timed out"));
    }, timeoutMs);

    req.on("error", (err) => {
      clearTimeout(timer);
      reject(new AppError(unwrapNetworkError(err), 502));
    });

    req.on("close", () => clearTimeout(timer));
    req.end();
  });
}

export function destroyTweetSmsAgent(): void {
  tweetSmsAgent.destroy();
}
