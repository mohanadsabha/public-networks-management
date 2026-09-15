import { cn } from "@/lib/cn";

export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "accent"
  | "muted";

interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
}

export function StatusBadge({
  label,
  variant = "muted",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "success" && "bg-success/10 text-success",
        variant === "warning" && "bg-warning/10 text-warning",
        variant === "danger" && "bg-danger/10 text-danger",
        variant === "primary" && "bg-primary/10 text-primary",
        variant === "accent" && "bg-accent/10 text-accent",
        variant === "muted" && "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
