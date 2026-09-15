import { Banknote, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomerKindBadge } from "@/components/pages/customers/CustomerKindBadge";
import { getAmountOwed, getCustomerKind } from "@/lib/customerUtils";
import { formatMoney } from "@/lib/formatMoney";
import { getSubscriberInitials } from "@/lib/subscriberUtils";
import { customerProfilePath } from "@/lib/routePaths";
import type { Customer } from "@/types/customer";
import { cn } from "@/lib/cn";

interface FinanceDebtorsTableProps {
  rows: Customer[];
  className?: string;
}

export function FinanceDebtorsTable({ rows, className }: FinanceDebtorsTableProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-12 text-center",
          className,
        )}
      >
        <Banknote className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">{t("finance.debtors.empty")}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("finance.debtors.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <DebtorMobileCard key={row.id} row={row} lang={lang} />
        ))}
      </div>

      <div className="hidden w-full overflow-hidden lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3.5 text-start font-semibold text-muted-foreground">
                {t("finance.debtors.customer")}
              </th>
              <th className="px-4 py-3.5 text-start font-semibold text-muted-foreground">
                {t("finance.debtors.lineId")}
              </th>
              <th className="px-4 py-3.5 text-start font-semibold text-muted-foreground">
                {t("finance.debtors.type")}
              </th>
              <th className="px-4 py-3.5 text-start font-semibold text-muted-foreground">
                {t("finance.debtors.phone")}
              </th>
              <th className="px-4 py-3.5 text-end font-semibold text-muted-foreground">
                {t("finance.debtors.amountOwed")}
              </th>
              <th className="w-16 px-4 py-3.5 text-center align-middle font-semibold text-muted-foreground">
                {t("finance.debtors.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <DebtorDesktopRow key={row.id} row={row} lang={lang} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DebtorDesktopRow({ row, lang }: { row: Customer; lang: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const initials = getSubscriberInitials(row.fullName);
  const kind = getCustomerKind(row);
  const owed = getAmountOwed(row);

  const openProfile = () => navigate(customerProfilePath(row.lineId));

  return (
    <tr className="group border-b border-border last:border-0 transition-colors hover:bg-muted/20">
      <td className="cursor-pointer px-4 py-3.5 align-middle" onClick={openProfile}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-medium text-muted-foreground">
            {initials}
          </div>
          <p className="truncate font-medium text-foreground">{row.fullName}</p>
        </div>
      </td>
      <td className="cursor-pointer px-4 py-3.5 align-middle" onClick={openProfile}>
        <span className="font-mono text-xs text-muted-foreground">{row.lineId}</span>
      </td>
      <td className="cursor-pointer px-4 py-3.5 align-middle" onClick={openProfile}>
        <CustomerKindBadge kind={kind} />
      </td>
      <td className="cursor-pointer px-4 py-3.5 align-middle" dir="ltr" onClick={openProfile}>
        {row.phone ?? <span className="text-muted-foreground">—</span>}
      </td>
      <td className="cursor-pointer px-4 py-3.5 align-middle text-end" onClick={openProfile}>
        <span className="font-semibold tabular-nums text-danger">{formatMoney(owed, lang)}</span>
      </td>
      <td className="px-4 py-3.5 text-center align-middle" onClick={(e) => e.stopPropagation()}>
        <Link
          to={customerProfilePath(row.lineId)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={t("finance.debtors.recordPayment")}
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </td>
    </tr>
  );
}

function DebtorMobileCard({ row, lang }: { row: Customer; lang: string }) {
  const { t } = useTranslation();
  const initials = getSubscriberInitials(row.fullName);
  const kind = getCustomerKind(row);
  const owed = getAmountOwed(row);

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-background">
      <Link to={customerProfilePath(row.lineId)} className="block p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-medium text-muted-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium text-foreground">{row.fullName}</p>
              <CustomerKindBadge kind={kind} />
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{row.lineId}</p>
          </div>
          <p className="shrink-0 text-end text-sm font-bold tabular-nums text-danger">
            {formatMoney(owed, lang)}
          </p>
        </div>

        {row.phone ? (
          <p className="mt-3 text-xs text-muted-foreground" dir="ltr">
            {row.phone}
          </p>
        ) : null}
      </Link>

      <div className="flex items-center justify-end border-t border-border bg-muted/20 px-4 py-2.5">
        <Link
          to={customerProfilePath(row.lineId)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline"
        >
          {t("finance.debtors.recordPayment")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
