import { Eye, Pencil, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomerKindBadge } from "@/components/pages/customers/CustomerKindBadge";
import { Button } from "@/components/ui/buttons";
import { buttonBaseClassName, buttonSizes, buttonVariants } from "@/components/ui/buttons/buttonStyles";
import {
  dataTableActionsCellClass,
  dataTableActionsHeadCellClass,
  dataTableBodyRowClass,
  dataTableCheckboxCellClass,
  dataTableCheckboxHeadClass,
  dataTableDenseCellClass,
  dataTableDenseFixedClass,
  dataTableDenseHeadCellClass,
  dataTableHeadRowClass,
  dataTableNumericCellClass,
  dataTableNumericHeadCellClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
  LtrText,
  MaskedPasswordCell,
  TableSubscriberCell,
} from "@/components/ui/data";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { getCustomerKind } from "@/lib/customerUtils";
import { getSubscriberInitials } from "@/lib/subscriberUtils";
import { customerProfilePath } from "@/lib/routePaths";
import type { Customer } from "@/types/customer";
import { cn } from "@/lib/cn";

interface CustomersTableProps {
  rows: Customer[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit?: (row: Customer) => void;
  onDelete?: (row: Customer) => void;
  showCheckboxes?: boolean;
  className?: string;
}

/** Column widths must sum to 100% for table-fixed alignment */
function buildColumnWidths(showCheckboxes: boolean, showPassword: boolean): string[] {
  if (showCheckboxes && showPassword) {
    return ["3%", "24%", "10%", "11%", "9%", "13%", "14%", "16%"];
  }
  if (showCheckboxes && !showPassword) {
    return ["3%", "30%", "11%", "15%", "16%", "12%", "13%"];
  }
  if (!showCheckboxes && showPassword) {
    return ["26%", "10%", "11%", "9%", "14%", "14%", "16%"];
  }
  return ["34%", "12%", "16%", "18%", "12%", "8%"];
}

export function CustomersTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onEdit,
  onDelete,
  showCheckboxes = false,
  className,
}: CustomersTableProps) {
  const { t } = useTranslation();
  const { canViewPasswords } = useRoleAccess();
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const showActions = true;
  const columnWidths = buildColumnWidths(showCheckboxes, canViewPasswords);

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
          className,
        )}
      >
        <Users className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">{t("customers.table.empty")}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("customers.table.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const kind = getCustomerKind(row);
          const initials = getSubscriberInitials(row.fullName);
          return (
            <article
              key={row.id}
              className={cn(
                "overflow-hidden rounded-xl border border-border bg-background",
                selectedIds.has(row.id) && "bg-muted/30",
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
                  <Link to={customerProfilePath(row.lineId)} className="block">
                    <div className="flex items-start justify-between gap-2">
                      <TableSubscriberCell
                        name={row.fullName}
                        subtitle={row.lineId}
                        initials={initials}
                      />
                      <CustomerKindBadge kind={kind} />
                    </div>
                  </Link>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border/80 pt-4 text-sm">
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-muted-foreground">{t("customers.table.username")}</dt>
                      <dd className="mt-1 select-all truncate font-mono text-xs font-semibold" dir="ltr">{row.username ?? "—"}</dd>
                    </div>
                    {canViewPasswords ? (
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
                      <dt className="text-xs font-medium text-muted-foreground">{t("customers.table.phone")}</dt>
                      <dd className="mt-1" dir="ltr">{row.phone ?? "—"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs font-medium text-muted-foreground">{t("customers.table.balance")}</dt>
                      <dd className={cn("mt-1 tabular-nums", row.balance < 0 ? "text-foreground" : "text-muted-foreground")}>
                        {row.balance}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              {showActions ? (
                <div className="flex justify-end gap-0.5 border-t border-border bg-muted/20 px-4 py-2">
                  <Link
                    to={customerProfilePath(row.lineId)}
                    aria-label={t("customers.actions.openProfile")}
                    className={cn(
                      buttonBaseClassName,
                      buttonVariants.ghost,
                      buttonSizes.icon,
                      "inline-flex items-center justify-center",
                    )}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {onEdit ? (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row)} aria-label={t("common.edit")}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {onDelete ? (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(row)} aria-label={t("common.delete")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className={cn("hidden md:block", dataTableWrapClass)}>
        <table className={cn(dataTableDenseFixedClass, dataTableScrollMinClass, "min-w-[52rem] xl:min-w-[60rem]")}>
          <colgroup>
            {columnWidths.map((width, index) => (
              <col key={index} style={{ width }} />
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
                    aria-label={t("customers.table.selectAll")}
                    className="rounded border-border"
                  />
                </th>
              ) : null}
              <th className={dataTableDenseHeadCellClass}>{t("customers.table.fullName")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("customers.table.type")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("customers.table.username")}</th>
              {canViewPasswords ? (
                <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.password")}</th>
              ) : null}
              <th className={dataTableDenseHeadCellClass}>{t("customers.table.phone")}</th>
              <th className={dataTableNumericHeadCellClass}>{t("customers.table.balance")}</th>
              {showActions ? (
                <th className={dataTableActionsHeadCellClass}>{t("customers.table.actions")}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const kind = getCustomerKind(row);
              const initials = getSubscriberInitials(row.fullName);

              return (
                <tr
                  key={row.id}
                  className={cn(dataTableBodyRowClass, selectedIds.has(row.id) && "bg-muted/40")}
                >
                  {showCheckboxes ? (
                    <td className={dataTableCheckboxCellClass}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => onToggleRow(row.id)}
                        aria-label={row.lineId}
                        className="rounded border-border"
                      />
                    </td>
                  ) : null}
                  <td className={cn("max-w-0", dataTableDenseCellClass)}>
                    <Link to={customerProfilePath(row.lineId)} className="block min-w-0 hover:underline">
                      <TableSubscriberCell
                        name={row.fullName}
                        subtitle={row.lineId}
                        initials={initials}
                        compact
                      />
                    </Link>
                  </td>
                  <td className={dataTableDenseCellClass}>
                    <CustomerKindBadge kind={kind} />
                  </td>
                  <td className={cn("max-w-0", dataTableDenseCellClass)}>
                    {row.username ? (
                      <LtrText className="select-all truncate font-mono text-xs font-semibold">{row.username}</LtrText>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  {canViewPasswords ? (
                    <td className={cn("max-w-0", dataTableDenseCellClass)}>
                      {row.password ? (
                        <MaskedPasswordCell value={row.password} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  ) : null}
                  <td className={cn("max-w-0", dataTableDenseCellClass)}>
                    {row.phone ? (
                      <LtrText className="text-sm">{row.phone}</LtrText>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td
                    className={cn(
                      dataTableNumericCellClass,
                      row.balance < 0 ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <LtrText className="w-full text-right">{row.balance}</LtrText>
                  </td>
                  {showActions ? (
                    <td className={dataTableActionsCellClass}>
                      <div className="inline-flex justify-center gap-0.5">
                        <Link
                          to={customerProfilePath(row.lineId)}
                          aria-label={t("customers.actions.openProfile")}
                          className={cn(
                            buttonBaseClassName,
                            buttonVariants.ghost,
                            buttonSizes.icon,
                            "inline-flex items-center justify-center",
                          )}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {onEdit ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(row)}
                            aria-label={t("common.edit")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {onDelete ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(row)}
                            aria-label={t("common.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
