import { CalendarClock, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  dataTableActionsCellClass,
  dataTableActionsHeadCellClass,
  dataTableBodyRowClass,
  dataTableDenseCellClass,
  dataTableDenseFixedClass,
  dataTableDenseHeadCellClass,
  dataTableHeadRowClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
  LtrText,
  MaskedPasswordCell,
  StatusBadge,
  TableSubscriberCell,
} from "@/components/ui/data";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { getExpiringUrgencyKey } from "@/lib/expiringUtils";
import { formatDisconnectTimeLeft } from "@/lib/timeLeftUtils";
import {
  buildSpeedLabel,
  getSubscriberInitials,
} from "@/lib/subscriberUtils";
import { subscriberProfilePath } from "@/lib/routePaths";
import type { Customer } from "@/types/customer";
import { cn } from "@/lib/cn";
import { format, parseISO } from "date-fns";

const URGENCY_VARIANT = {
  expired: "danger",
  oneDay: "warning",
  twoDays: "warning",
  soon: "accent",
} as const;

function profilePath(lineId: string): string {
  return subscriberProfilePath(lineId, "stats");
}

function formatDisconnectDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return value;
  }
}

interface ExpiringTableProps {
  rows: Customer[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  className?: string;
}

export function ExpiringTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  className,
}: ExpiringTableProps) {
  const { t } = useTranslation();
  const { canViewPasswords } = useRoleAccess();
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
          className,
        )}
      >
        <CalendarClock className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">{t("expiring.table.empty")}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("expiring.table.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <ExpiringMobileCard
            key={row.id}
            row={row}
            selected={selectedIds.has(row.id)}
            onToggle={() => onToggleRow(row.id)}
            showPassword={canViewPasswords}
          />
        ))}
      </div>

      <div className={cn("hidden md:block", dataTableWrapClass)}>
        <table className={cn(dataTableDenseFixedClass, dataTableScrollMinClass, "min-w-[56rem] xl:min-w-[64rem]")}>
          <colgroup>
            <col className="w-[2.5rem]" />
            <col className="w-[17%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            {canViewPasswords ? <col className="w-[9%]" /> : null}
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className={dataTableHeadRowClass}>
              <th className="w-10 px-3 py-2.5 text-center align-middle">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  aria-label={t("expiring.table.selectAll")}
                  className="rounded border-border"
                />
              </th>
              <th className={dataTableDenseHeadCellClass}>{t("expiring.table.subscriber")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("expiring.table.lineId")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("expiring.table.username")}</th>
              {canViewPasswords ? (
                <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.password")}</th>
              ) : null}
              <th className={dataTableDenseHeadCellClass}>{t("expiring.table.phone")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("expiring.table.disconnectDate")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("expiring.table.urgency")}</th>
              <th className={dataTableActionsHeadCellClass}>
                {t("expiring.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <ExpiringDesktopRow
                key={row.id}
                row={row}
                selected={selectedIds.has(row.id)}
                onToggle={() => onToggleRow(row.id)}
                showPassword={canViewPasswords}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpiringDesktopRow({
  row,
  selected,
  onToggle,
  showPassword = false,
}: {
  row: Customer;
  selected: boolean;
  onToggle: () => void;
  showPassword?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const urgencyKey = getExpiringUrgencyKey(row);
  const initials = getSubscriberInitials(row.fullName);
  const daysLabel = formatDisconnectTimeLeft(t, row);

  const openProfile = () => navigate(profilePath(row.lineId));

  return (
    <tr className={cn("group", dataTableBodyRowClass, selected && "bg-muted/40")}>
      <td className="w-10 px-3 py-2.5 text-center align-middle" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={row.lineId}
          className="rounded border-border"
        />
      </td>
      <td className={cn("cursor-pointer max-w-0", dataTableDenseCellClass)} onClick={openProfile}>
        <TableSubscriberCell
          name={row.fullName}
          subtitle={buildSpeedLabel(row.speedMbps)}
          initials={initials}
          compact
        />
      </td>
      <td className={cn("cursor-pointer", dataTableDenseCellClass)} onClick={openProfile}>
        <LtrText className="select-all font-mono text-xs text-muted-foreground">{row.lineId}</LtrText>
      </td>
      <td className={cn("cursor-pointer max-w-0", dataTableDenseCellClass)} onClick={openProfile}>
        <LtrText className="select-all truncate font-mono text-xs font-semibold">{row.username}</LtrText>
      </td>
      {showPassword ? (
        <td className={cn("cursor-pointer max-w-0", dataTableDenseCellClass)} onClick={openProfile}>
          {row.password ? (
            <MaskedPasswordCell value={row.password} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
      ) : null}
      <td className={cn("cursor-pointer max-w-0", dataTableDenseCellClass)} onClick={openProfile}>
        {row.phone ? (
          <LtrText className="text-xs text-muted-foreground">{row.phone}</LtrText>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className={cn("cursor-pointer", dataTableDenseCellClass)} onClick={openProfile}>
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDisconnectDate(row.disconnectionDate)}
          <span className="text-foreground"> · {daysLabel}</span>
        </span>
      </td>
      <td className={cn("cursor-pointer", dataTableDenseCellClass)} onClick={openProfile}>
        {urgencyKey && urgencyKey !== "all" ? (
          <StatusBadge label={t(`expiring.urgency.${urgencyKey}`)} variant={URGENCY_VARIANT[urgencyKey]} />
        ) : null}
      </td>
      <td className={dataTableActionsCellClass} onClick={(e) => e.stopPropagation()}>
        <Link
          to={profilePath(row.lineId)}
          className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t("expiring.table.openProfile")}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function ExpiringMobileCard({
  row,
  selected,
  onToggle,
  showPassword = false,
}: {
  row: Customer;
  selected: boolean;
  onToggle: () => void;
  showPassword?: boolean;
}) {
  const { t } = useTranslation();
  const urgencyKey = getExpiringUrgencyKey(row);
  const initials = getSubscriberInitials(row.fullName);
  const daysLabel = formatDisconnectTimeLeft(t, row);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background",
        selected && "bg-muted/30",
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-3 rounded border-border"
          aria-label={row.lineId}
        />
        <Link to={profilePath(row.lineId)} className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-medium text-muted-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium text-foreground">{row.fullName}</p>
              {urgencyKey && urgencyKey !== "all" ? (
                <StatusBadge label={t(`expiring.urgency.${urgencyKey}`)} variant={URGENCY_VARIANT[urgencyKey]} />
              ) : null}
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{row.lineId}</p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted-foreground">{t("expiring.table.username")}</dt>
            <dd className="mt-1 select-all truncate font-mono text-xs font-semibold" dir="ltr">
              {row.username}
            </dd>
          </div>
          {showPassword ? (
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted-foreground">{t("subscribers.table.password")}</dt>
              <dd className="mt-1 min-w-0">
                {row.password ? (
                  <MaskedPasswordCell value={row.password} />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t("expiring.table.phone")}</dt>
            <dd className="mt-1 text-xs" dir="ltr">
              {row.phone ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t("expiring.table.disconnectDate")}</dt>
            <dd className="mt-1 text-muted-foreground">{formatDisconnectDate(row.disconnectionDate)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">{t("expiring.table.timeLeft")}</dt>
            <dd className="mt-1 font-medium text-foreground">{daysLabel}</dd>
          </div>
        </dl>
        </Link>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5">
        <span className="text-xs text-muted-foreground">{buildSpeedLabel(row.speedMbps)}</span>
        <Link
          to={profilePath(row.lineId)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
        >
          {t("expiring.table.openProfile")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

