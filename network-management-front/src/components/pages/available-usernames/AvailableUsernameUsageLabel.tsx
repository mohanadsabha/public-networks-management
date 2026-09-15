import { useTranslation } from "react-i18next";
import { DataUsageDisplay } from "@/components/ui/data";
import { resolveUsageLimitMb } from "@/lib/speedFairUsage";
import type { AvailableUsername } from "@/types/availableUsername";
import { cn } from "@/lib/cn";

interface AvailableUsernameUsageLabelProps {
  row: AvailableUsername;
  speedMbps?: number;
  className?: string;
}

export function AvailableUsernameUsageLabel({
  row,
  speedMbps = 0,
  className,
}: AvailableUsernameUsageLabelProps) {
  const { t } = useTranslation();
  const usedMb = row.totalUsage ?? 0;
  const limitMb = resolveUsageLimitMb(row.usageLimit, speedMbps);

  if (usedMb <= 0 && (limitMb == null || limitMb <= 0)) {
    return <span className={cn("text-xs text-muted-foreground", className)}>—</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <DataUsageDisplay usedMb={usedMb} limitMb={limitMb} size="sm" />
      {limitMb != null && limitMb > 0 && usedMb >= limitMb ? (
        <span className="text-xs text-danger">({t("availableUsernames.status.usageExceeded")})</span>
      ) : null}
    </span>
  );
}
