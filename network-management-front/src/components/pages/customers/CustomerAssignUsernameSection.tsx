import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SpeedTierPicker } from "@/components/pages/speeds";
import { Button } from "@/components/ui/buttons";
import { ProfileSection } from "@/components/ui/profile";
import { Text } from "@/components/ui/typography";
import { buildSpeedLabel } from "@/lib/subscriberUtils";
import type { SpeedTier } from "@/types/speeds";

interface CustomerAssignUsernameSectionProps {
  speedTiers: SpeedTier[];
  selectedSpeedId: number | null;
  onSpeedSelect: (tier: SpeedTier) => void;
  onAssignClick: () => void;
  extraHint?: string;
  disabled?: boolean;
}

export function CustomerAssignUsernameSection({
  speedTiers,
  selectedSpeedId,
  onSpeedSelect,
  onAssignClick,
  extraHint,
  disabled = false,
}: CustomerAssignUsernameSectionProps) {
  const { t } = useTranslation();
  const selectedTier = speedTiers.find((tier) => tier.id === selectedSpeedId) ?? null;
  const canAssign = Boolean(selectedTier) && !disabled;

  return (
    <ProfileSection
      title={t("customers.profile.assignSection")}
      description={
        extraHint ? `${extraHint} ${t("customers.profile.assignHint")}` : t("customers.profile.assignHint")
      }
      action={
        <Button size="sm" onClick={onAssignClick} disabled={!canAssign}>
          <UserPlus className="h-4 w-4" />
          {t("customers.profile.assignAction")}
        </Button>
      }
    >
      {speedTiers.length === 0 ? (
        <Text muted className="text-sm">{t("customers.assign.noSpeedTiers")}</Text>
      ) : (
        <div className="space-y-4">
          <div>
            <Text className="text-sm font-medium">{t("customers.assign.pickSpeed")}</Text>
            <Text muted className="mt-1 text-xs">{t("customers.assign.pickSpeedHint")}</Text>
          </div>
          <SpeedTierPicker
            tiers={speedTiers}
            selectedId={selectedSpeedId ?? speedTiers[0]?.id ?? 0}
            onSelect={onSpeedSelect}
          />
          {selectedTier ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <Text className="text-xs font-medium text-muted-foreground">
                {t("customers.assign.poolForSpeed")}
              </Text>
              <Text className="mt-1 text-sm font-medium">{buildSpeedLabel(selectedTier.valueMbps)}</Text>
            </div>
          ) : null}
        </div>
      )}
    </ProfileSection>
  );
}
