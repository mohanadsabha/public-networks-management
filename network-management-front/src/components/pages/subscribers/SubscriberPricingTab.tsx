import { SubscriberMonthlyPriceSection } from "@/components/pages/subscribers/SubscriberMonthlyPriceSection";
import type { SubscriberProfilePatch } from "@/hooks/useSubscribers";

interface SubscriberPricingTabProps {
  monthlyPrice: number;
  canManage?: boolean;
  onSave?: (patch: SubscriberProfilePatch) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function SubscriberPricingTab({
  monthlyPrice,
  canManage = false,
  onSave,
  isSubmitting = false,
}: SubscriberPricingTabProps) {
  return (
    <SubscriberMonthlyPriceSection
      monthlyPrice={monthlyPrice}
      canManage={canManage}
      onSave={onSave}
      isSubmitting={isSubmitting}
    />
  );
}
