import type { RouterCatalogItem } from "@/types/router";

export interface BackendRouterRow {
  id: number;
  routerName: string | null;
  routerImage: string | null;
  routerPublicId: string | null;
  createdAt?: string | Date | null;
}

function toIso(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function mapRouterRecord(row: BackendRouterRow): RouterCatalogItem {
  return {
    id: row.id,
    name: row.routerName?.trim() ?? "",
    imageUrl: row.routerImage ?? null,
    createdAt: toIso(row.createdAt) ?? new Date().toISOString(),
  };
}
