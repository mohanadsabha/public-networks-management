import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { ButtonSpinner } from "@/components/ui/buttons/ButtonSpinner";
import {
  buttonBaseClassName,
  buttonSizes,
  buttonVariants,
} from "@/components/ui/buttons/buttonStyles";
import { cn } from "@/lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();

    return (
      <button
        ref={ref}
        className={cn(
          buttonBaseClassName,
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2",
            isLoading && "invisible",
          )}
        >
          {children}
        </span>

        {isLoading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <ButtonSpinner />
            <span className="sr-only">{t("common.loading")}</span>
          </span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = "Button";
