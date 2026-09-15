import { Power, PowerOff, RefreshCw, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { Card } from "@/components/ui/cards";
import { StatusBadge, type StatusBadgeVariant } from "@/components/ui/data";
import { Text } from "@/components/ui/typography";
import type { useVpnStatus } from "@/hooks/useVpnStatus";
import { ApiError } from "@/types/api";
import type { VpnStatus } from "@/types/vpn";

function statusVariant(status: VpnStatus): StatusBadgeVariant {
  switch (status) {
    case "CONNECTED":
      return "success";
    case "CONNECTING":
    case "RECONNECTING":
      return "warning";
    case "ERROR":
      return "danger";
    default:
      return "muted";
  }
}

type VpnHookState = ReturnType<typeof useVpnStatus>;

interface VpnStatusSectionProps {
  vpn: VpnHookState;
  canManage?: boolean;
  embedded?: boolean;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

export function VpnStatusSection({
  vpn,
  canManage = false,
  embedded = false,
  onRefresh,
  isRefreshing: isRefreshingProp,
}: VpnStatusSectionProps) {
  const { t } = useTranslation();

  const {
    apiLive,
    status,
    enabled,
    streamLive,
    connectionError,
    isRefreshing: vpnRefreshing,
    isEnabling,
    isDisabling,
    isBusy,
    hasInitialStatus,
    refresh,
    enable,
    disable,
  } = vpn;

  const displayStatus: VpnStatus = apiLive && !hasInitialStatus ? "CONNECTING" : status;
  const isRefreshing = isRefreshingProp ?? vpnRefreshing;
  const showRefresh = enabled;

  const handleRefresh = async () => {
    if (!apiLive || !enabled) return;
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refresh();
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  const handleEnable = async () => {
    if (!apiLive || isBusy) return;
    try {
      await enable();
      toast.success(t("settings.vpn.enableSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  const handleDisable = async () => {
    if (!apiLive || isBusy) return;
    try {
      await disable();
      toast.success(t("settings.vpn.disableSuccess"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  const hintKey = apiLive
    ? !hasInitialStatus
      ? "settings.vpn.checkingStatus"
      : !enabled
        ? "settings.vpn.hint_DISABLED"
        : (`settings.vpn.hint_${status}` as const)
    : "settings.vpn.previewHint";

  const content = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{t("settings.vpn.title")}</p>
            {apiLive ? (
              !enabled ? (
                <StatusBadge label={t("settings.vpn.powerOff")} variant="muted" />
              ) : (
                <StatusBadge
                  label={
                    !hasInitialStatus
                      ? t("settings.vpn.checkingStatus")
                      : t(`settings.vpn.status.${displayStatus}`)
                  }
                  variant={statusVariant(displayStatus)}
                />
              )
            ) : (
              <StatusBadge label={t("settings.vpn.previewBadge")} variant="muted" />
            )}
            {apiLive ? (
              streamLive ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                  {t("settings.vpn.live")}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">{t("settings.vpn.offlineStream")}</span>
              )
            ) : (
              <span className="text-xs text-muted-foreground">{t("settings.vpn.previewMode")}</span>
            )}
          </div>
          <Text muted className="mt-2 text-sm">
            {connectionError
              ? t("settings.vpn.connectionError", { message: connectionError })
              : t(hintKey)}
          </Text>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {showRefresh ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            disabled={!apiLive || isBusy}
          >
            <RefreshCw className="h-4 w-4" />
            {t("settings.vpn.refresh")}
          </Button>
        ) : null}
        {canManage && apiLive ? (
          enabled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisable}
              isLoading={isDisabling}
              disabled={isBusy}
            >
              <PowerOff className="h-4 w-4" />
              {t("settings.vpn.disable")}
            </Button>
          ) : (
            <Button size="sm" onClick={handleEnable} isLoading={isEnabling} disabled={isBusy}>
              <Power className="h-4 w-4" />
              {t("settings.vpn.enable")}
            </Button>
          )
        ) : null}
      </div>
    </div>
  );

  if (embedded) return content;

  return <Card className="p-5">{content}</Card>;
}
