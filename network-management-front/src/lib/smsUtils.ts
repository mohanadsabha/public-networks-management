import { getDaysUntilDisconnect, isStoppedSubscriber } from "@/lib/subscriberUtils";
import type { Subscriber } from "@/types/subscriber";
import type { SmsAudienceFilter, SmsRecipient, SmsTemplate } from "@/types/sms";

const SOON_MAX_DAYS = 7;

export function toSmsRecipient(row: Subscriber): SmsRecipient {
  return {
    id: row.id,
    lineId: row.lineId,
    fullName: row.fullName,
    phone: row.phone,
    username: row.username,
    balance: row.balance,
    daysLeft: getDaysUntilDisconnect(row),
    isSuspended: row.isSuspended,
  };
}

export function matchesSmsSearch(row: SmsRecipient, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [row.lineId, row.fullName, row.phone ?? "", row.username ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function matchesSmsAudience(row: SmsRecipient, filter: SmsAudienceFilter): boolean {
  if (!row.phone?.trim()) return false;

  switch (filter) {
    case "customers":
      return !row.isSuspended && !row.username;
    case "all":
      return !row.isSuspended && Boolean(row.username);
    case "connected":
      return !row.isSuspended && Boolean(row.username);
    case "stopped":
      return row.isSuspended;
    case "withDebt":
      return row.balance < 0;
    case "expired":
      return !row.isSuspended && row.daysLeft !== null && row.daysLeft < 0;
    case "expires1Day":
      return (
        !row.isSuspended &&
        row.daysLeft !== null &&
        row.daysLeft >= 0 &&
        row.daysLeft <= 1
      );
    case "expires2Days":
      return !row.isSuspended && row.daysLeft === 2;
    case "expiresSoon":
      return (
        !row.isSuspended &&
        row.daysLeft !== null &&
        row.daysLeft >= 0 &&
        row.daysLeft <= SOON_MAX_DAYS
      );
    default:
      return true;
  }
}

/** Maps frontend-only filters to API audience query param */
export function smsRecipientsApiAudience(audience: SmsAudienceFilter): SmsAudienceFilter {
  if (audience === "connected") return "all";
  return audience;
}

export function filterSmsConnectedRecipients(
  rows: SmsRecipient[],
  onlineUsernames: ReadonlySet<string>,
): SmsRecipient[] {
  return rows.filter((row) => {
    const key = row.username?.trim().toLowerCase();
    return Boolean(key && onlineUsernames.has(key));
  });
}
export function filterSmsRecipients(
  rows: SmsRecipient[],
  filters: { audience: SmsAudienceFilter; search: string },
): SmsRecipient[] {
  return rows.filter(
    (row) => matchesSmsAudience(row, filters.audience) && matchesSmsSearch(row, filters.search),
  );
}

export function buildSmsRecipientsFromSubscribers(subscribers: Subscriber[]): SmsRecipient[] {
  return subscribers
    .filter((s) => !isStoppedSubscriber(s) || s.phone)
    .map(toSmsRecipient)
    .filter((r) => r.phone?.trim());
}

export const SMS_MAX_LENGTH = 320;

export interface SmsTemplateVariables {
  name?: string;
  fullName?: string;
  lineId?: string;
  username?: string;
  phone?: string;
}

/** Replace `{{name}}`, `{{lineId}}`, etc. in template body. */
export function applySmsTemplateVariables(body: string, vars: SmsTemplateVariables): string {
  const values: Record<string, string> = {
    name: vars.name ?? vars.fullName ?? "",
    fullName: vars.fullName ?? vars.name ?? "",
    lineId: vars.lineId ?? "",
    username: vars.username ?? "",
    phone: vars.phone ?? "",
  };
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "");
}

export function findWelcomeSmsTemplate(templates: SmsTemplate[]): SmsTemplate | undefined {
  return templates.find((template) => /welcome|ترحيب|ترحيبية/i.test(template.name));
}
