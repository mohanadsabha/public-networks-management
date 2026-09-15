import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { AppLanguage } from "@/lib/i18n";

interface LanguageToggleProps {
  className?: string;
  variant?: "default" | "compact";
}

export function LanguageToggle({ className, variant = "default" }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const current = i18n.language as AppLanguage;

  const toggle = () => {
    const next: AppLanguage = current === "ar" ? "en" : "ar";
    void i18n.changeLanguage(next);
  };

  const isCompact = variant === "compact";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={current === "ar" ? t("language.switchAriaToEnglish") : t("language.switchAriaToArabic")}
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-surface font-medium text-foreground transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        isCompact ? "h-9 gap-1.5 px-2.5 text-xs" : "gap-2 px-3 py-2 text-sm",
        className,
      )}
    >
      <Languages className={cn("shrink-0 text-muted-foreground", isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span>{current === "ar" ? t("language.shortEnglish") : t("language.shortArabic")}</span>
    </button>
  );
}
