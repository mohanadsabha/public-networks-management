import { useTranslation } from "react-i18next";
import {
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableFixedClass,
  dataTableHeadCellClass,
  dataTableHeadRowClass,
  dataTableWrapClass,
  LtrText,
} from "@/components/ui/data";
import { cn } from "@/lib/cn";
import type { SmsRecipient } from "@/types/sms";

interface SmsRecipientTableProps {
  rows: SmsRecipient[];
  selectedIds: Set<number>;
  onToggleRow: (id: number) => void;
  onToggleAll: (checked: boolean) => void;
  readOnly?: boolean;
  className?: string;
}

function DaysLeftBadge({ daysLeft }: { daysLeft: number | null }) {
  const { t } = useTranslation();
  if (daysLeft === null) return <span className="text-muted-foreground">—</span>;
  if (daysLeft < 0) {
    return <span className="text-xs font-medium text-danger">{t("sms.table.daysExpired")}</span>;
  }
  return (
    <span className={cn("whitespace-nowrap text-xs font-medium", daysLeft <= 2 && "text-warning")}>
      {t("sms.table.daysLeftValue", { days: daysLeft })}
    </span>
  );
}

export function SmsRecipientTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  readOnly = false,
  className,
}: SmsRecipientTableProps) {
  const { t } = useTranslation();
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
          className,
        )}
      >
        <p className="text-sm text-foreground">{t("sms.table.empty")}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("sms.table.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <div className="space-y-2 lg:hidden">
        {rows.map((row) => {
          const selected = selectedIds.has(row.id);
          const owes = row.balance < 0;
          const card = (
            <>
              {!readOnly ? (
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggleRow(row.id)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-border"
                />
              ) : null}
              <div className="min-w-0 flex-1 space-y-2 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium text-foreground">{row.fullName}</p>
                  {!readOnly ? (
                    <span
                      className={cn(
                        "shrink-0 whitespace-nowrap tabular-nums text-xs font-medium",
                        owes && "text-danger",
                      )}
                    >
                      {row.balance} ₪
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <LtrText className="font-mono">{row.lineId}</LtrText>
                  <LtrText className="font-mono">{row.phone ?? t("sms.table.noPhone")}</LtrText>
                  {!readOnly ? <DaysLeftBadge daysLeft={row.daysLeft} /> : null}
                </div>
              </div>
            </>
          );

          if (readOnly) {
            return (
              <div
                key={row.id}
                className="flex gap-3 rounded-lg border border-border/70 bg-muted/10 p-3"
              >
                {card}
              </div>
            );
          }

          return (
            <label
              key={row.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-lg border border-border p-3",
                selected && "border-primary/40 bg-primary/5",
              )}
            >
              {card}
            </label>
          );
        })}
      </div>

      <div className={cn("hidden lg:block", dataTableWrapClass)}>
        <table className={dataTableFixedClass}>
          <colgroup>
            {!readOnly ? <col className="w-[5%]" /> : null}
            <col className="w-[28%]" />
            <col className="w-[22%]" />
            {!readOnly ? <col className="w-[22%]" /> : null}
            {!readOnly ? <col className="w-[10%]" /> : null}
          </colgroup>
          <thead>
            <tr className={dataTableHeadRowClass}>
              {!readOnly ? (
                <th className="px-3 py-2.5 text-center align-middle">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onToggleAll(e.target.checked)}
                    aria-label={t("sms.table.selectAll")}
                    className="h-4 w-4 rounded border-border"
                  />
                </th>
              ) : null}
              <th className={dataTableHeadCellClass}>{t("sms.table.subscriber")}</th>
              <th className={dataTableHeadCellClass}>{t("sms.table.phone")}</th>
              {!readOnly ? (
                <>
                  <th className={dataTableHeadCellClass}>{t("sms.table.daysLeft")}</th>
                  <th className={cn("text-end", dataTableHeadCellClass)}>{t("sms.table.balance")}</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = selectedIds.has(row.id);
              const owes = row.balance < 0;
              return (
                <tr key={row.id} className={cn(dataTableBodyRowClass, !readOnly && selected && "bg-primary/5")}>
                  {!readOnly ? (
                    <td className="px-3 py-2.5 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleRow(row.id)}
                        className="h-4 w-4 rounded border-border"
                      />
                    </td>
                  ) : null}
                  <td className={cn("max-w-0", dataTableCellClass)}>
                    <p className="truncate text-sm font-medium text-foreground">{row.fullName}</p>
                    <LtrText className="font-mono text-[11px] text-muted-foreground">
                      {row.lineId}
                    </LtrText>
                  </td>
                  <td className={dataTableCellClass}>
                    <LtrText className="font-mono text-xs">
                      {row.phone ?? t("sms.table.noPhone")}
                    </LtrText>
                  </td>
                  {!readOnly ? (
                    <>
                      <td className={dataTableCellClass}>
                        <DaysLeftBadge daysLeft={row.daysLeft} />
                      </td>
                      <td
                        className={cn(
                          dataTableCellClass,
                          "whitespace-nowrap text-end tabular-nums font-medium",
                          owes && "text-danger",
                        )}
                      >
                        {row.balance} ₪
                      </td>
                    </>
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
