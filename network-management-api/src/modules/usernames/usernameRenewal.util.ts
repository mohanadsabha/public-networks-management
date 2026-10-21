/** Paltel allows reusing the same username after renewing the billing period on these speeds. */
export const SAME_USERNAME_RENEWAL_SPEED_MBPS = [4, 8, 16] as const;

export type SameUsernameRenewalSpeedMbps = (typeof SAME_USERNAME_RENEWAL_SPEED_MBPS)[number];

export function supportsSameUsernameRenewalSpeed(speedMbps: number): boolean {
  return (SAME_USERNAME_RENEWAL_SPEED_MBPS as readonly number[]).includes(speedMbps);
}
