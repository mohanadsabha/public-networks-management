import type { TFunction } from "i18next";
import { formatInvoiceUsernameNote } from "@/lib/invoiceUtils";
import type { CreateLocalInvoiceInput } from "@/lib/localInvoices";
import { buildSpeedLabel } from "@/lib/subscriberUtils";
import type { SpeedTier } from "@/types/speeds";

export type UsernameInvoiceKind = "assign" | "change" | "renew";

export function getSpeedTierChargeAmount(
  speedTiers: SpeedTier[],
  speedId: number | null | undefined,
  fallbackMonthlyPrice?: number,
): number {
  const tierPrice =
    speedId != null ? speedTiers.find((tier) => tier.id === speedId)?.price : undefined;
  if (tierPrice != null && tierPrice > 0) return tierPrice;
  return Math.max(0, fallbackMonthlyPrice ?? 0);
}

export function buildUsernameChargeInvoiceInput(options: {
  lineId: string;
  username: string;
  speedId: number | null | undefined;
  speedMbps?: number | null;
  speedTiers: SpeedTier[];
  fallbackMonthlyPrice?: number;
  kind: UsernameInvoiceKind;
  changeCause?: string | null;
  t: TFunction;
}): CreateLocalInvoiceInput | null {
  const trimmedUsername = options.username.trim();
  if (!trimmedUsername) return null;

  const amount = getSpeedTierChargeAmount(
    options.speedTiers,
    options.speedId,
    options.fallbackMonthlyPrice,
  );
  if (amount <= 0) return null;

  const tier = options.speedId != null
    ? options.speedTiers.find((row) => row.id === options.speedId)
    : undefined;
  const speedMbps = options.speedMbps ?? tier?.valueMbps ?? 0;
  const speedLabel = speedMbps > 0 ? buildSpeedLabel(speedMbps) : tier?.label ?? "";

  const noteKey =
    options.kind === "assign"
      ? "subscribers.invoices.usernameAssignedNote"
      : options.kind === "renew"
        ? "subscribers.invoices.usernameRenewedNote"
        : "subscribers.invoices.usernameChangedNote";

  let notes = options.t(noteKey, {
    username: trimmedUsername,
    speedLabel,
    amount,
  });

  if (options.changeCause?.trim()) {
    notes += ` — ${options.changeCause.trim()}`;
  }

  notes += `\n${formatInvoiceUsernameNote(trimmedUsername)}`;

  return {
    lineId: options.lineId,
    amount,
    paidAmount: 0,
    paymentMethod: null,
    notes,
    relatedUsername: trimmedUsername,
  };
}
