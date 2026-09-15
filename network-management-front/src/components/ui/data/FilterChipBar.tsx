import { cn } from "@/lib/cn";

export interface FilterChipOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipBarProps {
  label?: string;
  value: string;
  onChange: (id: string) => void;
  options: FilterChipOption[];
  className?: string;
  wrap?: boolean;
  size?: "default" | "compact";
}

export function FilterChipBar({
  label,
  value,
  onChange,
  options,
  className,
  wrap = false,
  size = "default",
}: FilterChipBarProps) {
  const compact = size === "compact";

  return (
    <div className={cn(compact ? "min-w-0 space-y-1" : "space-y-2", className)}>
      {label ? (
        <span
          className={cn(
            "font-medium text-muted-foreground",
            compact ? "text-[11px]" : "text-xs",
          )}
        >
          {label}
        </span>
      ) : null}

      {wrap ? (
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {options.map((option) => {
            const selected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onChange(option.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full border font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  compact
                    ? "px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
                    : "gap-2 px-3.5 py-1.5 text-xs",
                  selected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border/70 bg-muted/25 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="whitespace-nowrap">{option.label}</span>
                {option.count !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-1 py-0.5 text-[10px] font-semibold leading-none tabular-nums",
                      selected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background/80 text-foreground/70",
                    )}
                  >
                    {option.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className={cn(
            "-mx-0.5 overflow-x-auto overscroll-x-contain px-0.5",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          <div
            className="flex w-max min-w-full flex-nowrap gap-1 pb-0.5 sm:gap-1.5"
            role="tablist"
          >
            {options.map((option) => {
              const selected = value === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onChange(option.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full border font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    compact
                      ? "px-2.5 py-1 text-[11px] sm:px-3 sm:text-xs"
                      : "gap-2 px-3.5 py-1.5 text-xs",
                    selected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/70 bg-muted/25 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <span className="whitespace-nowrap">{option.label}</span>
                  {option.count !== undefined ? (
                    <span
                      className={cn(
                        "rounded-full px-1 py-0.5 text-[10px] font-semibold leading-none tabular-nums",
                        selected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background/80 text-foreground/70",
                      )}
                    >
                      {option.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
