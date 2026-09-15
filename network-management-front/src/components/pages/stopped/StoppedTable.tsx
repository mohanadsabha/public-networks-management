import { ExternalLink, PauseCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { customerOwesMoney } from "@/lib/customerUtils";
import { formatMoney } from "@/lib/formatMoney";
import { getSubscriberInitials } from "@/lib/subscriberUtils";
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
  TableSubscriberCell,
} from "@/components/ui/data";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { subscriberProfilePath } from "@/lib/routePaths";
import type { Customer } from "@/types/customer";
import { cn } from "@/lib/cn";
import { format, parseISO } from "date-fns";

function profilePath(lineId: string): string {
  return subscriberProfilePath(lineId, "username");
}

function formatStoppedAt(value: string): string {
  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return value;
  }
}

interface StoppedTableProps {
  rows: Customer[];
  className?: string;
}

export function StoppedTable({ rows, className }: StoppedTableProps) {
  const { t, i18n } = useTranslation();
  const { canViewPasswords } = useRoleAccess();

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
          className,
        )}
      >
        <PauseCircle className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">{t("stopped.table.empty")}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("stopped.table.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <StoppedMobileCard key={row.id} row={row} lang={i18n.language} showPassword={canViewPasswords} />
        ))}
      </div>

      <div className={cn("hidden md:block", dataTableWrapClass)}>
        <table className={cn(dataTableDenseFixedClass, dataTableScrollMinClass, "min-w-[52rem] xl:min-w-[60rem]")}>
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            {canViewPasswords ? <col className="w-[9%]" /> : null}
            <col className="w-[11%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
          </colgroup>
          <thead>
            <tr className={dataTableHeadRowClass}>
              <th className={dataTableDenseHeadCellClass}>{t("stopped.table.subscriber")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("stopped.table.lineId")}</th>
              <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.username")}</th>
              {canViewPasswords ? (
                <th className={dataTableDenseHeadCellClass}>{t("subscribers.table.password")}</th>
              ) : null}
              <th className={dataTableDenseHeadCellClass}>{t("stopped.table.phone")}</th>
              <th className={cn("text-end", dataTableDenseHeadCellClass)}>
                {t("stopped.table.balance")}
              </th>
              <th className={dataTableDenseHeadCellClass}>{t("stopped.table.stoppedAt")}</th>
              <th className={dataTableActionsHeadCellClass}>
                {t("stopped.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <StoppedDesktopRow
                key={row.id}
                row={row}
                lang={i18n.language}
                showPassword={canViewPasswords}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BalanceCell({ balance, lang }: { balance: number; lang: string }) {
  const owes = customerOwesMoney({ balance });
  return (
    <span className={cn("tabular-nums font-medium", owes && "text-danger")}>
      {formatMoney(balance, lang)}
    </span>
  );
}

function StoppedDesktopRow({
  row,
  lang,
  showPassword = false,
}: {
  row: Customer;
  lang: string;
  showPassword?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const initials = getSubscriberInitials(row.fullName);
  const owes = customerOwesMoney(row);

  const openProfile = () => navigate(profilePath(row.lineId));

  return (
    <tr className={cn("group", dataTableBodyRowClass, "bg-danger/[0.06]")}>
      <td className={cn("cursor-pointer max-w-0", dataTableDenseCellClass)} onClick={openProfile}>
        <TableSubscriberCell
          name={row.fullName}
          subtitle={
            owes
              ? `${row.facilityType} · ${t("stopped.table.owesBalance")}`
              : row.facilityType
          }
          initials={initials}
          compact
        />
      </td>
      <td className={cn("cursor-pointer", dataTableDenseCellClass)} onClick={openProfile}>
        <LtrText className="select-all font-mono text-xs text-muted-foreground">{row.lineId}</LtrText>
      </td>
      <td className={cn("cursor-pointer max-w-0", dataTableDenseCellClass)} onClick={openProfile}>
        {row.username ? (
          <LtrText className="select-all truncate font-mono text-xs font-semibold">{row.username}</LtrText>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
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
          <LtrText className="text-sm">{row.phone}</LtrText>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className={cn("cursor-pointer text-end", dataTableDenseCellClass)} onClick={openProfile}>
        <BalanceCell balance={row.balance} lang={lang} />
      </td>
      <td
        className={cn("cursor-pointer whitespace-nowrap text-muted-foreground", dataTableDenseCellClass)}
        onClick={openProfile}
      >
        {formatStoppedAt(row.updatedAt)}
      </td>
      <td className={dataTableActionsCellClass} onClick={(e) => e.stopPropagation()}>
        <Link
          to={profilePath(row.lineId)}
          className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t("stopped.table.openProfile")}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function StoppedMobileCard({
  row,
  lang,
  showPassword = false,
}: {
  row: Customer;
  lang: string;
  showPassword?: boolean;
}) {
  const { t } = useTranslation();
  const initials = getSubscriberInitials(row.fullName);
  const owes = customerOwesMoney(row);

  return (
    <article className="overflow-hidden rounded-xl border border-danger/25 bg-danger/[0.04]">
      <Link to={profilePath(row.lineId)} className="block p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-medium text-muted-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{row.fullName}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{row.lineId}</p>
            {owes ? (
              <p className="mt-1 text-xs text-danger">{t("stopped.table.owesBalance")}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{t("stopped.table.balanceCleared")}</p>
            )}
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted-foreground">{t("subscribers.table.username")}</dt>
            <dd className="mt-1 select-all truncate font-mono text-xs font-semibold" dir="ltr">
              {row.username ?? "—"}
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
            <dt className="text-xs font-medium text-muted-foreground">{t("stopped.table.phone")}</dt>
            <dd className="mt-1" dir="ltr">
              {row.phone ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">{t("stopped.table.stoppedAt")}</dt>
            <dd className="mt-1 text-muted-foreground">{formatStoppedAt(row.updatedAt)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-medium text-muted-foreground">{t("stopped.table.balance")}</dt>
            <dd className="mt-1">
              <BalanceCell balance={row.balance} lang={lang} />
            </dd>
          </div>
        </dl>
      </Link>

      <div className="flex items-center justify-end border-t border-border bg-muted/20 px-4 py-2.5">
        <Link
          to={profilePath(row.lineId)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
        >
          {t("stopped.table.openProfile")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
