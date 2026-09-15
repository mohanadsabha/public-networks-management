import { Skeleton } from "@/components/ui/feedback/Skeleton";
import {
  dataTableActionsHeadCellClass,
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableCheckboxCellClass,
  dataTableCheckboxHeadClass,
  dataTableFixedClass,
  dataTableHeadCellClass,
  dataTableHeadRowClass,
  dataTableNumericCellClass,
  dataTableNumericHeadCellClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
} from "@/components/ui/data";
import { cn } from "@/lib/cn";

export function PageHeaderSkeleton({ showAction = true }: { showAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        <Skeleton className="h-7 w-48 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {showAction ? <Skeleton className="h-9 w-32 shrink-0 rounded-lg" /> : null}
    </div>
  );
}

export function SpeedTiersGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-4 shadow-card sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-5 w-24" />
          <Skeleton className="mt-2 h-4 w-32" />
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-8 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpeedTierPickerSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-24 rounded-lg" />
      ))}
    </div>
  );
}

export function StatCardsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface px-4 py-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function StatisticsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.06] via-surface to-accent/[0.04] px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-8 w-48 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Skeleton className="h-14 flex-1 rounded-xl sm:flex-none sm:w-20" />
            <Skeleton className="h-14 flex-1 rounded-xl sm:flex-none sm:w-20" />
            <Skeleton className="h-14 flex-1 rounded-xl sm:flex-none sm:w-20" />
            <Skeleton className="h-14 flex-1 rounded-xl sm:flex-none sm:w-20" />
          </div>
        </div>
      </div>

      <StatCardsRowSkeleton count={8} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl border border-border" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl border border-border" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl border border-border" />
        ))}
      </div>

      <Skeleton className="h-48 rounded-xl border border-border" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl border border-border" />
        <Skeleton className="h-56 rounded-xl border border-border" />
      </div>
    </div>
  );
}

export function DataTableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className={dataTableWrapClass}>
      <table className={cn(dataTableFixedClass, dataTableScrollMinClass)}>
        <thead>
          <tr className={dataTableHeadRowClass}>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className={dataTableHeadCellClass}>
                <Skeleton className={cn("h-3", i === 0 ? "w-24" : "w-16")} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row} className={dataTableBodyRowClass}>
              <td className={dataTableCellClass}>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </td>
              {Array.from({ length: columns - 1 }).map((_, col) => (
                <td key={col} className={dataTableCellClass}>
                  <Skeleton className={cn("h-3.5", col === 0 ? "w-20" : "w-14")} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegistryMobileCardSkeleton({ showBadge = true }: { showBadge?: boolean }) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36 max-w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            {showBadge ? <Skeleton className="h-5 w-16 shrink-0 rounded-md" /> : null}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/80 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className={cn("h-3.5", i % 2 === 0 ? "w-20" : "w-16")} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-1 border-t border-border bg-muted/20 px-0 pt-2">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </article>
  );
}

function RegistryTableRowSkeleton({
  showCheckbox,
  dataColumns,
  variant,
  numericMiddleIndex,
}: {
  showCheckbox: boolean;
  dataColumns: number;
  variant: RegistryTableVariant;
  numericMiddleIndex?: number;
}) {
  return (
    <tr className={dataTableBodyRowClass}>
      {showCheckbox ? (
        <td className={dataTableCheckboxCellClass}>
          <Skeleton className="mx-auto h-4 w-4 rounded" />
        </td>
      ) : null}
      <td className={cn("max-w-0", dataTableCellClass)}>
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28 max-w-full" />
            <Skeleton className="h-3 w-20 max-w-full" />
          </div>
        </div>
      </td>
      {Array.from({ length: dataColumns - 2 }).map((_, i) => {
        const isBadge = variant === "customers" && i === 0;
        const isStatusBadge = variant === "subscribers" && i === dataColumns - 3;
        const isNumeric = numericMiddleIndex != null && i === numericMiddleIndex;
        return (
          <td
            key={i}
            className={isNumeric ? dataTableNumericCellClass : dataTableCellClass}
          >
            {isBadge || isStatusBadge ? (
              <Skeleton className="h-5 w-16 rounded-md" />
            ) : (
              <Skeleton className={cn("h-3.5", isNumeric ? "ms-auto w-10" : "w-16")} />
            )}
          </td>
        );
      })}
      <td className={dataTableCellClass}>
        <div className="flex justify-center gap-1">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export type RegistryTableVariant = "customers" | "subscribers";

export function RegistryListLoadingSkeleton({
  variant,
  showCheckboxes = false,
  showPasswordColumn = false,
  rows = 7,
}: {
  variant: RegistryTableVariant;
  showCheckboxes?: boolean;
  showPasswordColumn?: boolean;
  rows?: number;
}) {
  const isCustomers = variant === "customers";
  const middleColumns = isCustomers ? 4 : showPasswordColumn ? 7 : 6;
  const dataColumns = middleColumns + 2;
  const numericMiddleIndex = isCustomers ? 3 : undefined;
  const minWidth = isCustomers ? "min-w-[760px]" : "min-w-[960px]";

  const headerLabels = isCustomers
    ? ["name", "type", "user", "phone", "balance", "actions"]
    : [
        "subscriber",
        "line",
        "user",
        ...(showPasswordColumn ? ["pass"] : []),
        "speed",
        "first",
        "disconnect",
        "status",
        "actions",
      ];

  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-4 w-36" />

      <div className="space-y-3 lg:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, i) => (
          <RegistryMobileCardSkeleton key={i} showBadge={isCustomers || i % 2 === 0} />
        ))}
      </div>

      <div className={cn("hidden lg:block", dataTableWrapClass)}>
        <table className={cn(dataTableFixedClass, dataTableScrollMinClass, minWidth)}>
          <thead>
            <tr className={dataTableHeadRowClass}>
              {showCheckboxes ? (
                <th className={dataTableCheckboxHeadClass}>
                  <Skeleton className="mx-auto h-4 w-4 rounded" />
                </th>
              ) : null}
              {headerLabels.map((key) => (
                <th
                  key={key}
                  className={
                    key === "balance"
                      ? dataTableNumericHeadCellClass
                      : key === "actions"
                        ? dataTableActionsHeadCellClass
                        : dataTableHeadCellClass
                  }
                >
                  <Skeleton
                    className={cn(
                      "h-3",
                      key === "subscriber" || key === "name" ? "w-20" : "w-12",
                      key === "balance" && "ms-auto w-14",
                      key === "actions" && "mx-auto w-10",
                    )}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <RegistryTableRowSkeleton
                key={i}
                showCheckbox={showCheckboxes}
                dataColumns={dataColumns}
                variant={variant}
                numericMiddleIndex={numericMiddleIndex}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProfilePageSkeleton({ showTabs = false }: { showTabs?: boolean }) {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-4 w-32" />

      <div className="overflow-hidden rounded-xl border border-border/70 bg-surface shadow-sm">
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-muted/30 to-surface px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <Skeleton className="h-14 w-14 shrink-0 rounded-2xl sm:h-16 sm:w-16" />
              <div className="min-w-0 space-y-2 pt-1">
                <Skeleton className="h-6 w-48 max-w-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTabs ? (
        <div className="flex gap-1 overflow-hidden rounded-xl border border-border/70 bg-muted/25 p-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-lg" />
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <StatCardsRowSkeleton count={3} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-transparent px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
          </div>
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-border/60 pt-4">
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupportContentSkeleton() {
  return (
    <div className="space-y-6">
      <StatCardsRowSkeleton count={4} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl border border-border" />
        <Skeleton className="h-56 rounded-xl border border-border" />
      </div>
      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <DataTableSkeleton rows={8} columns={6} />
      </section>
    </div>
  );
}

export function SupportPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <SupportContentSkeleton />
    </div>
  );
}

export function AvailableUsernamesPageSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeaderSkeleton showAction={false} />
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <SpeedTierPickerSkeleton count={5} />
      </div>
      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
        <DataTableSkeleton rows={7} columns={5} />
      </section>
    </div>
  );
}
