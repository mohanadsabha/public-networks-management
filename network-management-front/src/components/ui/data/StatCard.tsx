import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/cards";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClassName,
  valueClassName,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("border-border/70 p-5 shadow-sm transition-shadow hover:shadow-md", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Text muted className="text-sm">
            {label}
          </Text>
          <p className={cn("mt-2 text-2xl font-bold tracking-tight text-foreground", valueClassName)}>
            {value}
          </p>
          {hint ? (
            <Text muted className="mt-1 text-xs">
              {hint}
            </Text>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
            iconClassName,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
