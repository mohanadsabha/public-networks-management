import { ArrowLeft, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/cards";
import { Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

export interface ProfileHeroItem {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  dir?: "ltr" | "rtl" | "auto";
  mono?: boolean;
  valueClassName?: string;
}

interface ProfileHeroProps {
  backTo: string;
  backLabel: string;
  initials: string;
  name: string;
  badge?: ReactNode;
  items: ProfileHeroItem[];
  actions?: ReactNode;
  banner?: ReactNode;
  className?: string;
}

function ProfileHeroField({ icon: Icon, label, value, dir, mono, valueClassName }: ProfileHeroItem) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        <Text muted className="text-[11px] font-medium uppercase tracking-wide sm:text-xs sm:normal-case sm:tracking-normal">
          {label}
        </Text>
      </div>
      <p
        className={cn(
          "mt-1.5 text-sm font-medium text-foreground",
          mono && "font-mono",
          valueClassName,
        )}
        dir={dir}
      >
        {value}
      </p>
    </div>
  );
}

export function ProfileHero({
  backTo,
  backLabel,
  initials,
  name,
  badge,
  items,
  actions,
  banner,
  className,
}: ProfileHeroProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Link
        to={backTo}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        {backLabel}
      </Link>

      <Card className="overflow-hidden border-border/70 p-0 shadow-sm">
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-muted/30 to-surface px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-base font-semibold text-foreground ring-1 ring-primary/15 sm:h-16 sm:w-16 sm:text-lg"
                aria-hidden
              >
                {initials}
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Heading as="h1" className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {name}
                  </Heading>
                  {badge}
                </div>
              </div>
            </div>

            {actions ? (
              <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">{actions}</div>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-muted/10 p-4 sm:grid-cols-3 sm:gap-3 sm:p-5 lg:grid-cols-3 xl:grid-cols-6">
          {items.map((item) => (
            <ProfileHeroField key={item.label} {...item} />
          ))}
        </div>

        {banner ? (
          <div className="border-t border-border/60 bg-muted/15 px-4 py-3 sm:px-5">{banner}</div>
        ) : null}
      </Card>
    </div>
  );
}
