import { format } from "date-fns";
import type { TFunction } from "i18next";
import type { SupportTicket } from "@/types/supportTicket";

const WHATSAPP_BRAND_NAME = "WeWiFi";

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function openExternalUrl(url: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function copyTextToClipboard(text: string): void {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  } catch {
    // ignore
  }
  void navigator.clipboard?.writeText(text).catch(() => {});
}

/** Full group invite URL from `.env` (reference / mobile share only). */
export function getWhatsAppGroupInviteUrl(): string | null {
  const raw = import.meta.env.VITE_WHATSAPP_GROUP_INVITE_URL?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `https://${raw}`;
}

/** Group display name in `.env` — e.g. droub b */
export function getWhatsAppGroupName(): string | null {
  const raw = import.meta.env.VITE_WHATSAPP_GROUP_NAME?.trim();
  return raw || null;
}

export function buildSupportTicketWhatsAppMessage(ticket: SupportTicket, t: TFunction): string {
  const created = format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm");
  const status = t(`support.status.${ticket.status}`);
  const priority = t(`support.priority.${ticket.priority}`);
  const channel = t(`support.channel.${ticket.channel}`);

  const header = t("support.whatsapp.template.header");

  return [
    `*${header}*`,
    "──────────────────────",
    "",
    `🔖 *${t("support.table.ticket")}:* ${ticket.ticketNumber}`,
    `📊 ${t("support.table.status")}: *${status}*  ·  ${t("support.table.priority")}: *${priority}*`,
    `🕐 ${t("support.table.createdAt")}: ${created}`,
    "",
    `👤 *${t("support.whatsapp.template.subscriberBlock")}*`,
    `   ${ticket.subscriberName}`,
    `   ${ticket.subscriberPhone}`,
    "",
    `📌 *${t("support.whatsapp.template.issueBlock")}*`,
    `   ${ticket.title}`,
    "",
    `📝 *${t("support.form.description")}*`,
    ticket.description.trim(),
    "",
    `📡 ${t("support.table.channel")}: ${channel}`,
    `👨‍💼 ${t("support.form.assignedTo")}: ${ticket.assignedTo}`,
    "",
    "──────────────────────",
    t("support.whatsapp.template.footer"),
  ].join("\n");
}

/**
 * WhatsApp official “click to chat” with pre-filled body.
 * User picks the group (search by name from .env) — message is already in the box.
 */
function buildPrefilledComposeUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  return isMobileDevice()
    ? `https://wa.me/?text=${encoded}`
    : `https://web.whatsapp.com/send?text=${encoded}`;
}

export type WhatsAppShareMode = "prefill" | "share";

export interface WhatsAppShareResult {
  mode: WhatsAppShareMode;
  groupName: string | null;
}

/**
 * Opens WhatsApp with the ticket message already written in the compose field.
 * Pick the support group (name from .env) → tap Send.
 *
 * Note: WhatsApp does not allow opening a specific group with text in one URL.
 * Group-invite links open the chat empty; send?text= pre-fills the message.
 */
export function openSupportTicketWhatsApp(
  ticket: SupportTicket,
  t: TFunction,
): WhatsAppShareResult {
  const text = buildSupportTicketWhatsAppMessage(ticket, t);
  const groupName = getWhatsAppGroupName();

  copyTextToClipboard(text);

  const mobile = isMobileDevice();

  if (mobile && typeof navigator.share === "function") {
    void navigator
      .share({
        text,
        title: groupName ?? WHATSAPP_BRAND_NAME,
      })
      .catch(() => {
        openExternalUrl(buildPrefilledComposeUrl(text));
      });
    return { mode: "share", groupName };
  }

  openExternalUrl(buildPrefilledComposeUrl(text));
  return { mode: "prefill", groupName };
}

export function whatsAppShareToastMessage(
  result: WhatsAppShareResult,
  t: TFunction,
): string {
  if (result.groupName) {
    return t("support.whatsapp.messageReadyPickGroup", { group: result.groupName });
  }
  return t("support.whatsapp.messageReady");
}
