import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

interface AuthBackLinkProps {
  to?: string;
  className?: string;
}

export function AuthBackLink({ to = "/login", className }: AuthBackLinkProps) {
  const { t } = useTranslation();

  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
      {t("auth.backToLogin")}
    </Link>
  );
}
