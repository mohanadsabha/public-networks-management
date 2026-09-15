import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ConnectionFlowDiagram,
  ConnectionPathText,
  VpnStatusSection,
} from "@/components/pages/settings";
import { ProfileSection } from "@/components/ui/profile";
import { Heading, Text } from "@/components/ui/typography";
import { useConnectionFlow } from "@/hooks/useConnectionFlow";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { ApiError } from "@/types/api";

export function SettingsVpnPage() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const { vpn, mikrotik, refreshAll, preview } = useConnectionFlow();

  const handleRefreshAll = async () => {
    try {
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span>
          {t("settings.vpn.backToSettings")}
        </Link>
        <Heading as="h1">{t("settings.vpn.pageTitle")}</Heading>
        <Text muted className="mt-2 max-w-2xl">
          <ConnectionPathText />
        </Text>
      </div>

      <ProfileSection
        title={t("settings.vpn.flow.sectionTitle")}
        description={<ConnectionPathText />}
      >
        <ConnectionFlowDiagram
          preview={preview}
          statusReady={vpn.hasInitialStatus}
          vpnEnabled={vpn.enabled}
          vpnStatus={vpn.status}
          connectedTo={mikrotik.connectedTo}
          mikrotikConnected={mikrotik.isConnected}
          onlineCount={mikrotik.onlineCount}
        />
        {vpn.syncTime && vpn.syncTime > 0 ? (
          <Text muted className="mt-4 text-center text-sm">
            {t("settings.vpn.syncEveryMinutes", { minutes: vpn.syncTime })}
          </Text>
        ) : null}
      </ProfileSection>

      <ProfileSection
        title={t("settings.vpn.sectionTitle")}
        description={t("settings.vpn.sectionHint")}
      >
        <VpnStatusSection
          vpn={vpn}
          canManage={canManage}
          embedded
          onRefresh={handleRefreshAll}
          isRefreshing={vpn.isRefreshing || mikrotik.isRefreshing}
        />
      </ProfileSection>
    </div>
  );
}
