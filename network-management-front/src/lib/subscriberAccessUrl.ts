import { buildAccessUrl } from "@/lib/subscriberConnection";

export {
  buildAccessUrl,
  buildAccessUrlFromConnection,
  formatConnectionHostLabel,
  parseOnlineHost,
  resolveConfiguredPort,
  resolveSubscriberConnectionHost,
} from "@/lib/subscriberConnection";

export function resolveSubscriberAccessUrl(
  username: string | null | undefined,
  onlineIpByUsername: ReadonlyMap<string, string>,
): string | null {
  const key = username?.trim().toLowerCase();
  if (!key) return null;
  const ip = onlineIpByUsername.get(key);
  return buildAccessUrl(ip);
}
