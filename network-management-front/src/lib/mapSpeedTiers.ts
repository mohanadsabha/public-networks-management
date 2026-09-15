import { buildSpeedLabel } from "@/lib/speedLabel";
import type {
  BackendAvailableUsernameRow,
  BackendSpeedJoinRow,
  BackendSpeedListItem,
  SpeedTier,
} from "@/types/speeds";

function isJoinRow(row: BackendSpeedJoinRow | BackendSpeedListItem): row is BackendSpeedJoinRow {
  return "speed_tiers" in row || "speedTiers" in row;
}

function getTierRow(row: BackendSpeedJoinRow) {
  return row.speed_tiers ?? row.speedTiers;
}

function getUsernameRow(row: BackendSpeedJoinRow): BackendAvailableUsernameRow | null {
  return row.available_usernames ?? row.availableUsernames ?? null;
}

function isActiveUsername(username: BackendAvailableUsernameRow): boolean {
  if (username.isOwnerUsername) {
    return true;
  }

  const endDate = username.endDate ?? username.expiryDate;
  if (!endDate) {
    return false;
  }

  return new Date(endDate) > new Date();
}

function sortSpeedTiers(tiers: SpeedTier[]): SpeedTier[] {
  return [...tiers].sort((a, b) => {
    if (a.deleted !== b.deleted) {
      return a.deleted ? 1 : -1;
    }
    return a.valueMbps - b.valueMbps;
  });
}

/** Maps `GET /speeds` item (flat list with server-side counts). */
export function mapSpeedListItem(item: BackendSpeedListItem): SpeedTier {
  const notExpired = item.availableUsernamesCount ?? 0;
  const used = item.usedUsernamesCount ?? 0;
  /** Matches `GET /speeds/:id/usernames` — only unused, non-expired rows appear in the pool table. */
  const inPool = Math.max(0, notExpired - used);

  return {
    id: item.id,
    label: buildSpeedLabel(item.speedValue),
    valueMbps: item.speedValue,
    price: Number(item.price),
    deleted: item.deleted === true,
    totalCount: inPool,
    availableCount: inPool,
    activeLinkedCount: used,
  };
}

/** Legacy join rows from older API shape (kept for safety). */
function mapSpeedsJoinResponse(rows: BackendSpeedJoinRow[]): SpeedTier[] {
  const grouped = new Map<
    number,
    { tier: NonNullable<ReturnType<typeof getTierRow>>; usernames: BackendAvailableUsernameRow[] }
  >();

  for (const row of rows) {
    const tier = getTierRow(row);
    if (!tier) {
      continue;
    }

    const existing = grouped.get(tier.id);
    if (existing) {
      const username = getUsernameRow(row);
      if (username) {
        existing.usernames.push(username);
      }
      continue;
    }

    grouped.set(tier.id, {
      tier,
      usernames: getUsernameRow(row) ? [getUsernameRow(row)!] : [],
    });
  }

  return sortSpeedTiers(
    Array.from(grouped.values()).map(({ tier, usernames }) => ({
      id: tier.id,
      label: buildSpeedLabel(tier.speedValue),
      valueMbps: tier.speedValue,
      price: Number(tier.price),
      deleted: tier.deleted === true,
      totalCount: usernames.length,
      availableCount: usernames.filter((username) => !username.isUsed).length,
      activeLinkedCount: usernames.filter(isActiveUsername).length,
    })),
  );
}

export function mapSpeedsResponse(
  rows: Array<BackendSpeedJoinRow | BackendSpeedListItem>,
): SpeedTier[] {
  if (rows.length === 0) {
    return [];
  }

  if (isJoinRow(rows[0])) {
    return mapSpeedsJoinResponse(rows as BackendSpeedJoinRow[]);
  }

  return sortSpeedTiers((rows as BackendSpeedListItem[]).map(mapSpeedListItem));
}

/** Active speeds only — for pickers that should hide removed tiers */
export function getActiveSpeedTiers(tiers: SpeedTier[]): SpeedTier[] {
  return tiers.filter((tier) => !tier.deleted);
}

export function mapSpeedTierRecord(
  record: BackendSpeedListItem | Pick<BackendSpeedListItem, "id" | "speedValue" | "price" | "deleted" | "createdAt">,
): SpeedTier {
  const notExpired = "availableUsernamesCount" in record ? (record.availableUsernamesCount ?? 0) : 0;
  const used = "usedUsernamesCount" in record ? (record.usedUsernamesCount ?? 0) : 0;
  const inPool = Math.max(0, notExpired - used);

  return {
    id: record.id,
    label: buildSpeedLabel(record.speedValue),
    valueMbps: record.speedValue,
    price: Number(record.price),
    deleted: record.deleted === true,
    totalCount: inPool,
    availableCount: inPool,
    activeLinkedCount: used,
  };
}
