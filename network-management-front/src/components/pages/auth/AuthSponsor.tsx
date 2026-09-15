import { useTranslation } from "react-i18next";
import { Logo } from "@/components/ui/branding";
import { cn } from "@/lib/cn";

export const JAWWAL_LOGO_SRC = "/images/jawwal.png";

interface AuthSponsorProps {
  className?: string;
  /** Brand panel (dark) vs form panel (light) */
  variant?: "on-dark" | "default";
  /** default = login panel, compact = dashboard sidebar */
  size?: "default" | "compact";
}

/** WeWiFi + Jawwal logos shown together */
export function AuthSponsor({
  className,
  variant = "default",
  size = "default",
}: AuthSponsorProps) {
  const { t } = useTranslation();
  const onDark = variant === "on-dark";
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        compact ? "gap-2.5" : "gap-4 sm:gap-5",
        className,
      )}
      aria-label={t("auth.sponsorAria")}
    >
      <Logo
        size={compact ? "sm" : "lg"}
        showTagline={!compact}
        variant={onDark ? "on-dark" : "default"}
        preferImage
        className="min-w-0 shrink"
      />

      <span
        className={cn(
          "w-px shrink-0",
          compact ? "h-7" : "h-10 sm:h-11",
          onDark ? "bg-white/15" : "bg-border/80",
        )}
        aria-hidden
      />

      <img
        src={JAWWAL_LOGO_SRC}
        alt={t("auth.sponsorAlt")}
        className={cn(
          "w-auto shrink-0 object-contain",
          compact ? "h-6 max-w-[5.5rem]" : "h-7 max-w-[200px] sm:h-8",
        )}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
