export const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary-hover focus-visible:ring-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:opacity-90 focus-visible:ring-secondary",
  outline:
    "border border-border bg-surface text-foreground hover:bg-muted focus-visible:ring-primary",
  ghost: "text-foreground hover:bg-muted focus-visible:ring-primary",
  danger:
    "bg-danger text-danger-foreground hover:opacity-90 focus-visible:ring-danger",
} as const;

export const buttonSizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-10 w-10",
} as const;

export const buttonBaseClassName =
  "relative inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
