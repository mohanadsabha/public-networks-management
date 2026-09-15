import type { RouterCatalogItem } from "@/types/router";
import type { Subscriber } from "@/types/subscriber";

export function parseRouterPortDisplay(
  value: string | number | null | undefined,
): { enabled: boolean; display: string } {
  if (value == null || value === "") return { enabled: false, display: "" };
  const raw = String(value).trim();
  const display = raw.startsWith(":") ? raw.slice(1) : raw;
  return { enabled: Boolean(display), display };
}

export function formatRouterPortApi(port: string): string | null {
  const trimmed = port.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `:${num}`;
}

/** Bust browser/CDN cache after a router image upload or replace. */
export function withRouterImageCacheBuster(
  url: string | null | undefined,
  version: number | string = Date.now(),
): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) return trimmed;
  const sep = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${sep}v=${version}`;
}

export function resolveCatalogIdForSubscriber(
  subscriber: Pick<Subscriber, "routerName">,
  catalog: RouterCatalogItem[],
): number | null {
  const name = subscriber.routerName?.trim();
  if (!name) return null;
  const match = catalog.find((item) => item.name.trim() === name);
  return match?.id ?? null;
}

export function isSubscriberCustomRouter(
  subscriber: Pick<Subscriber, "routerName">,
  catalog: RouterCatalogItem[],
): boolean {
  return Boolean(subscriber.routerName?.trim()) && resolveCatalogIdForSubscriber(subscriber, catalog) === null;
}
