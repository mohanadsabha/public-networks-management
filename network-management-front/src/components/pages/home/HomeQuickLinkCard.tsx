import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { HomeLinkItem } from "@/components/pages/home/homeLinks";
import { cn } from "@/lib/cn";

interface HomeQuickLinkCardProps {
  item: HomeLinkItem;
}

export function HomeQuickLinkCard({ item }: HomeQuickLinkCardProps) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
            item.accentClass,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all group-hover:bg-muted/80 group-hover:opacity-100"
          aria-hidden
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-4 min-w-0 flex-1">
        <h3 className="font-semibold text-foreground">{t(item.titleKey)}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {t(item.descriptionKey)}
        </p>
      </div>

      <span className="mt-4 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        {t("home.open")}
      </span>
    </Link>
  );
}
