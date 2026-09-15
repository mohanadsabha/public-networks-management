import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { DataUsageDisplay, StatusBadge } from "@/components/ui/data";
import type { StatusBadgeVariant } from "@/components/ui/data";
import { Text } from "@/components/ui/typography";
import { formatDataUsageMb } from "@/lib/speedFairUsage";
import { subscriberProfilePath } from "@/lib/routePaths";
import { cn } from "@/lib/cn";
import type { SubscriberUsageRow, UsageLevel } from "@/lib/usageUtils";

const LEVEL_BADGE: Record<UsageLevel, StatusBadgeVariant> = {
  over: "danger",
  critical: "warning",
  high: "accent",
  normal: "success",
  unknown: "muted",
};

const BAR_COLOR: Record<UsageLevel, string> = {
  over: "bg-danger",
  critical: "bg-warning",
  high: "bg-accent",
  normal: "bg-success",
  unknown: "bg-muted-foreground/40",
};

interface UsageTableProps {
  rows: SubscriberUsageRow[];
}

export function UsageTable({ rows }: UsageTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
        <Text muted>{t("usage.table.noResults")}</Text>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="w-10 px-3 py-3 text-start font-medium">{t("usage.table.rank")}</th>
              <th className="px-3 py-3 text-start font-medium">{t("usage.table.subscriber")}</th>
              <th className="px-3 py-3 text-start font-medium">{t("usage.table.speed")}</th>
              <th className="px-3 py-3 text-start font-medium">{t("usage.table.usage")}</th>
              <th className="px-3 py-3 text-start font-medium">{t("usage.table.percent")}</th>
              <th className="px-3 py-3 text-end font-medium">{t("usage.table.remaining")}</th>
              <th className="px-3 py-3 text-start font-medium">{t("usage.table.status")}</th>
              <th className="px-3 py-3 text-end font-medium">{t("usage.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.fullName || "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span dir="ltr">{row.lineId}</span>
                      {row.username ? <span> · {row.username}</span> : null}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">
                  {row.speedMbps ? `${row.speedMbps}M` : "—"}
                </td>
                <td className="px-3 py-3">
                  <DataUsageDisplay usedMb={row.usedMb} limitMb={row.limitMb} size="sm" />
                </td>
                <td className="px-3 py-3">
                  <UsagePercentBar percent={row.percent} level={row.level} />
                </td>
                <td className="px-3 py-3 text-end tabular-nums text-muted-foreground">
                  {row.remainingMb != null ? formatDataUsageMb(row.remainingMb) : "—"}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge label={t(`usage.level.${row.level}`)} variant={LEVEL_BADGE[row.level]} />
                </td>
                <td className="px-3 py-3 text-end">
                  <Link
                    to={subscriberProfilePath(row.lineId)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                    title={t("usage.table.openProfile")}
                  >
                    {t("usage.table.openProfile")}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, index) => (
          <Link
            key={row.id}
            to={subscriberProfilePath(row.lineId)}
            className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  <span className="text-muted-foreground">#{index + 1} </span>
                  {row.fullName || "—"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  <span dir="ltr">{row.lineId}</span>
                  {row.username ? <span> · {row.username}</span> : null}
                </p>
              </div>
              <StatusBadge label={t(`usage.level.${row.level}`)} variant={LEVEL_BADGE[row.level]} />
            </div>
            <div className="mt-3">
              <UsagePercentBar percent={row.percent} level={row.level} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <DataUsageDisplay usedMb={row.usedMb} limitMb={row.limitMb} size="sm" />
              <span>{row.speedMbps ? `${row.speedMbps}M` : "—"}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function UsagePercentBar({ percent, level }: { percent: number | null; level: UsageLevel }) {
  const { t } = useTranslation();
  if (percent == null) {
    return <span className="text-xs text-muted-foreground">{t("usage.table.noLimit")}</span>;
  }
  const width = Math.min(100, Math.max(2, percent));
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", BAR_COLOR[level])} style={{ width: `${width}%` }} />
      </div>
      <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">{percent}%</span>
    </div>
  );
}
