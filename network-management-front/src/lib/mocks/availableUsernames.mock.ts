import { addDays, format, subDays } from "date-fns";
import type { AvailableUsername } from "@/types/availableUsername";
import {
  getSpeedPoolCounts,
  isInAvailablePool,
  USERNAME_COOLDOWN_DAYS,
} from "@/types/availableUsername";
import { mockSpeedTiers, type SpeedTier } from "./speeds.mock";

const today = new Date();
const dateTimeStorage = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");

function assignedWithCooldown(daysAgo: number, hour = 9, minute = 15) {
  const assigned = subDays(today, daysAgo);
  assigned.setHours(hour, minute, 0, 0);
  const expiry = addDays(assigned, USERNAME_COOLDOWN_DAYS);
  return {
    assignedAt: dateTimeStorage(assigned),
    expiryDate: dateTimeStorage(expiry),
    isUsed: true,
    isExpired: false,
  };
}

export const mockAvailableUsernames: AvailableUsername[] = [
  {
    id: 1,
    username: "0599123456PP",
    password: "wifi2024",
    speedId: 2,
    isOwnerUsername: false,
    isUsed: false,
    isExpired: false,
    createdAt: "2026-01-12",
  },
  {
    id: 2,
    username: "0598765432PP",
    password: "net8899",
    speedId: 2,
    isOwnerUsername: false,
    createdAt: "2026-01-08",
    ...assignedWithCooldown(5),
  },
  {
    id: 3,
    username: "5962963140PP",
    password: "owner001",
    speedId: 2,
    isOwnerUsername: true,
    isUsed: false,
    isExpired: false,
    createdAt: "2025-11-20",
  },
  {
    id: 4,
    username: "0599111222PP",
    password: "pass5566",
    speedId: 1,
    isOwnerUsername: false,
    isUsed: false,
    isExpired: false,
    createdAt: "2026-02-01",
  },
  {
    id: 5,
    username: "0599333444PP",
    password: "link7788",
    speedId: 3,
    isOwnerUsername: false,
    isUsed: false,
    isExpired: false,
    createdAt: "2026-02-14",
  },
  {
    id: 6,
    username: "0599444555PP",
    password: "fast32xx",
    speedId: 3,
    isOwnerUsername: false,
    createdAt: "2026-02-20",
    ...assignedWithCooldown(25),
  },
  {
    id: 7,
    username: "0599555666PP",
    password: "slow4abc",
    speedId: 1,
    isOwnerUsername: false,
    isUsed: false,
    isExpired: false,
    createdAt: "2026-03-01",
  },
  {
    id: 8,
    username: "0599666777PP",
    password: "oldslot01",
    speedId: 2,
    isOwnerUsername: false,
    isUsed: true,
    isExpired: true,
    createdAt: "2025-12-01",
    assignedAt: dateTimeStorage(subDays(today, 40)),
    expiryDate: dateTimeStorage(subDays(today, 10)),
  },
];

export function getUsernamesBySpeedId(speedId: number): AvailableUsername[] {
  return mockAvailableUsernames.filter(
    (row) => row.speedId === speedId && isInAvailablePool(row),
  );
}

export function countUsernamesBySpeedId(speedId: number): number {
  return getSpeedPoolCounts(mockAvailableUsernames, speedId).total;
}

export function countAvailableBySpeedId(speedId: number): number {
  return getSpeedPoolCounts(mockAvailableUsernames, speedId).new;
}

export { mockSpeedTiers, type SpeedTier };
export type { AvailableUsername };
