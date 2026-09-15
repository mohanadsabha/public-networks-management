import { useState } from "react";
import { Info, Pencil, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AvailableUsernameDetailsModal } from "@/components/pages/available-usernames/AvailableUsernameDetailsModal";
import {
  AvailableUsernameStatusBadge,
  AvailableUsernameStatusBadgeCompact,
} from "@/components/pages/available-usernames/AvailableUsernameStatusBadge";
import { Button } from "@/components/ui/buttons";
import { LtrText, MaskedPasswordCell } from "@/components/ui/data";
import { AvailableUsernameExpiryLabel } from "@/components/pages/available-usernames/AvailableUsernameExpiryLabel";
import { AvailableUsernameUsageLabel } from "@/components/pages/available-usernames/AvailableUsernameUsageLabel";
import { formatCreatedDate, type AvailableUsername } from "@/types/availableUsername";
import { cn } from "@/lib/cn";

interface AvailableUsernamesTableProps {
  rows: AvailableUsername[];
  speedLabel?: string;
  speedMbps?: number;
  className?: string;
  onEdit?: (row: AvailableUsername) => void;
  onDelete?: (row: AvailableUsername) => void;
  onAssign?: (row: AvailableUsername) => void;
  onReset?: (row: AvailableUsername) => void;
}

export function AvailableUsernamesTable({
  rows,
  speedLabel,
  speedMbps = 0,
  className,
  onEdit,
  onDelete,
  onAssign,
  onReset,
}: AvailableUsernamesTableProps) {
  const { t, i18n } = useTranslation();
  const [detailsRow, setDetailsRow] = useState<AvailableUsername | null>(null);
  const showActions = Boolean(onEdit || onDelete || onAssign || onReset);

  const columns = showActions
    ? {
        username: "w-[20%]",
        password: "w-[18%]",
        status: "w-[14%]",
        usage: "w-[12%]",
        expires: "w-[12%]",
        date: "w-[10%]",
        actions: "w-[12%]",
      }
    : {
        username: "w-[18%]",
        password: "w-[16%]",
        status: "w-[12%]",
        usage: "w-[14%]",
        expires: "w-[12%]",
        date: "w-[12%]",
        actions: "w-[10%]",
      };

  return (
    <div className={className}>
      <AvailableUsernamesMobileList
        rows={rows}
        speedMbps={speedMbps}
        onDetails={setDetailsRow}
        onEdit={onEdit}
        onDelete={onDelete}
        onAssign={onAssign}
        onReset={onReset}
      />

      <div className="hidden w-full overflow-hidden rounded-xl border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className={cn(columns.username, "px-4 py-3 text-start font-semibold")}>
                {t("availableUsernames.table.username")}
              </th>
              <th className={cn(columns.password, "px-4 py-3 text-start font-semibold")}>
                {t("availableUsernames.table.password")}
              </th>
              <th className={cn(columns.status, "px-4 py-3 text-start font-semibold")}>
                {t("availableUsernames.table.status")}
              </th>
              <th className={cn(columns.usage, "px-4 py-3 text-start font-semibold")}>
                {t("availableUsernames.table.usage")}
              </th>
              <th className={cn(columns.expires, "px-4 py-3 text-start font-semibold")}>
                {t("availableUsernames.table.expires")}
              </th>
              <th className={cn(columns.date, "px-4 py-3 text-start font-semibold")}>
                {t("availableUsernames.table.createdAt")}
              </th>
              <th
                className={cn(
                  columns.actions,
                  "px-4 py-3 text-center align-middle font-semibold",
                )}
              >
                {t("availableUsernames.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 align-middle font-medium">
                  <LtrText>{row.username}</LtrText>
                </td>
                <td className="pe-4 px-4 py-3 align-middle">
                  <MaskedPasswordCell value={row.password} />
                </td>
                <td className="ps-2 px-4 py-3 align-middle">
                  <AvailableUsernameStatusBadge row={row} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <UsageCell row={row} speedMbps={speedMbps} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <ExpiresCell row={row} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-middle text-muted-foreground">
                  {formatCreatedDate(row.createdAt, i18n.language)}
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex justify-center">
                  <RowActions
                    row={row}
                    onDetails={() => setDetailsRow(row)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAssign={onAssign}
                    onReset={onReset}
                  />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AvailableUsernameDetailsModal
        open={detailsRow !== null}
        row={detailsRow}
        speedLabel={speedLabel}
        onClose={() => setDetailsRow(null)}
      />
    </div>
  );
}

function ExpiresCell({ row }: { row: AvailableUsername }) {
  return <AvailableUsernameExpiryLabel row={row} className="text-sm" />;
}

function UsageCell({ row, speedMbps }: { row: AvailableUsername; speedMbps: number }) {
  return <AvailableUsernameUsageLabel row={row} speedMbps={speedMbps} className="text-sm" />;
}

function AvailableUsernamesMobileList({
  rows,
  speedMbps,
  onDetails,
  onEdit,
  onDelete,
  onAssign,
  onReset,
}: {
  rows: AvailableUsername[];
  speedMbps: number;
  onDetails: (row: AvailableUsername) => void;
  onEdit?: (row: AvailableUsername) => void;
  onDelete?: (row: AvailableUsername) => void;
  onAssign?: (row: AvailableUsername) => void;
  onReset?: (row: AvailableUsername) => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-xl border border-border bg-background p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {t("availableUsernames.table.username")}
              </p>
              <p className="mt-1 font-semibold text-foreground">
                <LtrText>{row.username}</LtrText>
              </p>
            </div>
            <AvailableUsernameStatusBadgeCompact row={row} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted-foreground">
                {t("availableUsernames.table.password")}
              </dt>
              <dd className="mt-1 min-w-0">
                <MaskedPasswordCell value={row.password} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                {t("availableUsernames.table.usage")}
              </dt>
              <dd className="mt-1">
                <UsageCell row={row} speedMbps={speedMbps} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                {t("availableUsernames.table.expires")}
              </dt>
              <dd className="mt-1">
                <ExpiresCell row={row} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                {t("availableUsernames.table.createdAt")}
              </dt>
              <dd className="mt-1 text-muted-foreground">
                {formatCreatedDate(row.createdAt, i18n.language)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex justify-end border-t border-border pt-3">
            <RowActions
              row={row}
              onDetails={() => onDetails(row)}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssign={onAssign}
              onReset={onReset}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function RowActions({
  row,
  onDetails,
  onEdit,
  onDelete,
  onAssign,
  onReset,
}: {
  row: AvailableUsername;
  onDetails: () => void;
  onEdit?: (row: AvailableUsername) => void;
  onDelete?: (row: AvailableUsername) => void;
  onAssign?: (row: AvailableUsername) => void;
  onReset?: (row: AvailableUsername) => void;
}) {
  const { t } = useTranslation();
  const canReset = Boolean(onReset && row.isOwnerUsername && row.isUsed);

  return (
    <div className="flex items-center justify-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("availableUsernames.details.view")}
        onClick={onDetails}
      >
        <Info className="h-4 w-4 text-muted-foreground" />
      </Button>
      {canReset ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("availableUsernames.actions.resetCycle")}
          title={t("availableUsernames.actions.resetCycle")}
          onClick={() => onReset!(row)}
        >
          <RotateCcw className="h-4 w-4 text-primary" />
        </Button>
      ) : null}
      {onAssign ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("availableUsernames.assign.action")}
          title={t("availableUsernames.assign.action")}
          onClick={() => onAssign(row)}
        >
          <UserPlus className="h-4 w-4 text-primary" />
        </Button>
      ) : null}
      {onEdit ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.edit")}
          onClick={() => onEdit(row)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.delete")}
          onClick={() => onDelete(row)}
        >
          <Trash2 className="h-4 w-4 text-danger" />
        </Button>
      ) : null}
    </div>
  );
}
