export interface SpeedTier {
  id: number;
  label: string;
  valueMbps: number;
  price: number;
  /** Soft-deleted on server — hidden from username picker, still listed on Speeds page */
  deleted?: boolean;
  totalCount?: number;
  availableCount?: number;
  activeLinkedCount?: number;
  /** Fair usage quota (GB, upload + download) — client storage until API supports it */
  fairUsageGb?: number | null;
}

export interface BackendSpeedTierRow {
  id: number;
  speedValue: number;
  price: number;
  deleted: boolean | null;
  createdAt: string;
}

/** `GET /speeds` — flat tier + aggregate username counts */
export interface BackendSpeedListItem extends BackendSpeedTierRow {
  availableUsernamesCount: number;
  usedUsernamesCount: number;
}

export interface BackendAvailableUsernameRow {
  id: number;
  speedId: number;
  isUsed: boolean | null;
  isOwnerUsername: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  expiryDate?: string | null;
  isExpired?: boolean | null;
}

export interface BackendSpeedJoinRow {
  speed_tiers?: BackendSpeedTierRow;
  speedTiers?: BackendSpeedTierRow;
  available_usernames?: BackendAvailableUsernameRow | null;
  availableUsernames?: BackendAvailableUsernameRow | null;
}

export interface BackendSpeedTierRecord {
  id: number;
  speedValue: number;
  price: number;
}

interface BackendStatusResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

export type SpeedsListResponse = BackendStatusResponse<BackendSpeedListItem[]>;
export type SpeedTierResponse = BackendStatusResponse<BackendSpeedTierRecord>;
