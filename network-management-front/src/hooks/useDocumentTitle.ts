import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { formatDocumentTitle, resolvePageTitleKey } from "@/lib/pageTitles";

interface UseDocumentTitleOptions {
  /** Override route-based title key */
  titleKey?: string;
}

export function useDocumentTitle(options: UseDocumentTitleOptions = {}) {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const titleKey = options.titleKey ?? resolvePageTitleKey(pathname);

  useEffect(() => {
    document.title = formatDocumentTitle(t(titleKey));
  }, [titleKey, t, i18n.language]);
}

interface PageTitleProps {
  titleKey: string;
}

/** Set document title from a page-specific i18n key (overrides route map) */
export function PageTitle({ titleKey }: PageTitleProps) {
  useDocumentTitle({ titleKey });
  return null;
}
