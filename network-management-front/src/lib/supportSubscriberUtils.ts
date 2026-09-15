import type { SupportTicket } from "@/types/supportTicket";
import type { Subscriber } from "@/types/subscriber";

/** Digits-only phone for loose matching (05x / 972x). */
export function normalizePhoneDigits(phone: string | null | undefined): string {
  if (!phone?.trim()) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function ticketMatchesSubscriber(
  ticket: SupportTicket,
  subscriber: Pick<Subscriber, "phone" | "fullName">,
): boolean {
  const subPhone = normalizePhoneDigits(subscriber.phone);
  const ticketPhone = normalizePhoneDigits(ticket.subscriberPhone);

  if (subPhone && ticketPhone) {
    if (subPhone === ticketPhone) return true;
    if (subPhone.length >= 9 && ticketPhone.length >= 9) {
      return subPhone.slice(-9) === ticketPhone.slice(-9);
    }
  }

  const subName = subscriber.fullName.trim().toLowerCase();
  const ticketName = ticket.subscriberName.trim().toLowerCase();
  return Boolean(subName && ticketName && subName === ticketName);
}

export function filterSupportTicketsForSubscriber(
  tickets: SupportTicket[],
  subscriber: Pick<Subscriber, "phone" | "fullName">,
): SupportTicket[] {
  return tickets
    .filter((ticket) => ticketMatchesSubscriber(ticket, subscriber))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
