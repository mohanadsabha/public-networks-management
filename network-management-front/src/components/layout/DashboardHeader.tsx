import { LogOut, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { Breadcrumb } from "@/components/ui/navigation";
import { LanguageToggle, ThemeToggle } from "@/components/ui/navigation";
import { useAuth } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { t } = useTranslation();
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="dashboard-shell-header sticky top-0 z-30 justify-between gap-3 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label={t("nav.openMenu")}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Breadcrumb
          className="min-w-0 truncate"
          items={[{ label: "WeWiFi" }, { label: t("nav.dashboard") }]}
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <LanguageToggle variant="compact" />
        <ThemeToggle />
        <Button
          variant="outline"
          size="icon"
          className="sm:hidden"
          onClick={handleLogout}
          isLoading={isLoggingOut}
          aria-label={t("nav.logout")}
        >
          <LogOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={handleLogout}
          isLoading={isLoggingOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">{t("nav.logout")}</span>
        </Button>
      </div>
    </header>
  );
}
