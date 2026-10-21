import type { AvailableUsername } from "@/types/availableUsername";

/** Paltel allows reusing the same username after renewing the billing period on these speeds. */
export const SAME_USERNAME_RENEWAL_SPEED_MBPS = [4, 8, 16] as const;

export function supportsSameUsernameRenewalSpeed(speedMbps: number): boolean {
  return (SAME_USERNAME_RENEWAL_SPEED_MBPS as readonly number[]).includes(speedMbps);
}

export function subscriberUsesSameUsernameRenewal(
  isOwnerUsername: boolean,
  speedMbps: number | null | undefined,
): boolean {
  if (isOwnerUsername) return true;
  return speedMbps != null && supportsSameUsernameRenewalSpeed(speedMbps);
}

export function canResetUsernameBillingCycle(
  row: AvailableUsername,
  speedMbps: number,
): boolean {
  if (!row.isUsed) return false;
  if (row.isOwnerUsername) return true;
  return supportsSameUsernameRenewalSpeed(speedMbps);
}
