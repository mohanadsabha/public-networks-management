import { useCallback, useEffect, useRef, useState } from "react";
import { VPN_API_LIVE } from "@/lib/vpnConfig";
import { vpnService, vpnStatusStreamUrl, type VpnCurrentStatus } from "@/services/vpn.service";
import { ApiError } from "@/types/api";
import type { VpnStatus } from "@/types/vpn";

const POLL_MS = 10_000;

function parseStatus(value: unknown): VpnStatus | null {
  if (
    value === "DISCONNECTED" ||
    value === "CONNECTING" ||
    value === "CONNECTED" ||
    value === "RECONNECTING" ||
    value === "ERROR"
  ) {
    return value;
  }
  return null;
}

export function useVpnStatus() {
  const [status, setStatus] = useState<VpnStatus>("DISCONNECTED");
  const [enabled, setEnabled] = useState(false);
  const [syncTime, setSyncTime] = useState<number | null>(null);
  const [streamLive, setStreamLive] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  /** False until the first REST poll completes — avoids flashing CONNECTED from SSE before real status. */
  const [hasInitialStatus, setHasInitialStatus] = useState(!VPN_API_LIVE);
  const esRef = useRef<EventSource | null>(null);
  const initialPollDoneRef = useRef(false);

  const applyStatus = useCallback((next: VpnCurrentStatus) => {
    setStatus(next.vpnStatus);
    setEnabled(next.enabled);
    setSyncTime(next.syncTime);
    setConnectionError(null);
  }, []);

  const pollStatus = useCallback(async () => {
    if (!VPN_API_LIVE) return;

    try {
      const next = await vpnService.getCurrentStatus();
      applyStatus(next);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to reach VPN API";
      setConnectionError(message);
      setStreamLive(false);
    } finally {
      if (!initialPollDoneRef.current) {
        initialPollDoneRef.current = true;
        setHasInitialStatus(true);
      }
    }
  }, [applyStatus]);

  const connectStream = useCallback(() => {
    if (!VPN_API_LIVE) return;

    esRef.current?.close();
    const es = new EventSource(vpnStatusStreamUrl(), { withCredentials: true });
    esRef.current = es;

    es.onopen = () => setStreamLive(true);

    es.onmessage = (event) => {
      if (!initialPollDoneRef.current) return;

      try {
        const payload = JSON.parse(event.data) as { status?: unknown; enabled?: unknown };
        const next = parseStatus(payload.status);
        if (next) {
          setStatus(next);
          setConnectionError(null);
        }
        if (typeof payload.enabled === "boolean") {
          setEnabled(payload.enabled);
        }
      } catch {
        // ignore malformed SSE payloads
      }
    };

    es.onerror = () => {
      setStreamLive(false);
      es.close();
      esRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!VPN_API_LIVE) return;

    void (async () => {
      await pollStatus();
      connectStream();
    })();

    const pollId = setInterval(() => {
      void pollStatus();
    }, POLL_MS);

    const retryStream = setInterval(() => {
      if (!esRef.current || esRef.current.readyState === EventSource.CLOSED) {
        connectStream();
      }
    }, 5000);

    return () => {
      clearInterval(pollId);
      clearInterval(retryStream);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [connectStream, pollStatus]);

  const refresh = useCallback(async (): Promise<VpnStatus> => {
    if (!VPN_API_LIVE) return status;

    setIsRefreshing(true);
    try {
      const next = await vpnService.getCurrentStatus();
      applyStatus(next);
      if (!initialPollDoneRef.current) {
        initialPollDoneRef.current = true;
        setHasInitialStatus(true);
      }
      if (!streamLive) connectStream();
      return next.vpnStatus;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to reach VPN API";
      setConnectionError(message);
      return status;
    } finally {
      setIsRefreshing(false);
    }
  }, [applyStatus, connectStream, status, streamLive]);

  const enable = useCallback(async () => {
    if (!VPN_API_LIVE) return;

    setIsEnabling(true);
    try {
      await vpnService.enable();
      setEnabled(true);
      setStatus("CONNECTING");
      setConnectionError(null);
      setHasInitialStatus(true);
      if (!streamLive) connectStream();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to enable VPN";
      setConnectionError(message);
      throw err;
    } finally {
      setIsEnabling(false);
    }
  }, [connectStream, streamLive]);

  const disable = useCallback(async () => {
    if (!VPN_API_LIVE) return;

    setIsDisabling(true);
    try {
      await vpnService.disable();
      setEnabled(false);
      setStatus("DISCONNECTED");
      setConnectionError(null);
      setHasInitialStatus(true);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to disable VPN";
      setConnectionError(message);
      throw err;
    } finally {
      setIsDisabling(false);
    }
  }, []);

  const isBusy = isRefreshing || isEnabling || isDisabling;

  return {
    apiLive: VPN_API_LIVE,
    status,
    enabled,
    syncTime,
    streamLive,
    connectionError,
    isRefreshing,
    isEnabling,
    isDisabling,
    isBusy,
    hasInitialStatus,
    refresh,
    enable,
    disable,
  };
}
