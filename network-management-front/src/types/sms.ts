export type SmsAudienceFilter =
  | "all"
  | "connected"
  | "customers"
  | "expires1Day"
  | "expires2Days"
  | "expiresSoon"
  | "expired"
  | "stopped"
  | "withDebt";

export type SmsRecipientMode = "subscribers" | "customers" | "custom" | "groups";

export interface SmsGroupMember {
  subscriberId: number;
  lineId: string;
  fullName: string;
  phone: string | null;
  username: string | null;
}

export interface SmsCustomGroup {
  id: number;
  name: string;
  description: string | null;
  members: SmsGroupMember[];
  createdAt: string;
  updatedAt: string;
}

export type SmsTemplateId = "renewal" | "expired" | "support" | "blank" | number;

export interface SmsRecipient {
  id: number;
  lineId: string;
  fullName: string;
  phone: string | null;
  username: string | null;
  balance: number;
  daysLeft: number | null;
  isSuspended: boolean;
}

export interface SmsTemplate {
  id: number;
  name: string;
  body: string;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdByUserId?: number | null;
  createdByUsername?: string | null;
}

export interface SmsLog {
  id: number;
  phone: string;
  message: string;
  recipientType: string;
  status: "sent" | "failed";
  errorMessage: string | null;
  createdAt: string;
  sentByUserId: number;
  sentByUsername: string | null;
  sentByName: string | null;
  subscriberId: number | null;
  subscriberLineId: string | null;
  subscriberName: string | null;
  templateId: number | null;
  templateName: string | null;
}
