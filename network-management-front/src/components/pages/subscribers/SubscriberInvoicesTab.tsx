import { Eye, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { InvoiceFormModal, type InvoiceFormValues } from "@/components/pages/subscribers/InvoiceFormModal";
import { InvoicePreviewModal } from "@/components/pages/subscribers/InvoicePreviewModal";
import { Button } from "@/components/ui/buttons";
import { StatusBadge } from "@/components/ui/data";
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
} from "@/components/ui/data";
import { ConfirmDialog } from "@/components/ui/modals";
import { LoadingState } from "@/components/ui/feedback";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { formatMoneyILS } from "@/lib/formatMoney";
import { balanceDeltaForInvoice, getPaymentMethodLabel } from "@/lib/invoiceUtils";
import { runningBalancesChronological } from "@/lib/localInvoices";
import type { InvoiceSummary } from "@/types/invoice";
import type { Subscriber, SubscriberInvoice } from "@/types/subscriber";
import { format, parseISO } from "date-fns";

interface SubscriberInvoicesTabProps {
  invoices: SubscriberInvoice[];
  summary: InvoiceSummary;
  monthlyPrice: number;
  subscriber: Pick<Subscriber, "lineId" | "fullName" | "phone" | "facilityType" | "username">;
  canManage?: boolean;
  isLoading?: boolean;
  onAddInvoice?: (values: InvoiceFormValues) => Promise<void> | void;
  onDeleteInvoice?: (invoiceId: number) => Promise<void> | void;
}

const INVOICE_VARIANT = {
  unpaid: "warning",
  partial: "accent",
  paid: "success",
  debt: "danger",
} as const;

/** Fixed px widths — keeps headers and cells on one line in RTL (Arabic). */
const INVOICE_COLUMN_WIDTHS = [44, 108, 108, 108, 108, 92, 140, 104, 104, 84] as const;

export function SubscriberInvoicesTab({
  invoices,
  summary,
  monthlyPrice,
  subscriber,
  canManage = false,
  isLoading = false,
  onAddInvoice,
  onDeleteInvoice,
}: SubscriberInvoicesTabProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<SubscriberInvoice | null>(null);
  const [invoiceToPreview, setInvoiceToPreview] = useState<SubscriberInvoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const runningBalanceById = useMemo(() => runningBalancesChronological(invoices), [invoices]);

  const handleSubmit = async (values: InvoiceFormValues) => {
    if (!onAddInvoice) return;
    setIsSubmitting(true);
    try {
      await onAddInvoice(values);
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete || !onDeleteInvoice) return;
    setIsDeleting(true);
    try {
      await onDeleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? <LoadingState variant="section" /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label={t("subscribers.invoices.balance")}
          value={formatMoneyILS(summary.balance)}
          valueClassName={summary.balance < 0 ? "text-danger" : "text-foreground"}
        />
        <SummaryCard
          label={t("subscribers.invoices.monthlyPriceLabel")}
          value={formatMoneyILS(monthlyPrice)}
        />
        <SummaryCard
          label={t("subscribers.invoices.totalPaid")}
          value={formatMoneyILS(summary.totalPaid)}
          valueClassName="text-success"
        />
        <SummaryCard
          label={t("subscribers.invoices.totalBilled")}
          value={formatMoneyILS(summary.totalCharged)}
        />
      </div>

      {canManage && onAddInvoice ? (
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("subscribers.invoices.add")}
        </Button>
      ) : null}

      {invoices.length === 0 ? (
        <Text muted className="text-sm">{t("subscribers.invoices.empty")}</Text>
      ) : (
        <div className={dataTableWrapClass} dir="ltr">
          <table className={cn(dataTableDenseFixedClass, dataTableScrollMinClass, "min-w-[1000px]")}>
            <colgroup>
              {INVOICE_COLUMN_WIDTHS.map((width, index) => (
                <col key={index} style={{ width: `${width}px` }} />
              ))}
            </colgroup>
            <thead>
              <tr className={dataTableHeadRowClass}>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-left")}>#</th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-right")}>
                  {t("subscribers.invoices.amountToPay")}
                </th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-right")}>
                  {t("subscribers.invoices.amountPaid")}
                </th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-right")}>
                  {t("subscribers.invoices.balanceChange")}
                </th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-right")}>
                  {t("subscribers.invoices.balanceAfter")}
                </th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-left")}>
                  {t("subscribers.invoices.status")}
                </th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-left")}>
                  {t("subscribers.form.notes")}
                </th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-left")}>
                  {t("subscribers.invoices.paymentMethod")}
                </th>
                <th className={cn(dataTableDenseHeadCellClass, "whitespace-nowrap text-left")}>
                  {t("subscribers.table.createdAt")}
                </th>
                <th className={cn(dataTableActionsHeadCellClass, "whitespace-nowrap")}>
                  {t("subscribers.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => {
                const delta = balanceDeltaForInvoice(inv.amount, inv.paidAmount);
                const balanceAfter = runningBalanceById.get(inv.id) ?? delta;

                return (
                  <tr key={inv.id} className={dataTableBodyRowClass}>
                    <td className={cn(dataTableDenseCellClass, "whitespace-nowrap text-left tabular-nums")}>
                      {inv.id}
                    </td>
                    <td className={cn(dataTableDenseCellClass, "whitespace-nowrap text-right tabular-nums font-medium")}>
                      {formatMoneyILS(inv.amount)}
                    </td>
                    <td className={cn(dataTableDenseCellClass, "whitespace-nowrap text-right tabular-nums font-medium")}>
                      {formatMoneyILS(inv.paidAmount)}
                    </td>
                    <td
                      className={cn(
                        dataTableDenseCellClass,
                        "whitespace-nowrap text-right tabular-nums font-semibold",
                        delta < 0 ? "text-danger" : delta > 0 ? "text-success" : "text-foreground",
                      )}
                    >
                      {formatMoneyILS(delta)}
                    </td>
                    <td
                      className={cn(
                        dataTableDenseCellClass,
                        "whitespace-nowrap text-right tabular-nums",
                        balanceAfter < 0 ? "text-danger" : "text-foreground",
                      )}
                    >
                      {formatMoneyILS(balanceAfter)}
                    </td>
                    <td className={cn(dataTableDenseCellClass, "whitespace-nowrap text-left")}>
                      <StatusBadge
                        label={t(`subscribers.invoices.status_${inv.status}`)}
                        variant={INVOICE_VARIANT[inv.status]}
                      />
                    </td>
                    <td className={cn(dataTableDenseCellClass, "text-left")}>
                      <p className="line-clamp-2 text-sm">{inv.notes || "—"}</p>
                    </td>
                    <td className={cn(dataTableDenseCellClass, "whitespace-nowrap text-left text-muted-foreground")}>
                      {getPaymentMethodLabel(inv.paymentMethod, t)}
                    </td>
                    <td className={cn(dataTableDenseCellClass, "whitespace-nowrap text-left text-muted-foreground")}>
                      {format(parseISO(inv.createdAt), "yyyy-MM-dd")}
                    </td>
                    <td className={dataTableActionsCellClass}>
                      <div className="inline-flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("subscribers.invoices.preview")}
                          onClick={() => setInvoiceToPreview(inv)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canManage && onDeleteInvoice ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("subscribers.invoices.delete")}
                            onClick={() => setInvoiceToDelete(inv)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        monthlyPrice={monthlyPrice}
        currentBalance={summary.balance}
      />

      <InvoicePreviewModal
        open={invoiceToPreview !== null}
        onClose={() => setInvoiceToPreview(null)}
        invoice={invoiceToPreview}
        subscriber={subscriber}
      />

      <ConfirmDialog
        open={invoiceToDelete !== null}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t("subscribers.invoices.deleteTitle")}
        message={
          invoiceToDelete
            ? t("subscribers.invoices.deleteMessage", {
                id: invoiceToDelete.id,
                amount: invoiceToDelete.amount,
              })
            : ""
        }
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3">
      <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
      <p className={cn("mt-1 text-xl font-bold tabular-nums", valueClassName)} dir="ltr">
        {value}
      </p>
    </div>
  );
}
