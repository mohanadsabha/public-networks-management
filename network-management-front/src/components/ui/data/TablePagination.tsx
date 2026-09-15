import { ChevronLeft, ChevronRight } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/cn";

interface TablePaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  labels?: {
    showing?: string;
    previous?: string;
    next?: string;
    ariaLabel?: string;
    goToPage?: string;
  };
}

type PageItem = number | "ellipsis";

function buildPageItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];

  if (current > 3) {
    items.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    items.push(pageNumber);
  }

  if (current < totalPages - 2) {
    items.push("ellipsis");
  }

  if (totalPages > 1) {
    items.push(totalPages);
  }

  return items;
}

export function TablePagination({
  page,
  limit,
  total,
  onPageChange,
  className,
  compact = false,
  disabled = false,
  labels,
}: TablePaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const to = Math.min(safePage * limit, total);
  const pageItems = buildPageItems(safePage, totalPages);

  const previous = labels?.previous ?? t("common.pagination.previous");
  const next = labels?.next ?? t("common.pagination.next");
  const ariaLabel = labels?.ariaLabel ?? t("common.pagination.ariaLabel");
  const goToPageLabel =
    labels?.goToPage ?? ((pageNumber: number) => t("common.pagination.goToPage", { page: pageNumber }));

  if (total === 0) return null;

  const btnSize = compact ? "h-7 min-w-7 px-1.5 text-xs" : "h-9 min-w-9 px-2.5 text-sm";
  const navBtnSize = compact ? "h-7 px-2" : "h-9 px-2.5 sm:px-3";
  const iconSize = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between",
        !compact && "gap-4 border-t border-border pt-4",
        className,
      )}
    >
      <p
        className={cn(
          "text-center text-muted-foreground sm:text-start",
          compact ? "text-[11px] sm:text-xs" : "text-sm",
        )}
      >
        {labels?.showing ? (
          labels.showing
        ) : (
          <Trans
            i18nKey="common.pagination.showing"
            values={{ from, to, total }}
            components={{
              range: <span dir="ltr" className="tabular-nums" />,
              total: <span dir="ltr" className="tabular-nums" />,
            }}
          />
        )}
      </p>

      <nav
        aria-label={ariaLabel}
        dir="ltr"
        className={cn(
          "mx-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-muted/40 p-0.5 sm:mx-0",
          compact && "p-0.5",
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          className={cn("shrink-0 gap-1", navBtnSize)}
          disabled={disabled || safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label={previous}
        >
          <ChevronLeft className={cn("shrink-0 rtl:rotate-180", iconSize)} aria-hidden />
          <span className={cn(compact ? "hidden sm:inline" : "hidden min-[480px]:inline")}>
            {previous}
          </span>
        </Button>

        <div className="flex items-center gap-0.5 px-0.5">
          {pageItems.map((item, index) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={cn(
                    "flex items-center justify-center px-1 text-muted-foreground",
                    btnSize,
                  )}
                  aria-hidden
                >
                  …
                </span>
              );
            }

            const isActive = item === safePage;
            return (
              <button
                key={item}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(item)}
                aria-label={
                  typeof goToPageLabel === "function"
                    ? goToPageLabel(item)
                    : goToPageLabel
                }
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center rounded-md font-medium tabular-nums transition-colors",
                  btnSize,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-background/80",
                  disabled && "pointer-events-none opacity-50",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn("shrink-0 gap-1", navBtnSize)}
          disabled={disabled || safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          aria-label={next}
        >
          <span className={cn(compact ? "hidden sm:inline" : "hidden min-[480px]:inline")}>
            {next}
          </span>
          <ChevronRight className={cn("shrink-0 rtl:rotate-180", iconSize)} aria-hidden />
        </Button>
      </nav>
    </div>
  );
}
