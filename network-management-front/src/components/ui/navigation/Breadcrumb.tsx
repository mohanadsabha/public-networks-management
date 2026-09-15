import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex min-w-0 items-center gap-1.5 overflow-hidden text-sm sm:gap-2", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={`${item.label}-${index}`}
            className="flex min-w-0 items-center gap-1.5 sm:gap-2"
          >
            {index > 0 ? (
              <ChevronLeft
                className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180"
                aria-hidden
              />
            ) : null}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="truncate text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  isLast ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
