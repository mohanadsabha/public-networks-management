import { cn } from "@/lib/cn";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-11 w-11",
} as const;

/** Branded dual-ring loader */
export function Loader({ size = "md", className }: LoaderProps) {
  return (
    <span
      className={cn("relative inline-flex shrink-0", sizeClasses[size], className)}
      role="status"
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full border-2 border-muted" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/40" />
      <span className="absolute inset-[28%] animate-pulse rounded-full bg-primary/25" />
    </span>
  );
}
