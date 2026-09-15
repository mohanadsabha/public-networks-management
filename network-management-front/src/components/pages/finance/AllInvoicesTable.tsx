import { Eye, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InvoicePreviewModal } from "@/components/pages/subscribers/InvoicePreviewModal";
import { Button } from "@/components/ui/buttons";
import { StatusBadge } from "@/components/ui/data";
import {
  dataTableActionsCellClass,
  dataTableActionsHeadCellClass,
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableFixedClass,
  dataTableHeadCellClass,
  dataTableHeadRowClass,
  dataTableNumericCellClass,
  dataTableNumericHeadCellClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
} from "@/components/ui/data/tableClasses";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatMoneyILS } from "@/lib/formatMoney";
import { getPaymentMethodLabel } from "@/lib/invoiceUtils";
import { subscriberProfilePath } from "@/lib/routePaths";
import type { InvoiceListItem } from "@/types/invoice";
import { format, parseISO } from "date-fns";

/** Fixed px widths — stable alignment when the page is RTL */
const COLUMN_WIDTHS = [52, 168, 100, 120, 120, 96, 120, 108, 100, 88] as const;

const INVOICE_VARIANT = {
  unpaid: "warning",
  partial: "accent",
  paid: "success",
  debt: "danger",
} as const;

interface AllInvoicesTableProps {
  rows: InvoiceListItem[];
}

export function AllInvoicesTable({ rows }: AllInvoicesTableProps) {
  const { t } = useTranslation();
  const [invoiceToPreview, setInvoiceToPreview] = useState<InvoiceListItem | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
        <Text muted>{t("finance.invoices.empty")}</Text>
        <Text muted className="mt-2 text-sm">
          {t("finance.invoices.emptyHint")}
        </Text>
      </div>
    );
  }

  return (
    <>
      <div className={dataTableWrapClass} dir="ltr">
        <table className={cn(dataTableFixedClass, dataTableScrollMinClass, "min-w-[1084px]")}>
          <colgroup>
            {COLUMN_WIDTHS.map((width, index) => (
              <col key={index} style={{ width: `${width}px` }} />
            ))}
          </colgroup>
          <thead>
            <tr className={dataTableHeadRowClass}>
              <th className={cn(dataTableHeadCellClass, "whitespace-nowrap text-left")}>#</th>
              <th className={cn(dataTableHeadCellClass, "whitespace-nowrap text-left")}>
                {t("finance.invoices.subscriber")}
              </th>
              <th className={cn(dataTableHeadCellClass, "whitespace-nowrap text-left")}>
                {t("finance.invoices.lineId")}
              </th>
              <th className={cn(dataTableNumericHeadCellClass, "whitespace-nowrap")}>
                {t("subscribers.invoices.amountToPay")}
              </th>
              <th className={cn(dataTableNumericHeadCellClass, "whitespace-nowrap")}>
                {t("subscribers.invoices.amountPaid")}
              </th>
              <th className={cn(dataTableHeadCellClass, "whitespace-nowrap text-left")}>
                {t("subscribers.invoices.status")}
              </th>
              <th className={cn(dataTableHeadCellClass, "whitespace-nowrap text-left")}>
                {t("subscribers.invoices.paymentMethod")}
              </th>
              <th className={cn(dataTableHeadCellClass, "whitespace-nowrap text-left")}>
                {t("subscribers.table.createdAt")}
              </th>
              <th className={cn(dataTableHeadCellClass, "whitespace-nowrap text-left")}>
                {t("subscribers.invoices.relatedUsername")}
              </th>
              <th className={cn(dataTableActionsHeadCellClass, "whitespace-nowrap")}>
                {t("subscribers.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={dataTableBodyRowClass}>
                <td className={cn(dataTableCellClass, "text-left tabular-nums")}>{row.id}</td>
                <td className={cn(dataTableCellClass, "text-left")}>
                  <p className="truncate font-medium text-foreground">{row.subscriberName}</p>
                  {row.subscriberPhone ? (
                    <p className="truncate text-xs text-muted-foreground" dir="ltr">
                      {row.subscriberPhone}
                    </p>
                  ) : null}
                </td>
                <td className={cn(dataTableCellClass, "text-left font-mono text-xs")} dir="ltr">
                  {row.subscriberLineId}
                </td>
                <td className={dataTableNumericCellClass}>{formatMoneyILS(row.amount)}</td>
                <td className={dataTableNumericCellClass}>{formatMoneyILS(row.paidAmount)}</td>
                <td className={cn(dataTableCellClass, "text-left")}>
                  <StatusBadge
                    label={t(`subscribers.invoices.status_${row.status}`)}
                    variant={INVOICE_VARIANT[row.status]}
                  />
                </td>
                <td className={cn(dataTableCellClass, "text-left text-muted-foreground")}>
                  <span className="block truncate">
                    {getPaymentMethodLabel(row.paymentMethod, t)}
                  </span>
                </td>
                <td className={cn(dataTableCellClass, "text-left whitespace-nowrap text-muted-foreground")}>
                  {format(parseISO(row.createdAt), "yyyy-MM-dd")}
                </td>
                <td className={cn(dataTableCellClass, "text-left font-mono text-xs")} dir="ltr">
                  {row.relatedUsername ?? "—"}
                </td>
                <td className={dataTableActionsCellClass}>
                  <div className="inline-flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("subscribers.invoices.preview")}
                      onClick={() => setInvoiceToPreview(row)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Link
                      to={subscriberProfilePath(row.subscriberLineId, "invoices")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={t("finance.invoices.openProfile")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InvoicePreviewModal
        open={invoiceToPreview !== null}
        onClose={() => setInvoiceToPreview(null)}
        invoice={invoiceToPreview}
        subscriber={{
          lineId: invoiceToPreview?.subscriberLineId ?? "",
          fullName: invoiceToPreview?.subscriberName ?? "",
          phone: invoiceToPreview?.subscriberPhone ?? null,
          facilityType: invoiceToPreview?.subscriberFacilityType ?? "",
        }}
      />
    </>
  );
}
