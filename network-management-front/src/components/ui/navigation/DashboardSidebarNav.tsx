import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { DashboardNavItem } from "@/lib/dashboardNav";

interface DashboardSidebarNavProps {
  items: DashboardNavItem[];
  canAccess: (permission?: string) => boolean;
  onNavigate?: () => void;
}

export function DashboardSidebarNav({ items, canAccess, onNavigate }: DashboardSidebarNavProps) {
  const { t } = useTranslation();
  const visibleItems = items.filter((item) => canAccess(item.permission));

  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {visibleItems.map(({ labelKey, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "group relative flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium leading-normal transition-colors duration-150",
              isActive
                ? "bg-white/[0.08] text-white"
                : "text-sidebar-foreground hover:bg-white/[0.05] hover:text-white/90",
            )
          }
        >
          <span
            className="pointer-events-none absolute inset-y-2 start-0 w-0.5 rounded-full bg-sidebar-active opacity-0 transition-opacity duration-150 group-aria-[current=page]:opacity-100"
            aria-hidden
          />
          <span
            className={cn(
              "pointer-events-none flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150",
              "text-sidebar-foreground group-aria-[current=page]:bg-sidebar-active/20 group-aria-[current=page]:text-sidebar-active",
              "group-hover:text-white/80 group-aria-[current=page]:group-hover:text-sidebar-active",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1 truncate leading-normal">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
