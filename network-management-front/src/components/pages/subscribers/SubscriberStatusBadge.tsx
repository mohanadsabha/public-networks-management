import { PauseCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SubscriberLifecycleStatus } from "@/types/subscriber";
import { parseOnlineHost } from "@/lib/subscriberConnection";
import { cn } from "@/lib/cn";

type ListStatus =
  | Extract<SubscriberLifecycleStatus, "active" | "expired" | "no_subscription" | "suspended">
  | "paused";

interface SubscriberStatusBadgeProps {
  status: ListStatus;
  /** MikroTik session active */
  isOnline?: boolean;
  /** Host for optional access link (IP or IP:port) */
  onlineIp?: string | null;
  /** MikroTik lookup in progress */
  connectionChecking?: boolean;
}

const activeCheckingClass =
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium border-warning/45 bg-warning/10 text-warning";

const activeOnlineClass =
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold border-success/50 bg-success/15 text-success";

const activeOfflineClass =
  "inline-flex items-center rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground";

export function SubscriberStatusBadge({
  status,
  isOnline = false,
  onlineIp,
  connectionChecking = false,
}: SubscriberStatusBadgeProps) {
  const { t } = useTranslation();
  const activeLabel = t("subscribers.status.active");

  if (status === "paused") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
          "border-warning/50 bg-warning/15 text-warning",
        )}
      >
        <PauseCircle className="h-3 w-3 shrink-0" aria-hidden />
        {t("subscribers.status.paused")}
      </span>
    );
  }

  if (status === "expired") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
          "border-danger/45 bg-danger/10 text-danger",
        )}
      >
        {t("subscribers.status.expired")}
      </span>
    );
  }

  if (status === "active" && connectionChecking) {
    return (
      <span className={activeCheckingClass}>
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-warning" aria-hidden />
        {t("subscribers.connection.checking")}
      </span>
    );
  }

  if (status === "active" && isOnline) {
    const parsed = parseOnlineHost(onlineIp);
    const accessUrl = parsed?.ip ? `http://${parsed.host}` : null;
    const content = (
      <>
        <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden />
        {activeLabel}
      </>
    );

    if (accessUrl) {
      return (
        <a
          href={accessUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={t("subscribers.status.openConnectedIp", { ip: parsed?.host ?? onlineIp ?? "" })}
          className={cn(activeOnlineClass, "transition-colors hover:bg-success/25")}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </a>
      );
    }

    return <span className={activeOnlineClass}>{content}</span>;
  }

  if (status === "active") {
    return <span className={activeOfflineClass}>{activeLabel}</span>;
  }

  if (status === "suspended") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
          "border-danger/45 bg-danger/10 text-danger",
        )}
      >
        {t("subscribers.status.suspended")}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {t(`subscribers.status.${status}`)}
    </span>
  );
}
