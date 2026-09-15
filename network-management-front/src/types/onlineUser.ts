export interface OnlineUser {
  username: string;
  fullName: string;
  ipAddress: string;
  callerId: string;
  service: string;
  uptime: string;
  status: "online";
  lastUpdated: string;
  lineId?: string | null;
  /** Package line number parsed from lineId (e.g. W04-101 → 4) */
  packageLine?: number | null;
  routerName?: string | null;
  routerImageUrl?: string | null;
  routerPort?: string | null;
  /** `true` when this session matches a registered subscriber (by username). */
  hasSubscriber?: boolean;
}
