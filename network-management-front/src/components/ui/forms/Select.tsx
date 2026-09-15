import { Check, ChevronDown, Router } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  imageUrl?: string | null;
  icon?: ReactNode;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Rendered below a divider — e.g. “Custom router”. */
  trailingOption?: SelectOption;
  disabled?: boolean;
  hint?: ReactNode;
  className?: string;
}

function OptionPreview({
  option,
  compact = false,
}: {
  option: SelectOption;
  compact?: boolean;
}) {
  const iconBox = compact ? "h-8 w-8" : "h-9 w-9";

  return (
    <>
      {option.imageUrl ? (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30",
            iconBox,
          )}
        >
          <img src={option.imageUrl} alt="" className="h-full w-full object-contain p-1" />
        </span>
      ) : option.icon ? (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground",
            iconBox,
          )}
        >
          {option.icon}
        </span>
      ) : (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 text-muted-foreground",
            iconBox,
          )}
        >
          <Router className="h-4 w-4 opacity-60" strokeWidth={1.75} aria-hidden />
        </span>
      )}
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-sm font-medium text-foreground">{option.label}</span>
        {option.description ? (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{option.description}</span>
        ) : null}
      </span>
    </>
  );
}

export function Select({
  label,
  placeholder,
  value,
  onChange,
  options,
  trailingOption,
  disabled = false,
  hint,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const labelId = useId();

  const allOptions = trailingOption ? [...options, trailingOption] : options;
  const selected = allOptions.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const pickOption = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const renderOptionRow = (option: SelectOption, isTrailing = false) => {
    const isSelected = option.value === value;

    return (
      <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => pickOption(option.value)}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2.5 text-start transition-colors",
          isTrailing && "border-t border-border/60",
          isSelected
            ? "bg-primary/[0.08] text-foreground"
            : "text-foreground hover:bg-muted/50",
        )}
      >
        <OptionPreview option={option} compact />
        {isSelected ? (
          <Check className="ms-auto h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
        ) : (
          <span className="ms-auto h-4 w-4 shrink-0" aria-hidden />
        )}
      </button>
    );
  };

  return (
    <div ref={rootRef} className={cn("relative flex w-full flex-col gap-1.5", className)}>
      {label ? (
        <span id={labelId} className="text-sm font-medium text-foreground">
          {label}
        </span>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? labelId : undefined}
        aria-controls={listId}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex h-12 w-full items-center gap-3 rounded-xl border bg-surface px-3 text-start shadow-sm transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
          disabled && "cursor-not-allowed opacity-50",
          open
            ? "border-primary/40 ring-2 ring-primary/10"
            : "border-border hover:border-border/80 hover:bg-muted/20",
        )}
      >
        {selected ? (
          <OptionPreview option={selected} compact />
        ) : (
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20">
              <Router className="h-4 w-4 text-muted-foreground/70" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {placeholder ?? "—"}
            </span>
          </span>
        )}
        <ChevronDown
          className={cn(
            "ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-primary",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute inset-x-0 top-[calc(100%+0.375rem)] z-50 overflow-hidden rounded-xl border border-border/80",
            "bg-surface shadow-lg ring-1 ring-black/5",
          )}
        >
          <div className="max-h-64 overflow-y-auto overscroll-contain py-1">
            {options.length === 0 && !trailingOption ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">{placeholder}</p>
            ) : (
              options.map((option) => renderOptionRow(option))
            )}
            {trailingOption ? renderOptionRow(trailingOption, true) : null}
          </div>
        </div>
      ) : null}

      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
