import type { SpeedTier } from "@/types/speeds";

export type { SpeedTier };

export const mockSpeedTiers: SpeedTier[] = [
  { id: 1, label: "4 Mbps", valueMbps: 4, price: 80 },
  { id: 2, label: "16 Mbps", valueMbps: 16, price: 120 },
  { id: 3, label: "32 Mbps", valueMbps: 32, price: 160 },
];

export function getSpeedTierById(id: number): SpeedTier | undefined {
  return mockSpeedTiers.find((tier) => tier.id === id);
}
