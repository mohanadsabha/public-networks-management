import { Gauge, RefreshCw, RotateCcw, UserPlus, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpeedTierPicker } from "@/components/pages/speeds";
import { Button } from "@/components/ui/buttons";
import {
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableClass,
  dataTableHeadCellClass,
  dataTableHeadRowClass,
  dataTableWrapClass,
  LtrText,
} from "@/components/ui/data";
import { ProfileSection } from "@/components/ui/profile";
import { Text } from "@/components/ui/typography";
import { buildSpeedLabel } from "@/lib/subscriberUtils";
import type { SpeedTier } from "@/types/speeds";
import type { SpeedHistoryEntry, UsernameHistoryEntry } from "@/types/subscriber";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/cn";

interface SubscriberUsernameTabProps {
  usernameHistory: UsernameHistoryEntry[];
  speedHistory: SpeedHistoryEntry[];
  canManage?: boolean;
  isStopped?: boolean;
  currentUsername?: string | null;
  showAssign?: boolean;
  showChange?: boolean;
  speedTiers?: SpeedTier[];
  resolvedSpeedId?: number | null;
  onPickUsername?: (speedId: number, speedMbps: number) => void;
  showRenew?: boolean;
  onRenewUsername?: () => void;
  isRenewing?: boolean;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return value;
  }
}

export function SubscriberUsernameTab({
  usernameHistory,
  speedHistory,
  canManage = false,
  isStopped = false,
  currentUsername = null,
  showAssign = false,
  showChange = false,
  speedTiers = [],
  resolvedSpeedId = null,
  onPickUsername,
  showRenew = false,
  onRenewUsername,
  isRenewing = false,
}: SubscriberUsernameTabProps) {
  const { t } = useTranslation();
  const [selectedSpeedId, setSelectedSpeedId] = useState<number | null>(resolvedSpeedId);
  const canPickSpeed = canManage && speedTiers.length > 0;

  const selectedTier = useMemo(
    () => speedTiers.find((tier) => tier.id === selectedSpeedId) ?? null,
    [speedTiers, selectedSpeedId],
  );

  const canPickFromPool = Boolean(selectedTier);

  useEffect(() => {
    if (resolvedSpeedId != null) {
      setSelectedSpeedId(resolvedSpeedId);
      return;
    }
    if (currentUsername) {
      setSelectedSpeedId(speedTiers[0]?.id ?? null);
      return;
    }
    setSelectedSpeedId(null);
  }, [resolvedSpeedId, speedTiers, currentUsername]);

  const openPicker = () => {
    if (!selectedTier) return;
    onPickUsername?.(selectedTier.id, selectedTier.valueMbps);
  };

  return (
    <div className="space-y-6">
      {canPickSpeed ? (
        <ProfileSection
          title={t("subscribers.username.speedSectionTitle")}
          description={t("subscribers.username.speedSectionHint")}
        >
          <SpeedTierPicker
            tiers={speedTiers}
            selectedId={selectedSpeedId}
            onSelect={(tier) => setSelectedSpeedId(tier.id)}
          />
          {!selectedSpeedId && showAssign ? (
            <Text muted className="mt-3 text-sm">{t("subscribers.username.pickSpeedForPool")}</Text>
          ) : null}
          <Text muted className="mt-3 text-xs">
            {t("subscribers.profile.speedEditHint")}
          </Text>
          {selectedTier ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Gauge className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <Text className="text-xs font-medium text-muted-foreground">
                  {t("subscribers.username.poolSpeedLabel")}
                </Text>
                <Text className="mt-0.5 text-sm font-semibold">
                  {buildSpeedLabel(selectedTier.valueMbps)}
                </Text>
                <Text muted className="mt-1 text-xs" dir="ltr">
                  {selectedTier.label} · {t("speeds.stats.price", { price: selectedTier.price })}
                </Text>
                <Text muted className="mt-1 text-xs">{t("subscribers.username.poolSpeedHint")}</Text>
              </div>
            </div>
          ) : null}
        </ProfileSection>
      ) : null}

      {isStopped ? (
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-gradient-to-r from-danger/10 to-danger/5 px-4 py-4 sm:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-danger">
            <UserRound className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <Text className="text-sm font-semibold">{t("subscribers.username.stoppedTitle")}</Text>
            <Text muted className="mt-1 text-sm">
              {currentUsername
                ? t("subscribers.username.stoppedWithStaleUsername")
                : t("subscribers.username.stoppedNoUsername")}
            </Text>
          </div>
        </div>
      ) : null}

      {canManage && showAssign ? (
        <ProfileSection
          title={t("subscribers.username.assignFromPool")}
          description={t("subscribers.username.assignHint")}
          action={
            <Button size="sm" onClick={openPicker} disabled={!canPickFromPool}>
              <UserPlus className="h-4 w-4" />
              {t("subscribers.username.assignFromPool")}
            </Button>
          }
        >
          <span className="sr-only">{t("subscribers.username.assignFromPool")}</span>
        </ProfileSection>
      ) : null}

      {canManage && showChange ? (
        <ProfileSection
          title={t("subscribers.username.changeUsername")}
          description={t("subscribers.username.changeHint")}
          action={
            <div className="flex flex-wrap gap-2">
              {showRenew ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRenewUsername}
                  disabled={!resolvedSpeedId || isRenewing}
                  isLoading={isRenewing}
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("subscribers.username.renewUsername")}
                </Button>
              ) : null}
              <Button size="sm" onClick={openPicker} disabled={!canPickFromPool}>
                <RefreshCw className="h-4 w-4" />
                {t("subscribers.username.changeUsername")}
              </Button>
            </div>
          }
        >
          {showRenew ? (
            <Text muted className="text-sm">{t("subscribers.username.renewHint")}</Text>
          ) : (
            <span className="sr-only">{t("subscribers.username.changeUsername")}</span>
          )}
        </ProfileSection>
      ) : null}

      <ProfileSection title={t("subscribers.username.historyTitle")}>
        {usernameHistory.length === 0 ? (
          <Text muted className="text-sm">{t("subscribers.username.historyEmpty")}</Text>
        ) : (
          <div className={dataTableWrapClass}>
            <table className={dataTableClass}>
              <thead>
                <tr className={dataTableHeadRowClass}>
                  <th className={dataTableHeadCellClass}>{t("subscribers.table.username")}</th>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.usageStart")}</th>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.usageEnd")}</th>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.changeCauseColumn")}</th>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.changedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {usernameHistory.map((row) => (
                  <tr key={row.id} className={dataTableBodyRowClass}>
                    <td className={dataTableCellClass}>
                      <LtrText className="font-mono text-xs">{row.oldUsername}</LtrText>
                    </td>
                    <td className={dataTableCellClass}>{formatDate(row.usageStartDate)}</td>
                    <td className={dataTableCellClass}>{formatDate(row.usageEndDate)}</td>
                    <td className={dataTableCellClass}>{row.changeCause?.trim() || "—"}</td>
                    <td className={cn(dataTableCellClass, "text-muted-foreground")}>
                      {formatDate(row.changedAt.slice(0, 10))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ProfileSection>

      <ProfileSection title={t("subscribers.username.speedHistoryTitle")}>
        {speedHistory.length === 0 ? (
          <Text muted className="text-sm">{t("subscribers.username.speedHistoryEmpty")}</Text>
        ) : (
          <div className={dataTableWrapClass}>
            <table className={dataTableClass}>
              <thead>
                <tr className={dataTableHeadRowClass}>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.fromSpeed")}</th>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.toSpeed")}</th>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.daysUsed")}</th>
                  <th className={dataTableHeadCellClass}>{t("subscribers.username.changedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {speedHistory.map((row) => (
                  <tr key={row.id} className={dataTableBodyRowClass}>
                    <td className={dataTableCellClass}>
                      {row.oldSpeedMbps > 0 ? buildSpeedLabel(row.oldSpeedMbps) : "—"}
                    </td>
                    <td className={dataTableCellClass}>{buildSpeedLabel(row.newSpeedMbps)}</td>
                    <td className={dataTableCellClass}>{row.daysUsed ?? "—"}</td>
                    <td className={cn(dataTableCellClass, "text-muted-foreground")}>
                      {formatDate(row.changedAt.slice(0, 10))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ProfileSection>
    </div>
  );
}
