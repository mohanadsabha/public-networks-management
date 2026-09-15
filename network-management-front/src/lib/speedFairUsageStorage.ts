import type { SpeedTier } from "@/types/speeds";

const STORAGE_KEY = "wewifi-speed-fair-usage-gb";

/** Defaults until API stores FUP per speed tier. */
const DEFAULT_FAIR_USAGE_GB_BY_MBPS: Record<number, number> = {
  4: 500,
  8: 700,
};

type FairUsageMap = Record<string, number>;

function readMap(): FairUsageMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as FairUsageMap;
  } catch {
    return {};
  }
}

function writeMap(map: FairUsageMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function getStoredFairUsageGb(speedId: number): number | null {
  if (!Number.isFinite(speedId) || speedId <= 0) return null;
  const value = readMap()[String(speedId)];
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function setStoredFairUsageGb(speedId: number, gb: number | null | undefined): void {
  if (!Number.isFinite(speedId) || speedId <= 0) return;
  const map = readMap();
  const key = String(speedId);
  if (gb == null || !Number.isFinite(gb) || gb <= 0) {
    delete map[key];
  } else {
    map[key] = gb;
  }
  writeMap(map);
}

export function resolveFairUsageGbForTier(
  tier: Pick<SpeedTier, "id" | "valueMbps" | "fairUsageGb">,
): number | null {
  if (tier.fairUsageGb != null && tier.fairUsageGb > 0) return tier.fairUsageGb;
  const stored = getStoredFairUsageGb(tier.id);
  if (stored != null) return stored;
  return DEFAULT_FAIR_USAGE_GB_BY_MBPS[tier.valueMbps] ?? null;
}

export function attachFairUsageToTier(tier: SpeedTier): SpeedTier {
  const fairUsageGb = resolveFairUsageGbForTier(tier);
  return fairUsageGb == null ? tier : { ...tier, fairUsageGb };
}

export function attachFairUsageToTiers(tiers: SpeedTier[]): SpeedTier[] {
  return tiers.map(attachFairUsageToTier);
}
