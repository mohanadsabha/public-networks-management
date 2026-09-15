import { ExternalLink, Pencil, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SubscriberStatusBadge } from "@/components/pages/subscribers/SubscriberStatusBadge";
import { Button } from "@/components/ui/buttons";
import {
  dataTableBodyRowClass,
  dataTableCheckboxCellClass,
  dataTableCheckboxHeadClass,
  dataTableDenseActionsCellClass,
  dataTableDenseActionsHeadCellClass,
  dataTableDenseCellClass,
  dataTableDenseFixedClass,
  dataTableDenseHeadCellClass,
  dataTableHeadRowClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
  LtrText,
  MaskedPasswordCell,
  TableSubscriberCell,
} from "@/components/ui/data";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import {
  buildSpeedLabel,
  getSubscriberInitials,
  getSubscriberListStatus,
} from "@/lib/subscriberUtils";
import { resolveOnlineIp } from "@/lib/onlineUsersUtils";
import type { Subscriber } from "@/types/subscriber";
import { subscriberProfilePath } from "@/lib/routePaths";
import { cn } from "@/lib/cn";
import { format, parseISO } from "date-fns";

interface SubscribersTableProps {
  rows: Subscriber[];
  onlineIpByUsername?: Map<string, string>;
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit?: (row: Subscriber) => void;
  onDelete?: (row: Subscriber) => void;
  showCheckboxes?: boolean;
  className?: string;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return value;
  }
}

function buildSubscribersColumnWidths(showCheckboxes: boolean, showPassword: boolean): string[] {
  if (showCheckboxes && showPassword) {
    return [
      "w-[2.75rem]",
      "w-[17%]",
      "w-[9%]",
      "w-[12%]",
      "w-[10%]",
      "w-[11%]",
      "w-[8%]",
      "w-[10%]",
      "w-[12%]",
      "w-[7rem]",
    ];
  }
  if (showCheckboxes && !showPassword) {
    return [
      "w-[2.75rem]",
      "w-[19%]",
      "w-[10%]",
      "w-[15%]",
      "w-[12%]",
      "w-[8%]",
      "w-[11%]",
      "w-[12%]",
      "w-[7rem]",
    ];
  }
  if (!showCheckboxes && showPassword) {
    return [
      "w-[18%]",
      "w-[10%]",
      "w-[13%]",
      "w-[11%]",
      "w-[12%]",
      "w-[8%]",
      "w-[11%]",
      "w-[12%]",
      "w-[7rem]",
    ];
  }
  return [
    "w-[20%]",
    "w-[11%]",
    "w-[16%]",
    "w-[13%]",
    "w-[9%]",
    "w-[12%]",
    "w-[13%]",
    "w-[7rem]",
  ];
}

function profilePath(lineId: string): string {
  return subscriberProfilePath(lineId, "stats");
}

export function SubscribersTable({
  rows,
  onlineIpByUsername,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onEdit,
  onDelete,
  showCheckboxes = false,
  className,
}: SubscribersTableProps) {
  const { t } = useTranslation();
  const { canViewPasswords } = useRoleAccess();
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const columnWidths = buildSubscribersColumnWidths(showCheckboxes, canViewPasswords);

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
          className,
        )}
      >
        <Users className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">{t("subscribers.table.empty")}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("subscribers.table.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <SubscribersMobileList
        rows={rows}
        onlineIpByUsername={onlineIpByUsername}
        selectedIds={selectedIds}
        onToggleRow={onToggleRow}
        showCheckboxes={showCheckboxes}
        showPassword={canViewPasswords}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <div className={cn("hidden md:block", dataTableWrapClass)}>
        <table
          className={cn(
            dataTableDenseFixedClass,
            dataTableScrollMinClass,
            "min-w-[52rem] xl:min-w-[60rem]",
          )}
        >
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={index} className={width} />
            ))}
          </colgroup>
          <thead>
            <tr className={dataTableHeadRowClass}>
              {showCheckboxes ? (
                <th className={dataTableCheckboxHeadClass}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onToggleAll(e.target.checked)}
                    aria-label={t("subscribers.table.selectAll")}
                    className="rounded border-border"
                  />
                </th>
              ) : null}
              <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.subscriber")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.lineId")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.username")}</th>
              {canViewPasswords ? (
                <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.password")}</th>
              ) : null}
              <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.phone")}</th>
              <th className={cn("whitespace-nowrap", dataTableDenseHeadCellClass)}>
                {t("subscribers.table.speed")}
              </th>
              <th className={cn("whitespace-nowrap", dataTableDenseHeadCellClass)}>
                {t("subscribers.table.firstContact")}
              </th>
              <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.status")}</th>
              <th className={dataTableDenseActionsHeadCellClass}>{t("subscribers.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <SubscriberDesktopRow
                key={row.id}
                row={row}
                onlineIpByUsername={onlineIpByUsername}
                selected={selectedIds.has(row.id)}
                showCheckboxes={showCheckboxes}
                onToggleRow={onToggleRow}
                onEdit={onEdit}
                onDelete={onDelete}
                showPasswordColumn={canViewPasswords}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubscriberDesktopRow({
  row,
  onlineIpByUsername,
  selected,
  showCheckboxes,
  onToggleRow,
  onEdit,
  onDelete,
  showPasswordColumn = false,
}: {
  row: Subscriber;
  onlineIpByUsername?: Map<string, string>;
  selected: boolean;
  showCheckboxes: boolean;
  onToggleRow: (id: number) => void;
  onEdit?: (row: Subscriber) => void;
  onDelete?: (row: Subscriber) => void;
  showPasswordColumn?: boolean;
}) {
  const { t } = useTranslation();
  const listStatus = getSubscriberListStatus(row);
  const onlineIp = resolveOnlineIp(row.username, onlineIpByUsername ?? new Map());
  const initials = getSubscriberInitials(row.fullName);

  return (
    <tr
      className={cn(
        "group",
        dataTableBodyRowClass,
        selected && "bg-muted/40",
        row.isPaused && "bg-warning/[0.08]",
      )}
    >
      {showCheckboxes ? (
        <td className={dataTableCheckboxCellClass} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleRow(row.id)}
            aria-label={row.lineId}
            className="rounded border-border"
          />
        </td>
      ) : null}
      <td className={cn("max-w-0", dataTableDenseCellClass)}>
        <TableSubscriberCell
          name={row.fullName}
          subtitle={row.facilityType}
          initials={initials}
          compact
        />
      </td>
      <td className={dataTableDenseCellClass}>
        <LtrText className="select-all font-mono text-xs text-muted-foreground">{row.lineId}</LtrText>
      </td>
      <td className={cn("max-w-0", dataTableDenseCellClass)}>
        {row.username ? (
          <LtrText
            className="select-all truncate font-mono text-xs font-semibold text-foreground"
            title={row.username}
          >
            {row.username}
          </LtrText>
        ) : (
          <span className="text-xs text-muted-foreground">{t("subscribers.profile.noUsername")}</span>
        )}
      </td>
      {showPasswordColumn ? (
        <td className={cn("max-w-0", dataTableDenseCellClass)} onClick={(e) => e.stopPropagation()}>
          {row.password ? (
            <MaskedPasswordCell value={row.password} />
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
      ) : null}
      <td className={cn("max-w-0", dataTableDenseCellClass)}>
        {row.phone ? (
          <LtrText className="select-all truncate text-xs text-muted-foreground" title={row.phone}>
            {row.phone}
          </LtrText>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className={cn("whitespace-nowrap text-muted-foreground", dataTableDenseCellClass)}>
        {buildSpeedLabel(row.speedMbps)}
      </td>
      <td className={cn("whitespace-nowrap text-muted-foreground", dataTableDenseCellClass)}>
        {formatDate(row.firstContactDate)}
      </td>
      <td className={dataTableDenseCellClass}>
        <SubscriberStatusBadge
          status={listStatus}
          isOnline={Boolean(onlineIp?.trim())}
          onlineIp={onlineIp}
        />
      </td>
      <td className={dataTableDenseActionsCellClass} onClick={(e) => e.stopPropagation()}>
        <RowActions row={row} onEdit={onEdit} onDelete={onDelete} compact />
      </td>
    </tr>
  );
}

function SubscribersMobileList({
  rows,
  onlineIpByUsername,
  selectedIds,
  onToggleRow,
  showCheckboxes,
  onEdit,
  onDelete,
  showPassword = false,
}: {
  rows: Subscriber[];
  onlineIpByUsername?: Map<string, string>;
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  showCheckboxes: boolean;
  onEdit?: (row: Subscriber) => void;
  onDelete?: (row: Subscriber) => void;
  showPassword?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => {
        const listStatus = getSubscriberListStatus(row);
        const onlineIp = resolveOnlineIp(row.username, onlineIpByUsername ?? new Map());
        const initials = getSubscriberInitials(row.fullName);

        return (
          <article
            key={row.id}
            className={cn(
              "overflow-hidden rounded-xl border border-border bg-background",
              selectedIds.has(row.id) && "bg-muted/30",
              row.isPaused && "border-warning/40 bg-warning/[0.06]",
            )}
          >
            <div className="flex items-start gap-3 p-4">
              {showCheckboxes ? (
                <input
                  type="checkbox"
                  checked={selectedIds.has(row.id)}
                  onChange={() => onToggleRow(row.id)}
                  className="mt-3 rounded border-border"
                  aria-label={row.lineId}
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-medium text-muted-foreground">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{row.fullName}</p>
                        <p className="text-xs text-muted-foreground">{row.facilityType}</p>
                      </div>
                      <SubscriberStatusBadge
                        status={listStatus}
                        isOnline={Boolean(onlineIp?.trim())}
                        onlineIp={onlineIp}
                      />
                    </div>
                    <p className="mt-2 select-all font-mono text-xs text-muted-foreground">{row.lineId}</p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 border-t border-border/80 pt-4 text-sm sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("subscribers.table.username")}
                    </dt>
                    <dd className="mt-1 min-w-0">
                      {row.username ? (
                        <LtrText className="select-all truncate font-mono text-xs font-semibold">
                          {row.username}
                        </LtrText>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  {showPassword ? (
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-muted-foreground">
                        {t("subscribers.table.password")}
                      </dt>
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
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("subscribers.table.speed")}
                    </dt>
                    <dd className="mt-1 text-xs">{buildSpeedLabel(row.speedMbps)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("subscribers.table.phone")}
                    </dt>
                    <dd className="mt-1 select-all text-xs" dir="ltr">
                      {row.phone ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("subscribers.table.firstContact")}
                    </dt>
                    <dd className="mt-1 text-xs text-muted-foreground">
                      {formatDate(row.firstContactDate)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2">
              <Link
                to={profilePath(row.lineId)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {t("subscribers.actions.openProfile")}
              </Link>
              <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RowActions({
  row,
  onEdit,
  onDelete,
  compact = false,
}: {
  row: Subscriber;
  onEdit?: (row: Subscriber) => void;
  onDelete?: (row: Subscriber) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const actionSize = compact ? "h-8 w-8" : "h-9 w-9";
  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="inline-flex justify-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
      <Link
        to={profilePath(row.lineId)}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          actionSize,
        )}
        aria-label={t("subscribers.actions.openProfile")}
      >
        <ExternalLink className={iconSize} />
      </Link>
      {onEdit ? (
        <Button variant="ghost" size="icon" className={actionSize} onClick={() => onEdit(row)} aria-label={t("common.edit")}>
          <Pencil className={iconSize} />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon"
          className={actionSize}
          onClick={() => onDelete(row)}
          aria-label={t("common.delete")}
        >
          <Trash2 className={iconSize} />
        </Button>
      ) : null}
    </div>
  );
}
