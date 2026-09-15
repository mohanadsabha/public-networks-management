import { formatMoneyILS } from "@/lib/formatMoney";
import { getPaymentMethodLabel } from "@/lib/invoiceUtils";
import type { Subscriber, SubscriberInvoice } from "@/types/subscriber";
import type { TFunction } from "i18next";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface InvoicePrintLabels {
  previewHeading: string;
  lineId: string;
  phone: string;
  facilityType: string;
  createdAt: string;
  amountToPay: string;
  amountPaid: string;
  balanceChange: string;
  paymentMethod: string;
  paidAt: string;
  notes: string;
  status: string;
  printedBy: string;
  printedAt: string;
}

export function buildInvoicePrintHtml(options: {
  dir: "ltr" | "rtl";
  title: string;
  invoice: SubscriberInvoice;
  subscriber: Pick<Subscriber, "lineId" | "fullName" | "phone" | "facilityType">;
  labels: InvoicePrintLabels;
  createdLabel: string;
  paidLabel: string;
  balanceChange: number;
  paymentMethodLabel: string;
  logoUrl?: string;
  brandName?: string;
  printedByName: string;
  printedAtLabel: string;
}): string {
  const {
    dir,
    title,
    invoice,
    subscriber,
    labels,
    createdLabel,
    paidLabel,
    balanceChange,
    paymentMethodLabel,
    logoUrl,
    brandName = "WeWiFi",
    printedByName,
    printedAtLabel,
  } = options;

  const notesBlock = invoice.notes?.trim()
    ? `
      <section class="notes">
        <div class="field-label">${escapeHtml(labels.notes)}</div>
        <div class="notes-text">${escapeHtml(invoice.notes.trim())}</div>
      </section>`
    : "";

  const logoBlock = logoUrl
    ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(brandName)}" onerror="this.style.display='none'" />`
    : `<span class="brand-name">${escapeHtml(brandName)}</span>`;

  return `<!DOCTYPE html>
<html lang="ar" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4 portrait; margin: 10mm; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: "Cairo", system-ui, -apple-system, "Segoe UI", sans-serif;
        color: #111827;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .sheet {
        width: 100%;
        max-width: 190mm;
        margin: 0 auto;
        padding: 0;
        page-break-inside: avoid;
      }
      .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding-bottom: 10px;
        border-bottom: 2px solid #ea580c;
      }
      .brand-logo { height: 34px; width: auto; max-width: 150px; object-fit: contain; }
      .brand-name { font-size: 18px; font-weight: 800; color: #ea580c; }
      .invoice-meta { text-align: ${dir === "rtl" ? "left" : "right"}; }
      .invoice-meta .label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #9ca3af; }
      .invoice-meta .number { margin-top: 2px; font-size: 20px; font-weight: 800; color: #111827; direction: ltr; }
      .hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-top: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
        color: #fff;
      }
      .hero-title { margin: 0; font-size: 16px; font-weight: 700; }
      .hero-sub { margin: 4px 0 0; font-size: 12px; opacity: 0.92; }
      .badge {
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.2);
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 18px;
        margin-top: 14px;
      }
      .field-label { font-size: 10px; font-weight: 600; color: #6b7280; margin-bottom: 2px; }
      .field-value { font-size: 13px; font-weight: 600; color: #111827; }
      .summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 14px;
      }
      .amount-card, .payment-card {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 12px 14px;
        background: #fafafa;
      }
      .amount-card { border-color: #fed7aa; background: #fff7ed; }
      .amount-value { margin-top: 4px; font-size: 26px; font-weight: 800; color: #ea580c; direction: ltr; }
      .payment-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 6px 0;
        border-bottom: 1px solid #e5e7eb;
        font-size: 12px;
      }
      .payment-row:last-child { border-bottom: none; padding-bottom: 0; }
      .payment-label { color: #6b7280; }
      .payment-value { font-weight: 600; color: #111827; }
      .payment-value-strong { font-weight: 800; }
      .notes {
        margin-top: 12px;
        padding: 10px 12px;
        border: 1px dashed #d1d5db;
        border-radius: 8px;
        font-size: 12px;
      }
      .notes-text { margin-top: 4px; color: #111827; }
      .print-meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 16px;
        margin-top: 12px;
        padding-top: 10px;
        border-top: 1px solid #e5e7eb;
        font-size: 11px;
      }
      .print-meta-value { font-weight: 700; color: #111827; }
      .footer {
        margin-top: 10px;
        text-align: center;
        font-size: 10px;
        color: #9ca3af;
      }
      @media print {
        body { padding: 0; }
        .sheet { max-width: none; width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="sheet">
      <div class="top">
        ${logoBlock}
        <div class="invoice-meta">
          <div class="label">${escapeHtml(labels.previewHeading)}</div>
          <div class="number">#${invoice.id}</div>
        </div>
      </div>

      <div class="hero">
        <div>
          <p class="hero-title">${escapeHtml(subscriber.fullName)}</p>
          <p class="hero-sub" dir="ltr">${escapeHtml(subscriber.lineId)}</p>
        </div>
        <span class="badge">${escapeHtml(labels.status)}</span>
      </div>

      <div class="grid">
        <div>
          <div class="field-label">${escapeHtml(labels.lineId)}</div>
          <div class="field-value" dir="ltr">${escapeHtml(subscriber.lineId)}</div>
        </div>
        <div>
          <div class="field-label">${escapeHtml(labels.phone)}</div>
          <div class="field-value" dir="ltr">${escapeHtml(subscriber.phone?.trim() || "—")}</div>
        </div>
        <div>
          <div class="field-label">${escapeHtml(labels.facilityType)}</div>
          <div class="field-value">${escapeHtml(subscriber.facilityType?.trim() || "—")}</div>
        </div>
        <div>
          <div class="field-label">${escapeHtml(labels.createdAt)}</div>
          <div class="field-value" dir="ltr">${escapeHtml(createdLabel)}</div>
        </div>
      </div>

      <div class="summary">
        <div class="amount-card">
          <div class="field-label">${escapeHtml(labels.amountToPay)}</div>
          <div class="amount-value">${escapeHtml(formatMoneyILS(invoice.amount))}</div>
        </div>
        <div class="payment-card">
          <div class="payment-row">
            <span class="payment-label">${escapeHtml(labels.amountPaid)}</span>
            <span class="payment-value" dir="ltr">${escapeHtml(formatMoneyILS(invoice.paidAmount))}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">${escapeHtml(labels.balanceChange)}</span>
            <span class="payment-value payment-value-strong" dir="ltr">${escapeHtml(formatMoneyILS(balanceChange))}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">${escapeHtml(labels.paymentMethod)}</span>
            <span class="payment-value">${escapeHtml(paymentMethodLabel)}</span>
          </div>
          <div class="payment-row">
            <span class="payment-label">${escapeHtml(labels.paidAt)}</span>
            <span class="payment-value" dir="ltr">${escapeHtml(paidLabel)}</span>
          </div>
        </div>
      </div>

      ${notesBlock}

      <div class="print-meta">
        <div>
          <div class="field-label">${escapeHtml(labels.printedBy)}</div>
          <div class="print-meta-value">${escapeHtml(printedByName)}</div>
        </div>
        <div>
          <div class="field-label">${escapeHtml(labels.printedAt)}</div>
          <div class="print-meta-value" dir="ltr">${escapeHtml(printedAtLabel)}</div>
        </div>
      </div>

      <div class="footer">${escapeHtml(brandName)}</div>
    </div>
  </body>
</html>`;
}

/**
 * Prints invoice HTML via a hidden iframe. This avoids popup windows entirely
 * (a popup opened with `noopener` returns `null`, which produced a blank window),
 * and is the most reliable cross-browser way to print a self-contained document.
 */
export function openInvoicePrintWindow(html: string): void {
  const existing = document.getElementById("invoice-print-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "invoice-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentWindow?.document;
  if (!frameDoc) {
    iframe.remove();
    return;
  }

  let printed = false;
  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1000);
  };

  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      iframe.remove();
      return;
    }
    try {
      frameWindow.focus();
      frameWindow.print();
    } finally {
      cleanup();
    }
  };

  iframe.onload = () => window.setTimeout(triggerPrint, 250);

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  window.setTimeout(triggerPrint, 600);
}

export function getInvoicePrintLabels(
  t: TFunction,
  invoice: SubscriberInvoice,
): InvoicePrintLabels {
  return {
    previewHeading: t("subscribers.invoices.previewHeading"),
    lineId: t("subscribers.table.lineId"),
    phone: t("subscribers.form.phone"),
    facilityType: t("subscribers.form.facilityType"),
    createdAt: t("subscribers.table.createdAt"),
    amountToPay: t("subscribers.invoices.amountToPay"),
    amountPaid: t("subscribers.invoices.amountPaid"),
    balanceChange: t("subscribers.invoices.balanceChange"),
    paymentMethod: t("subscribers.invoices.paymentMethod"),
    paidAt: t("subscribers.invoices.paidAt"),
    notes: t("subscribers.form.notes"),
    status: t(`subscribers.invoices.status_${invoice.status}`),
    printedBy: t("subscribers.invoices.printedBy"),
    printedAt: t("subscribers.invoices.printedAt"),
  };
}

export function getInvoicePaymentMethodLabel(
  invoice: SubscriberInvoice,
  t: TFunction,
): string {
  return getPaymentMethodLabel(invoice.paymentMethod, t);
}
