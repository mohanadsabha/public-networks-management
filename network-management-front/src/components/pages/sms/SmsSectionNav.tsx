import { FileText, History, Send, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { smsPath, type SmsSection } from "@/lib/routePaths";
import { cn } from "@/lib/cn";

const SECTIONS: Array<{ id: SmsSection; icon: typeof Send }> = [
  { id: "send", icon: Send },
  { id: "groups", icon: Users },
  { id: "logs", icon: History },
  { id: "templates", icon: FileText },
];

export function SmsSectionNav() {
  const { t } = useTranslation();

  return (
    <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-border/70 bg-muted/20 p-1.5 shadow-sm sm:flex sm:flex-wrap">
      {SECTIONS.map(({ id, icon: Icon }) => (
        <NavLink
          key={id}
          to={smsPath(id)}
          end={id === "send"}
          className={({ isActive }) =>
            cn(
              "inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:px-4 lg:flex-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          {t(`sms.sections.${id}`)}
        </NavLink>
      ))}
    </nav>
  );
}
