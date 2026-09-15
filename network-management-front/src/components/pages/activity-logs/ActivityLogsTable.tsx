import { format, parseISO } from "date-fns";
import { ScrollText } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableFixedClass,
  dataTableHeadCellClass,
  dataTableHeadRowClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
  LtrText,
} from "@/components/ui/data";
import { cn } from "@/lib/cn";
import { parseLogDetails } from "@/lib/mapSubscriberActivityLog";
import type { ActivityLog } from "@/types/activityLog";

interface ActivityLogsTableProps {
  rows: ActivityLog[];
  hasSearch: boolean;
}

function formatDate(value: string): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "yyyy-MM-dd HH:mm");
  } catch {
    return value;
  }
}

function formatAction(action: string, t: (key: string) => string): string {
  const key = `activityLogs.actions.${action}`;
  const translated = t(key);
  return translated === key ? action : translated;
}

function formatDetailsPreview(details: string | null): string {
  if (!details?.trim()) return "—";
  const parsed = parseLogDetails(details);
  if (parsed) {
    const parts: string[] = [];
    if (typeof parsed.path === "string") parts.push(parsed.path);
    if (parsed.body && typeof parsed.body === "object") {
      parts.push(JSON.stringify(parsed.body));
    } else if (parsed.fields && Array.isArray(parsed.fields)) {
      parts.push(`fields: ${parsed.fields.join(", ")}`);
    } else if (parsed.imported !== undefined) {
      parts.push(`imported ${String(parsed.imported)}, updated ${String(parsed.updated ?? 0)}`);
    } else {
      parts.push(JSON.stringify(parsed));
    }
    const text = parts.join(" · ");
    return text.length > 180 ? `${text.slice(0, 180)}…` : text;
  }
  return details.length > 180 ? `${details.slice(0, 180)}…` : details;
}

function formatSubjectType(subjectType: string, t: (key: string) => string): string {
  const key = `activityLogs.subjectTypes.${subjectType}`;
  const translated = t(key);
  return translated === key ? subjectType : translated;
}

export function ActivityLogsTable({ rows, hasSearch }: ActivityLogsTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
        )}
      >
        <ScrollText className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">
          {hasSearch ? t("activityLogs.table.noResults") : t("activityLogs.table.empty")}
        </p>
        {!hasSearch ? (
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("activityLogs.table.emptyHint")}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(dataTableWrapClass)}>
      <table className={cn(dataTableFixedClass, dataTableScrollMinClass)}>
        <colgroup>
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[16%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[29%]" />
        </colgroup>
        <thead>
          <tr className={dataTableHeadRowClass}>
            <th className={dataTableHeadCellClass}>{t("activityLogs.table.date")}</th>
            <th className={dataTableHeadCellClass}>{t("activityLogs.table.activityEvent")}</th>
            <th className={dataTableHeadCellClass}>{t("activityLogs.table.subjectType")}</th>
            <th className={dataTableHeadCellClass}>{t("activityLogs.table.subjectName")}</th>
            <th className={dataTableHeadCellClass}>{t("activityLogs.table.userName")}</th>
            <th className={dataTableHeadCellClass}>{t("activityLogs.table.ip")}</th>
            <th className={dataTableHeadCellClass}>{t("activityLogs.table.details")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={dataTableBodyRowClass}>
              <td className={cn(dataTableCellClass, "whitespace-nowrap text-xs text-muted-foreground")}>
                <LtrText>{formatDate(row.createdAt)}</LtrText>
              </td>
              <td className={dataTableCellClass}>
                <span className="text-sm font-medium">{formatAction(row.action, t)}</span>
              </td>
              <td className={dataTableCellClass}>
                <span className="text-sm text-muted-foreground">
                  {formatSubjectType(row.subjectType, t)}
                </span>
              </td>
              <td className={dataTableCellClass}>
                <span className="truncate text-sm">{row.subjectName || "—"}</span>
              </td>
              <td className={dataTableCellClass}>
                <span className="text-sm font-medium">{row.adminName || "—"}</span>
              </td>
              <td className={dataTableCellClass}>
                <LtrText className="font-mono text-xs">{row.ipAddress || "—"}</LtrText>
              </td>
              <td className={dataTableCellClass}>
                <span className="line-clamp-2 text-xs text-muted-foreground" title={row.details ?? undefined}>
                  {formatDetailsPreview(row.details)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
