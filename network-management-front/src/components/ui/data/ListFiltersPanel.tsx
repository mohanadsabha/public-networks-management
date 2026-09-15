import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ListFiltersPanelProps {
  search: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Compact filter toolbar — search plus inline chip rows. */
export function ListFiltersPanel({ search, children, className }: ListFiltersPanelProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {search}

      {children ? (
        <div className="flex flex-col gap-2 border-t border-border/50 pt-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FilterGroup({ label, children, className }: FilterGroupProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 lg:shrink-0",
        className,
      )}
    >
      <span className="shrink-0 text-[11px] font-semibold text-muted-foreground sm:min-w-[3.25rem]">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
