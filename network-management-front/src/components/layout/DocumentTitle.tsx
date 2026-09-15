import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/** Syncs browser tab title with current route and language */
export function DocumentTitle() {
  useDocumentTitle();
  return null;
}
