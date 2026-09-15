import { format, parseISO } from "date-fns";
import { Pencil, Power, Trash2, UserCog } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { buttonBaseClassName, buttonSizes, buttonVariants } from "@/components/ui/buttons/buttonStyles";
import {
  dataTableActionsCellClass,
  dataTableActionsHeadCellClass,
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableFixedClass,
  dataTableHeadCellClass,
  dataTableHeadRowClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
  LtrText,
} from "@/components/ui/data";
import type { AdminUser } from "@/types/adminUser";
import { cn } from "@/lib/cn";

interface AdminUsersTableProps {
  rows: AdminUser[];
  hasSearch: boolean;
  canManage?: boolean;
  onEdit?: (row: AdminUser) => void;
  onDelete?: (row: AdminUser) => void;
  onToggleStatus?: (row: AdminUser) => void;
}

function formatWhen(value: string | null): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "yyyy-MM-dd HH:mm");
  } catch {
    return value;
  }
}

function StatusPill({ status }: { status: AdminUser["status"] }) {
  const { t } = useTranslation();
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      {active ? t("users.status.active") : t("users.status.inactive")}
    </span>
  );
}

export function AdminUsersTable({
  rows,
  hasSearch,
  canManage = false,
  onEdit,
  onDelete,
  onToggleStatus,
}: AdminUsersTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center">
        <UserCog className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">
          {hasSearch ? t("users.table.noResults") : t("users.table.empty")}
        </p>
        {!hasSearch ? (
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("users.table.emptyHint")}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={dataTableWrapClass}>
      <table className={cn(dataTableFixedClass, dataTableScrollMinClass)}>
        <colgroup>
          <col className="w-[18%]" />
          <col className="w-[14%]" />
          <col className="w-[16%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          {canManage ? <col className="w-[12%]" /> : null}
        </colgroup>
        <thead>
          <tr className={dataTableHeadRowClass}>
            <th className={dataTableHeadCellClass}>{t("users.table.name")}</th>
            <th className={dataTableHeadCellClass}>{t("users.table.username")}</th>
            <th className={dataTableHeadCellClass}>{t("users.table.email")}</th>
            <th className={dataTableHeadCellClass}>{t("users.table.role")}</th>
            <th className={dataTableHeadCellClass}>{t("users.table.status")}</th>
            <th className={dataTableHeadCellClass}>{t("users.table.lastLogin")}</th>
            <th className={dataTableHeadCellClass}>{t("users.table.createdAt")}</th>
            {canManage ? (
              <th className={dataTableActionsHeadCellClass}>{t("users.table.actions")}</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={dataTableBodyRowClass}>
              <td className={dataTableCellClass}>
                <span className="text-sm font-medium">{row.name}</span>
              </td>
              <td className={dataTableCellClass}>
                <LtrText className="font-mono text-sm text-muted-foreground">{row.username}</LtrText>
              </td>
              <td className={dataTableCellClass}>
                <LtrText className="text-sm">{row.email || "—"}</LtrText>
              </td>
              <td className={dataTableCellClass}>
                <span className="text-sm">{row.roleDisplayName}</span>
              </td>
              <td className={dataTableCellClass}>
                <StatusPill status={row.status} />
              </td>
              <td className={dataTableCellClass}>
                <LtrText className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatWhen(row.lastLoginAt)}
                </LtrText>
              </td>
              <td className={dataTableCellClass}>
                <LtrText className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatWhen(row.createdAt)}
                </LtrText>
              </td>
              {canManage ? (
                <td className={dataTableActionsCellClass}>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={t("users.actions.edit")}
                      onClick={() => onEdit?.(row)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={
                        row.status === "active"
                          ? t("users.actions.deactivate")
                          : t("users.actions.activate")
                      }
                      onClick={() => onToggleStatus?.(row)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <button
                      type="button"
                      className={cn(
                        buttonBaseClassName,
                        buttonVariants.ghost,
                        buttonSizes.icon,
                        "h-8 w-8 text-danger hover:bg-danger/10 hover:text-danger",
                      )}
                      aria-label={t("users.actions.delete")}
                      onClick={() => onDelete?.(row)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
