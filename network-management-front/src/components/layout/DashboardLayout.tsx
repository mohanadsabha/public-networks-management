import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "@/components/ui/branding";
import { Sheet, SheetHeader } from "@/components/ui/overlays";
import { useAuthUserLabels } from "@/hooks/useAuthUserLabels";
import { LG_MEDIA_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { getDashboardNavItems } from "@/lib/dashboardNav";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebarPanel } from "./DashboardSidebarPanel";

export function DashboardLayout() {
  const { t } = useTranslation();
  const { displayName, displayRole } = useAuthUserLabels();
  const { can } = usePermissions();
  const { isViewer } = useRoleAccess();
  const location = useLocation();
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = getDashboardNavItems(isViewer);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isDesktop) setMobileNavOpen(false);
  }, [isDesktop]);

  const canAccess = (permission?: string) => !permission || can(permission);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="dashboard-sidebar relative z-20 sticky top-0 hidden h-dvh w-[16.5rem] shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <DashboardSidebarPanel
          navItems={navItems}
          displayName={displayName}
          displayRole={displayRole}
          canAccess={canAccess}
          className="min-h-0 flex-1"
        />
      </aside>

      {!isDesktop ? (
        <Sheet
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          ariaLabel={t("nav.closeMenu")}
        >
          <SheetHeader
            onClose={() => setMobileNavOpen(false)}
            closeLabel={t("nav.closeMenu")}
          >
            <Logo size="sm" variant="on-dark" preferImage />
          </SheetHeader>
          <DashboardSidebarPanel
            navItems={navItems}
            displayName={displayName}
            displayRole={displayRole}
            canAccess={canAccess}
            onNavigate={() => setMobileNavOpen(false)}
            showLogo={false}
            className="min-h-0 flex-1"
          />
        </Sheet>
      ) : null}

      <div className="relative z-0 flex min-w-0 flex-1 flex-col">
        <DashboardHeader onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
