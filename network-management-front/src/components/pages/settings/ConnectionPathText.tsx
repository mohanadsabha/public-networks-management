import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

/** VPN → API/SSH → MikroTik — correct segment order in Arabic (RTL) and English (LTR). */
export function ConnectionPathText({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const arrow = isArabic ? "←" : "→";

  const segments = [
    t("settings.vpn.flow.pathVpn"),
    t("settings.vpn.flow.pathMethod"),
    t("settings.vpn.flow.pathRouter"),
  ];

  return (
    <span
      className={cn("inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1", className)}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {segments.map((label, index) => (
        <span key={label} className="inline-flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden className="text-muted-foreground/80">
              {arrow}
            </span>
          ) : null}
          <span className="whitespace-nowrap">{label}</span>
        </span>
      ))}
    </span>
  );
}
