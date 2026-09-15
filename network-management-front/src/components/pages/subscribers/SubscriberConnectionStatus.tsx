import { ExternalLink, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/typography";
import { buttonBaseClassName, buttonSizes, buttonVariants } from "@/components/ui/buttons/buttonStyles";
import {
  buildAccessUrlFromConnection,
  formatConnectionHostLabel,
  resolveConfiguredPort,
  resolveSubscriberConnectionHost,
} from "@/lib/subscriberConnection";
import { cn } from "@/lib/cn";
import type { MikrotikConnectionMethod } from "@/types/mikrotikConnection";

interface SubscriberConnectionStatusProps {
  isOnline: boolean;
  connectedTo?: MikrotikConnectionMethod | null;
  onlineHost?: string | null;
  routerPort?: string | number | null;
  accessUrl?: string | null;
  className?: string;
}

export function SubscriberConnectionStatus({
  isOnline,
  connectedTo = null,
  onlineHost = null,
  routerPort = null,
  accessUrl = null,
  className,
}: SubscriberConnectionStatusProps) {
  const { t } = useTranslation();
  const connection = resolveSubscriberConnectionHost({ onlineHost, routerPort });
  const hostLabel = formatConnectionHostLabel(connection);
  const configuredPort = resolveConfiguredPort(routerPort);
  const openUrl =
    accessUrl ??
    (isOnline ? buildAccessUrlFromConnection({ onlineHost, routerPort }) : null);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        isOnline
          ? "border-success/35 bg-gradient-to-br from-success/10 via-surface to-surface"
          : "border-border/70 bg-muted/15",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              isOnline ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
            )}
          >
            {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {isOnline ? t("subscribers.connection.connected") : t("subscribers.connection.offline")}
              </Text>
              {isOnline && connectedTo ? (
                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                  {connectedTo}
                </span>
              ) : null}
              {isOnline ? (
                <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
              ) : null}
            </div>

            {hostLabel ? (
              <p className="truncate font-mono text-sm font-medium text-foreground" dir="ltr">
                {hostLabel}
              </p>
            ) : configuredPort ? (
              <p className="text-sm text-foreground" dir="ltr">
                {t("subscribers.connection.portConfigured", { port: configuredPort })}
              </p>
            ) : (
              <Text muted className="text-xs">
                {isOnline
                  ? t("subscribers.connection.onlineNoHost")
                  : t("subscribers.connection.offlineHint")}
              </Text>
            )}
          </div>
        </div>

        {openUrl && isOnline ? (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonBaseClassName,
              buttonVariants.outline,
              buttonSizes.sm,
              "shrink-0 border-success/30 text-success hover:bg-success/10",
            )}
          >
            <ExternalLink className="h-4 w-4" />
            {t("subscribers.connection.openAccess")}
          </a>
        ) : null}
      </div>
    </div>
  );
}
