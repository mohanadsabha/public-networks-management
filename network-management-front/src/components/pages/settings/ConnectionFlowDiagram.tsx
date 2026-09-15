import { Check, Cpu, Router, Shield, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import type { MikrotikConnectionMethod } from "@/types/mikrotikConnection";
import type { VpnStatus } from "@/types/vpn";

interface ConnectionFlowDiagramProps {
  preview: boolean;
  statusReady: boolean;
  vpnEnabled: boolean;
  vpnStatus: VpnStatus;
  connectedTo: MikrotikConnectionMethod | null;
  mikrotikConnected: boolean;
  onlineCount: number;
}

interface FlowNodeProps {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  active: boolean;
  badge?: string;
}

function FlowNode({ icon: Icon, label, sublabel, active, badge }: FlowNodeProps) {
  return (
    <div className="flex min-w-[6.5rem] flex-col items-center gap-2.5 text-center">
      <div
        className={cn(
          "relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl border-2 transition-all duration-300",
          active
            ? "border-success/50 bg-gradient-to-b from-success/15 to-success/5 text-success shadow-sm"
            : "border-border/80 bg-muted/20 text-muted-foreground",
        )}
      >
        <Icon className="h-9 w-9" strokeWidth={1.6} aria-hidden />
        {active ? (
          <span
            className="absolute -bottom-1.5 -end-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-success text-white shadow-md ring-2 ring-surface"
            aria-hidden
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        ) : null}
        {badge ? (
          <span className="absolute -top-1.5 -end-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-white shadow-md ring-2 ring-surface">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-0.5">
        <p
          className={cn(
            "text-sm font-semibold tracking-tight",
            active ? "text-success" : "text-muted-foreground",
          )}
          dir="ltr"
        >
          {label}
        </p>
        {sublabel ? (
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
      </div>
    </div>
  );
}

function FlowConnector({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "mx-1 mt-9 hidden h-0.5 min-w-[2.5rem] flex-1 rounded-full sm:mx-3 sm:block sm:min-w-[4.5rem]",
        active ? "bg-gradient-to-r from-success/20 via-success/60 to-success/20" : "bg-border",
      )}
      aria-hidden
    />
  );
}

function vpnNodeActive(status: VpnStatus, preview: boolean, statusReady: boolean): boolean {
  if (preview || !statusReady) return false;
  return status === "CONNECTED";
}

function middleNodeActive(
  preview: boolean,
  statusReady: boolean,
  vpnStatus: VpnStatus,
  mikrotikConnected: boolean,
): boolean {
  if (preview || !statusReady) return false;
  return vpnStatus === "CONNECTED" && mikrotikConnected;
}

export function ConnectionFlowDiagram({
  preview,
  statusReady,
  vpnEnabled,
  vpnStatus,
  connectedTo,
  mikrotikConnected,
  onlineCount,
}: ConnectionFlowDiagramProps) {
  const { t } = useTranslation();

  const vpnActive = vpnNodeActive(vpnStatus, preview, statusReady);
  const methodActive = middleNodeActive(preview, statusReady, vpnStatus, mikrotikConnected);
  const mikrotikActive = !preview && statusReady && mikrotikConnected;

  const MiddleIcon = preview ? Cpu : connectedTo === "SSH" ? Terminal : Cpu;

  const middleLabel = preview
    ? t("settings.vpn.flow.methodNode")
    : connectedTo === "SSH"
      ? t("settings.vpn.flow.viaSsh")
      : connectedTo === "API"
        ? t("settings.vpn.flow.viaApi")
        : t("settings.vpn.flow.methodWaiting");

  const middleSublabel = preview
    ? t("settings.vpn.flow.methodHint")
    : methodActive
      ? t("settings.vpn.flow.methodActive")
      : vpnActive
        ? t("settings.vpn.flow.methodPending")
        : undefined;

  const vpnSublabel = preview
    ? t("settings.vpn.flow.previewNode")
    : !statusReady
      ? t("settings.vpn.checkingStatus")
      : !vpnEnabled
        ? t("settings.vpn.powerOff")
        : vpnActive
          ? t("settings.vpn.flow.vpnActive")
          : t(`settings.vpn.status.${vpnStatus}`);

  const mikrotikSublabel = preview
    ? t("settings.vpn.flow.previewNode")
    : mikrotikActive
      ? t("settings.vpn.flow.mikrotikActive", { count: onlineCount })
      : vpnActive
        ? t("settings.vpn.flow.mikrotikPending")
        : t("settings.vpn.flow.mikrotikWaiting");

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-center sm:gap-0">
        <FlowNode
          icon={Shield}
          label={t("settings.vpn.flow.vpnNode")}
          sublabel={vpnSublabel}
          active={vpnActive}
        />

        <div
          className={cn(
            "h-6 w-0.5 rounded-full sm:hidden",
            vpnActive && (methodActive || mikrotikActive) ? "bg-success/50" : "bg-border",
          )}
          aria-hidden
        />

        <FlowConnector active={vpnActive && (methodActive || mikrotikActive)} />

        <FlowNode
          icon={MiddleIcon}
          label={middleLabel}
          sublabel={middleSublabel}
          active={methodActive}
        />

        <div
          className={cn(
            "h-6 w-0.5 rounded-full sm:hidden",
            methodActive && mikrotikActive ? "bg-success/50" : "bg-border",
          )}
          aria-hidden
        />

        <FlowConnector active={methodActive && mikrotikActive} />

        <FlowNode
          icon={Router}
          label={t("settings.vpn.flow.mikrotikNode")}
          sublabel={mikrotikSublabel}
          active={mikrotikActive}
          badge={mikrotikActive && onlineCount > 0 ? String(onlineCount) : undefined}
        />
      </div>

      {preview ? (
        <Text muted className="text-center text-sm">
          {t("settings.vpn.flow.previewBanner")}
        </Text>
      ) : !statusReady ? (
        <Text muted className="text-center text-sm">
          {t("settings.vpn.checkingStatus")}
        </Text>
      ) : !vpnEnabled ? (
        <Text muted className="text-center text-sm">
          {t("settings.vpn.flow.vpnDisabled")}
        </Text>
      ) : vpnStatus === "DISCONNECTED" && !mikrotikConnected ? (
        <Text muted className="text-center text-sm">
          {t("settings.vpn.flow.waitingVpn")}
        </Text>
      ) : null}
    </div>
  );
}
