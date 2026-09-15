/** Select value when the subscriber uses a custom router (not from catalog). */
export const ROUTER_CATALOG_CUSTOM_ID = "__custom__";

export function isRouterCatalogCustomValue(value: string): boolean {
  return value === ROUTER_CATALOG_CUSTOM_ID;
}

/** Convert a data-URL preview into a File for API upload. */
export async function dataUrlToImageFile(dataUrl: string, baseName: string): Promise<File | null> {
  if (!dataUrl.startsWith("data:")) return null;
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const ext = blob.type.split("/")[1] || "png";
    const safeName = baseName.replace(/[^\w.-]+/g, "_").slice(0, 48) || "router";
    return new File([blob], `${safeName}.${ext}`, { type: blob.type || "image/png" });
  } catch {
    return null;
  }
}
