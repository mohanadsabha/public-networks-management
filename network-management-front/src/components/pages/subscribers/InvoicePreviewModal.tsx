import { Printer } from "lucide-react";
import { ar, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/ui/data";
import { Modal } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import { formatMoneyILS } from "@/lib/formatMoney";
import {
  buildInvoicePrintHtml,
  getInvoicePaymentMethodLabel,
  getInvoicePrintLabels,
  openInvoicePrintWindow,
} from "@/lib/invoicePrint";
import { balanceDeltaForInvoice, getPaymentMethodLabel } from "@/lib/invoiceUtils";
import type { Subscriber, SubscriberInvoice } from "@/types/subscriber";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/cn";

const INVOICE_VARIANT = {
  unpaid: "warning",
  partial: "accent",
  paid: "success",
  debt: "danger",
} as const;

interface InvoicePreviewModalProps {
  open: boolean;
  onClose: () => void;
  invoice: SubscriberInvoice | null;
  subscriber: Pick<Subscriber, "lineId" | "fullName" | "phone" | "facilityType">;
}

export function InvoicePreviewModal({
  open,
  onClose,
  invoice,
  subscriber,
}: InvoicePreviewModalProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  if (!invoice) return null;

  const balanceChange = balanceDeltaForInvoice(invoice.amount, invoice.paidAmount);
  const createdLabel = format(parseISO(invoice.createdAt), "yyyy-MM-dd");
  const paidLabel = invoice.paidAt ? format(parseISO(invoice.paidAt), "yyyy-MM-dd") : "—";
  const dateLocale = i18n.language.startsWith("ar") ? ar : enUS;
  const printedByName = user?.name?.trim() || user?.username || "—";

  const formatPrintTimestamp = () =>
    format(new Date(), "dd/MM/yyyy HH:mm", { locale: dateLocale });

  const handlePrint = () => {
    const html = buildInvoicePrintHtml({
      dir: i18n.dir(),
      title: t("subscribers.invoices.previewTitle", { id: invoice.id }),
      invoice,
      subscriber,
      labels: getInvoicePrintLabels(t, invoice),
      createdLabel,
      paidLabel,
      balanceChange,
      paymentMethodLabel: getInvoicePaymentMethodLabel(invoice, t),
      logoUrl: `${window.location.origin}/images/logo.png`,
      brandName: "WeWiFi",
      printedByName,
      printedAtLabel: formatPrintTimestamp(),
    });
    openInvoicePrintWindow(html);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("subscribers.invoices.previewTitle", { id: invoice.id })}
      className="sm:max-w-md"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            {t("subscribers.invoices.print")}
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b-2 border-primary px-4 py-3">
          <img
            src="/images/logo.png"
            alt="WeWiFi"
            className="h-7 w-auto max-w-[130px] object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="text-end">
            <Text muted className="text-[10px] font-semibold uppercase tracking-wider">
              {t("subscribers.invoices.previewHeading")}
            </Text>
            <p className="text-lg font-bold tabular-nums text-foreground" dir="ltr">
              #{invoice.id}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-primary to-primary/85 px-4 py-3 text-primary-foreground">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{subscriber.fullName}</p>
            <p className="text-xs opacity-90 tabular-nums" dir="ltr">
              {subscriber.lineId}
            </p>
          </div>
          <StatusBadge
            label={t(`subscribers.invoices.status_${invoice.status}`)}
            variant={INVOICE_VARIANT[invoice.status]}
          />
        </div>

        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <InvoiceField label={t("subscribers.table.lineId")} value={subscriber.lineId} ltr />
            <InvoiceField
              label={t("subscribers.form.phone")}
              value={subscriber.phone ?? "—"}
              ltr={Boolean(subscriber.phone)}
            />
            <InvoiceField
              label={t("subscribers.form.facilityType")}
              value={subscriber.facilityType?.trim() || "—"}
            />
            {invoice.relatedUsername ? (
              <InvoiceField
                label={t("subscribers.invoices.relatedUsername")}
                value={invoice.relatedUsername}
                ltr
              />
            ) : null}
            <InvoiceField label={t("subscribers.table.createdAt")} value={createdLabel} ltr />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5">
              <Text muted className="text-[10px] font-semibold uppercase tracking-wide">
                {t("subscribers.invoices.amountToPay")}
              </Text>
              <p className="mt-0.5 text-xl font-bold text-primary tabular-nums" dir="ltr">
                {formatMoneyILS(invoice.amount)}
              </p>
            </div>
            <div className="rounded-lg border border-success/25 bg-success/5 px-3 py-2.5">
              <Text muted className="text-[10px] font-semibold uppercase tracking-wide">
                {t("subscribers.invoices.amountPaid")}
              </Text>
              <p className="mt-0.5 text-xl font-bold text-success tabular-nums" dir="ltr">
                {formatMoneyILS(invoice.paidAmount)}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg border px-3 py-2.5",
              balanceChange < 0 ? "border-danger/40 bg-danger/10" : "border-success/40 bg-success/10",
            )}
          >
            <Text muted className="text-[10px] font-semibold uppercase tracking-wide">
              {t("subscribers.invoices.balanceChange")}
            </Text>
            <p
              className={cn(
                "mt-0.5 text-lg font-bold tabular-nums",
                balanceChange < 0 ? "text-danger" : balanceChange > 0 ? "text-success" : "text-foreground",
              )}
              dir="ltr"
            >
              {formatMoneyILS(balanceChange)}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/15 px-3 py-1">
            <InvoiceRow
              label={t("subscribers.invoices.paymentMethod")}
              value={getPaymentMethodLabel(invoice.paymentMethod, t)}
            />
            <InvoiceRow label={t("subscribers.invoices.paidAt")} value={paidLabel} ltr />
          </div>

          {invoice.notes?.trim() ? (
            <div className="rounded-lg border border-dashed border-border px-3 py-2">
              <Text muted className="text-[10px] font-semibold uppercase">
                {t("subscribers.form.notes")}
              </Text>
              <p className="mt-0.5 text-xs text-foreground">{invoice.notes}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
            <InvoiceField label={t("subscribers.invoices.printedBy")} value={printedByName} />
            <InvoiceField
              label={t("subscribers.invoices.printedAt")}
              value={formatPrintTimestamp()}
              ltr
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InvoiceField({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div>
      <Text muted className="text-[10px] font-medium">{label}</Text>
      <p
        className={cn("mt-0.5 text-xs font-semibold text-foreground", ltr && "tabular-nums")}
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function InvoiceRow({
  label,
  value,
  strong = false,
  ltr = false,
  compact = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  ltr?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border/50 last:border-0",
        compact ? "py-1.5" : "py-2",
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn("text-xs text-foreground tabular-nums", strong && "font-bold")}
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </span>
    </div>
  );
}
