import { useTranslation } from "react-i18next";
import { formatConnectionHostLabel, parseOnlineHost } from "@/lib/subscriberConnection";
import { cn } from "@/lib/cn";

interface SubscriberConnectionBadgeProps {
  username: string | null | undefined;
  /** Host from MikroTik online-users (IP or IP:port) */
  onlineHost?: string | null;
  className?: string;
  /** Shorter label + tighter padding for dense tables */
  compact?: boolean;
}

export function SubscriberConnectionBadge({
  username,
  onlineHost = null,
  className,
  compact = false,
}: SubscriberConnectionBadgeProps) {
  const { t } = useTranslation();
  const hasUsername = Boolean(username?.trim());

  if (!hasUsername) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)} title={t("subscribers.connection.noUsername")}>
        —
      </span>
    );
  }

  const parsed = parseOnlineHost(onlineHost);
  const hostLabel = formatConnectionHostLabel(parsed);
  const isConnected = Boolean(hostLabel);

  if (isConnected && parsed?.ip) {
    return (
      <a
        href={`http://${parsed.host}`}
        target="_blank"
        rel="noopener noreferrer"
        title={t("subscribers.status.openConnectedIp", { ip: hostLabel })}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded-md border border-success/45 bg-success/10 font-medium text-success transition-colors hover:bg-success/20",
          compact ? "px-1.5 py-0.5 text-[10px]" : "gap-1.5 px-2 py-0.5 text-xs",
          className,
        )}
        dir="ltr"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success 2xl:h-2 2xl:w-2" aria-hidden />
        <span className="truncate">{hostLabel}</span>
      </a>
    );
  }

  if (isConnected) {
    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded-md border border-success/45 bg-success/10 font-medium text-success",
          compact ? "px-1.5 py-0.5 text-[10px]" : "gap-1.5 px-2 py-0.5 text-xs",
          className,
        )}
        dir="ltr"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success 2xl:h-2 2xl:w-2" aria-hidden />
        <span className="truncate">{hostLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md border border-border/70 bg-muted/30 font-medium text-muted-foreground",
        compact ? "px-1.5 py-0.5 text-[10px]" : "gap-1.5 px-2 py-0.5 text-xs",
      )}
      title={t("subscribers.connection.offlineHint")}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40 2xl:h-2 2xl:w-2" aria-hidden />
      <span className="truncate">{t("subscribers.connection.offline")}</span>
    </span>
  );
}
