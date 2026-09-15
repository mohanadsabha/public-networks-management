import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { cn } from "@/lib/cn";

const MASK = "••••••";

interface MaskedPasswordCellProps {
  value: string;
  className?: string;
}

export function MaskedPasswordCell({ value, className }: MaskedPasswordCellProps) {
  const { t } = useTranslation();
  const { canViewPasswords } = useRoleAccess();
  const [visible, setVisible] = useState(false);

  if (!canViewPasswords) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)} aria-hidden>
        —
      </span>
    );
  }

  return (
    <div className={cn("inline-flex max-w-full min-w-0 items-center gap-1", className)}>
      <span
        className={cn(
          "min-w-0 max-w-[5.5rem] truncate font-mono text-xs sm:text-sm",
          !visible && "tracking-wider",
        )}
        title={visible ? value : undefined}
      >
        {visible ? value : MASK}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
