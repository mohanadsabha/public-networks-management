import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const { t } = useTranslation();
    const inputId = id ?? props.name;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            className={cn(
              "password-input flex h-11 w-full rounded-lg border border-border bg-surface py-2 ps-3 pe-11 text-sm text-start",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus-visible:ring-danger/30 focus-visible:border-danger",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
            onClick={() => setVisible((v) => !v)}
            className="absolute inset-y-0 end-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
