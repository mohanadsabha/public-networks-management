import type { SmsCustomGroup, SmsGroupMember } from "@/types/sms";

export interface BackendSmsGroupMember {
  subscriberId: number;
  lineId: string;
  fullName: string;
  phone: string | null;
  username: string | null;
}

export interface BackendSmsGroup {
  id: number;
  name: string;
  description: string | null;
  members: BackendSmsGroupMember[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

function toIso(value: string | Date | null | undefined): string {
  if (value == null) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapMember(row: BackendSmsGroupMember): SmsGroupMember {
  return {
    subscriberId: row.subscriberId,
    lineId: row.lineId,
    fullName: row.fullName,
    phone: row.phone,
    username: row.username,
  };
}

export function mapSmsGroup(row: BackendSmsGroup): SmsCustomGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    members: (row.members ?? []).map(mapMember),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function mapSmsGroups(rows: BackendSmsGroup[]): SmsCustomGroup[] {
  return rows.map(mapSmsGroup).sort((a, b) => a.name.localeCompare(b.name, "ar"));
}
