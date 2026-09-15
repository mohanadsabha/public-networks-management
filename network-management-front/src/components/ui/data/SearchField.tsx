import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  size?: "default" | "compact";
}

export function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
  size = "default",
}: SearchFieldProps) {
  const compact = size === "compact";

  return (
    <div className={cn("relative w-full", compact ? "max-w-md" : "max-w-md", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
          compact ? "h-3.5 w-3.5" : "h-4 w-4 start-3",
        )}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "flex w-full border border-border/70 bg-background text-sm shadow-sm",
          "placeholder:text-muted-foreground transition-colors",
          "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
          compact
            ? "h-9 rounded-lg ps-8 pe-2.5 text-xs sm:text-sm"
            : "h-11 rounded-xl ps-10 pe-3",
        )}
      />
    </div>
  );
}
