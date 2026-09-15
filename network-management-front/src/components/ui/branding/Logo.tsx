import { Wifi } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

const LOGO_SRC = "/images/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  variant?: "default" | "on-dark";
  /** Prefer image logo from /public/images/logo.png; falls back to icon + text */
  preferImage?: boolean;
  /** Show only the image (no text), for compact areas like the sidebar */
  imageOnly?: boolean;
}

const sizeMap = {
  sm: {
    icon: "h-7 w-7",
    iconInner: "h-3.5 w-3.5",
    title: "text-lg",
    tagline: "text-xs",
    image: "h-8 max-w-[140px]",
  },
  md: {
    icon: "h-10 w-10",
    iconInner: "h-5 w-5",
    title: "text-2xl",
    tagline: "text-sm",
    image: "h-10 max-w-[160px]",
  },
  lg: {
    icon: "h-12 w-12",
    iconInner: "h-6 w-6",
    title: "text-3xl",
    tagline: "text-base",
    image: "h-12 max-w-[200px]",
  },
} as const;

export function Logo({
  size = "md",
  showTagline = false,
  className,
  variant = "default",
  preferImage = true,
  imageOnly = false,
}: LogoProps) {
  const { t } = useTranslation();
  const s = sizeMap[size];
  const onDark = variant === "on-dark";
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = preferImage && !imageFailed;

  if (showImage) {
    return (
      <div className={cn("flex items-center", className)}>
        <img
          src={LOGO_SRC}
          alt="WeWiFi"
          className={cn("w-auto object-contain object-start", s.image)}
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl",
          s.icon,
          onDark
            ? "bg-white/10 text-primary ring-1 ring-white/20"
            : "bg-primary/10 text-primary ring-1 ring-primary/20",
        )}
      >
        <Wifi className={s.iconInner} strokeWidth={2.5} />
      </div>
      {!imageOnly ? (
        <div>
          <span
            className={cn(
              "block font-bold tracking-tight",
              s.title,
              onDark ? "text-white" : "text-foreground",
            )}
          >
            WeWiFi
          </span>
          {showTagline ? (
            <span
              className={cn(
                "block font-medium",
                s.tagline,
                onDark ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {t("brand.tagline")}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
