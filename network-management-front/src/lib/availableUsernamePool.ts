import { mockAvailableUsernames } from "@/lib/mocks/availableUsernames.mock";
import { mockSpeedTiers } from "@/lib/mocks/speeds.mock";
import type { AvailableUsername } from "@/types/availableUsername";
import { isInAvailablePool } from "@/types/availableUsername";

export function resolveSpeedId(speedMbps: number, packageLine: number): number | undefined {
  return (
    mockSpeedTiers.find((t) => t.valueMbps === speedMbps)?.id ??
    mockSpeedTiers.find((t) => t.valueMbps === packageLine)?.id
  );
}

export function getAvailablePoolForSubscriber(
  speedMbps: number,
  packageLine: number,
  options?: { excludeUsername?: string | null },
): AvailableUsername[] {
  const speedId = resolveSpeedId(speedMbps, packageLine);
  return mockAvailableUsernames.filter((u) => {
    if (u.speedId !== speedId) return false;
    if (!isInAvailablePool(u)) return false;
    if (options?.excludeUsername && u.username === options.excludeUsername) return false;
    return true;
  });
}
