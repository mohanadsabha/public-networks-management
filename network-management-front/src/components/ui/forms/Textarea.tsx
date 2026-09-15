import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const fieldId = id ?? label?.replace(/\s+/g, "-").toLowerCase();

    return (
      <div className="space-y-1.5">
        {label ? (
          <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            "flex min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus-visible:ring-danger/30",
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
