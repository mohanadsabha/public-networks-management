import { parsePackageLineFromLineId } from "@/lib/subscriberUtils";
import type { OnlineUser } from "@/types/onlineUser";

interface SubscriberLookup {
  username: string | null;
  lineId: string;
  fullName: string;
  routerName?: string | null;
  routerImageUrl?: string | null;
  routerPort?: string | null;
}

export type OnlineUserGroupFilter =
  | { kind: "line"; packageLine: number }
  | null;

export interface OnlineUserDuplicateGroup {
  id: string;
  kind: "line";
  count: number;
  packageLine: number;
}

export function getPackageLineForOnlineUser(row: OnlineUser): number | null {
  if (row.packageLine != null && row.packageLine > 0) return row.packageLine;
  if (!row.lineId?.trim()) return null;
  const parsed = parsePackageLineFromLineId(row.lineId);
  return parsed > 0 ? parsed : null;
}

export function enrichOnlineUserPackageLine(rows: OnlineUser[]): OnlineUser[] {
  return rows.map((row) => {
    const packageLine = getPackageLineForOnlineUser(row);
    return packageLine ? { ...row, packageLine } : row;
  });
}

export function applyOnlineUserGroupFilter(
  rows: OnlineUser[],
  filter: OnlineUserGroupFilter,
): OnlineUser[] {
  if (!filter) return rows;
  return rows.filter((row) => getPackageLineForOnlineUser(row) === filter.packageLine);
}

export function buildOnlineUserDuplicateGroups(rows: OnlineUser[]): OnlineUserDuplicateGroup[] {
  const lineCounts = new Map<number, number>();

  for (const row of rows) {
    const packageLine = getPackageLineForOnlineUser(row);
    if (packageLine != null) {
      lineCounts.set(packageLine, (lineCounts.get(packageLine) ?? 0) + 1);
    }
  }

  const groups: OnlineUserDuplicateGroup[] = [];

  for (const [packageLine, count] of lineCounts) {
    if (count < 2) continue;
    groups.push({
      id: `line:${packageLine}`,
      kind: "line",
      count,
      packageLine,
    });
  }

  return groups.sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

export function parseOnlineUserGroupChipId(chipId: string): OnlineUserGroupFilter {
  if (!chipId || chipId === "all") return null;
  if (chipId.startsWith("line:")) {
    const packageLine = Number(chipId.slice(5));
    return Number.isFinite(packageLine) && packageLine > 0
      ? { kind: "line", packageLine }
      : null;
  }
  return null;
}

export function onlineUserGroupFilterToChipId(filter: OnlineUserGroupFilter): string {
  if (!filter) return "all";
  return `line:${filter.packageLine}`;
}

/** True when this session is NOT linked to a registered subscriber. */
export function isOnlineUserWithoutSubscriber(row: OnlineUser): boolean {
  return row.hasSubscriber !== true;
}

export function countOnlineUsersWithoutSubscriber(rows: OnlineUser[]): number {
  return rows.reduce((total, row) => total + (isOnlineUserWithoutSubscriber(row) ? 1 : 0), 0);
}

/** Keep only sessions without a matching subscriber when `enabled`. */
export function filterOnlineUsersWithoutSubscriber(
  rows: OnlineUser[],
  enabled: boolean,
): OnlineUser[] {
  if (!enabled) return rows;
  return rows.filter(isOnlineUserWithoutSubscriber);
}

export function filterOnlineUsers(rows: OnlineUser[], search: string): OnlineUser[] {
  const q = search.trim().toLowerCase();
  if (!q) return rows;

  return rows.filter((row) => {
    const packageLine = getPackageLineForOnlineUser(row);
    const haystack = [
      row.username,
      row.fullName,
      row.ipAddress,
      row.service,
      row.lineId ?? "",
      packageLine != null ? String(packageLine) : "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** Match MikroTik sessions to subscriber profiles by username. */
export function enrichOnlineUsersWithSubscribers(
  rows: OnlineUser[],
  subscribers: SubscriberLookup[],
): OnlineUser[] {
  const byUsername = new Map<string, SubscriberLookup>();
  for (const sub of subscribers) {
    const key = sub.username?.trim().toLowerCase();
    if (key) {
      byUsername.set(key, {
        lineId: sub.lineId,
        fullName: sub.fullName,
        username: sub.username,
        routerName: sub.routerName ?? null,
        routerImageUrl: sub.routerImageUrl ?? null,
        routerPort: sub.routerPort ?? null,
      });
    }
  }

  return enrichOnlineUserPackageLine(
    rows.map((row) => {
      const match = byUsername.get(row.username.trim().toLowerCase());
      if (!match) return { ...row, hasSubscriber: false };
      return {
        ...row,
        hasSubscriber: true,
        lineId: row.lineId ?? match.lineId,
        fullName: row.fullName?.trim() || match.fullName,
        routerName: match.routerName,
        routerImageUrl: match.routerImageUrl,
        routerPort: match.routerPort,
      };
    }),
  );
}

/** Lowercase usernames with an active PPP session on MikroTik */
export function buildOnlineUsernameSet(users: OnlineUser[]): Set<string> {
  const set = new Set<string>();
  for (const user of users) {
    const key = user.username?.trim().toLowerCase();
    if (key) set.add(key);
  }
  return set;
}

/** Username (lowercase) → current PPP session IP from MikroTik online list */
export function buildOnlineIpByUsername(users: OnlineUser[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const user of users) {
    const key = user.username?.trim().toLowerCase();
    const ip = user.ipAddress?.trim();
    if (key && ip) map.set(key, ip);
  }
  return map;
}

export function resolveOnlineIp(
  username: string | null | undefined,
  onlineByUsername: Map<string, string>,
): string | null {
  if (!username) return null;
  return onlineByUsername.get(username.trim().toLowerCase()) ?? null;
}
