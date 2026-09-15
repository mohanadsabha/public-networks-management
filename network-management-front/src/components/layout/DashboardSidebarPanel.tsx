import { AuthSponsor } from "@/components/pages/auth";
import { DashboardSidebarNav } from "@/components/ui/navigation";
import type { DashboardNavItem } from "@/lib/dashboardNav";
import { cn } from "@/lib/cn";

interface DashboardSidebarPanelProps {
  navItems: DashboardNavItem[];
  displayName: string;
  displayRole: string;
  canAccess: (permission?: string) => boolean;
  onNavigate?: () => void;
  className?: string;
  showLogo?: boolean;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "•";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function DashboardSidebarPanel({
  navItems,
  displayName,
  displayRole,
  canAccess,
  onNavigate,
  className,
  showLogo = true,
}: DashboardSidebarPanelProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {showLogo ? (
        <div className="sidebar-brand-header hidden lg:flex">
          <AuthSponsor variant="on-dark" size="compact" className="w-full" />
        </div>
      ) : null}

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DashboardSidebarNav
          items={navItems}
          canAccess={canAccess}
          onNavigate={onNavigate}
        />
      </div>

      <div className="shrink-0 border-t border-white/[0.08] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-active/20 text-[11px] font-bold text-sidebar-active"
            aria-hidden
          >
            {initialsOf(displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight text-white">
              {displayName}
            </p>
            <p className="truncate text-[11px] leading-tight text-sidebar-foreground">
              {displayRole}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
