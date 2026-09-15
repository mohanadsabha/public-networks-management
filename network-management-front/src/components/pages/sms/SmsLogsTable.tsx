import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
import { subscriberProfilePath } from "@/lib/routePaths";
import type { SmsLog } from "@/types/sms";

interface SmsLogsTableProps {
  rows: SmsLog[];
}

function formatWhen(value: string): string {
  try {
    return format(parseISO(value), "yyyy-MM-dd HH:mm");
  } catch {
    return value;
  }
}

function LogStatusBadge({ status }: { status: SmsLog["status"] }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "sent" ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
      )}
    >
      {status === "sent" ? t("sms.logs.statusSent") : t("sms.logs.statusFailed")}
    </span>
  );
}

function SmsLogMobileCard({ row }: { row: SmsLog }) {
  const { t } = useTranslation();

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <LtrText className="text-xs text-muted-foreground">{formatWhen(row.createdAt)}</LtrText>
          <p className="text-sm font-medium text-foreground">
            {row.subscriberLineId ? (
              <Link
                to={subscriberProfilePath(row.subscriberLineId, "stats")}
                className="hover:underline"
              >
                {row.subscriberName ?? row.subscriberLineId}
              </Link>
            ) : (
              <span className="text-muted-foreground">{t("sms.logs.customRecipient")}</span>
            )}
          </p>
        </div>
        <LogStatusBadge status={row.status} />
      </div>

      <dl className="mt-3 grid gap-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">{t("sms.logs.phone")}</dt>
          <dd>
            <LtrText className="font-mono font-medium">{row.phone}</LtrText>
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">{t("sms.logs.sentBy")}</dt>
          <dd>
            <LtrText className="font-medium">{row.sentByUsername ?? row.sentByName ?? "—"}</LtrText>
          </dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-muted/20 px-3 py-2 text-sm leading-relaxed text-foreground">
        {row.message}
      </p>
    </article>
  );
}

export function SmsLogsTable({ rows }: SmsLogsTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
        {t("sms.logs.empty")}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <SmsLogMobileCard key={row.id} row={row} />
        ))}
      </div>

      <div className={cn("hidden lg:block", dataTableWrapClass)}>
        <table className={cn(dataTableFixedClass, dataTableScrollMinClass)}>
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[36%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead>
            <tr className={dataTableHeadRowClass}>
              <th className={dataTableHeadCellClass}>{t("sms.logs.sentAt")}</th>
              <th className={dataTableHeadCellClass}>{t("sms.logs.sentBy")}</th>
              <th className={dataTableHeadCellClass}>{t("sms.logs.recipient")}</th>
              <th className={dataTableHeadCellClass}>{t("sms.logs.phone")}</th>
              <th className={dataTableHeadCellClass}>{t("sms.logs.message")}</th>
              <th className={dataTableHeadCellClass}>{t("sms.logs.status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={dataTableBodyRowClass}>
                <td className={cn(dataTableCellClass, "whitespace-nowrap text-xs text-muted-foreground")}>
                  {formatWhen(row.createdAt)}
                </td>
                <td className={dataTableCellClass}>
                  <LtrText className="text-sm font-medium">
                    {row.sentByUsername ?? row.sentByName ?? "—"}
                  </LtrText>
                </td>
                <td className={dataTableCellClass}>
                  {row.subscriberLineId ? (
                    <Link
                      to={subscriberProfilePath(row.subscriberLineId, "stats")}
                      className="text-sm hover:underline"
                    >
                      {row.subscriberName ?? row.subscriberLineId}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">{t("sms.logs.customRecipient")}</span>
                  )}
                </td>
                <td className={dataTableCellClass}>
                  <LtrText className="text-sm">{row.phone}</LtrText>
                </td>
                <td className={cn(dataTableCellClass, "max-w-0 truncate text-sm")} title={row.message}>
                  {row.message}
                </td>
                <td className={dataTableCellClass}>
                  <LogStatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
