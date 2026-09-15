import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

/** Mixed Arabic + Latin path strings — RTL order in Arabic, LTR in English. */
export function TechnicalPathText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  return (
    <span
      dir={isArabic ? "rtl" : "ltr"}
      className={cn(
        "inline-block max-w-full unicode-bidi-plaintext",
        isArabic ? "text-end" : "text-start",
        className,
      )}
    >
      {children}
    </span>
  );
}
