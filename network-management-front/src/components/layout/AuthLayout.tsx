import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { AuthSponsor } from "@/components/pages/auth";
import { Logo } from "@/components/ui/branding";
import { LanguageToggle, ThemeToggle } from "@/components/ui/navigation";
import { cn } from "@/lib/cn";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
  showLanguageToggle?: boolean;
  showThemeToggle?: boolean;
}

export function AuthLayout({
  children,
  className,
  showLanguageToggle = true,
  showThemeToggle = true,
}: AuthLayoutProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — inline-end side (right in RTL, left in LTR) */}
      <aside className="relative hidden overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between">
        <div className="auth-gradient-mesh pointer-events-none absolute inset-0" />
        <div className="auth-grid-pattern pointer-events-none absolute inset-0 opacity-[0.07]" />

        <div className="relative z-10 p-8 xl:p-14">
          <AuthSponsor variant="on-dark" />
        </div>

        <div className="relative z-10 space-y-6 p-8 xl:p-14">
          <blockquote className="max-w-md space-y-3">
            <p className="text-xl font-semibold leading-relaxed text-white xl:text-2xl">
              {t("auth.panelTitle")}
            </p>
            <p className="text-sm leading-relaxed text-white/65">
              {t("auth.panelSubtitle")}
            </p>
          </blockquote>

          <div className="flex flex-wrap gap-6 text-sm text-white/50">
            <div>
              <p className="text-2xl font-bold text-white">+500</p>
              <p>{t("auth.statSubscribers")}</p>
            </div>
            <div className="hidden h-auto w-px bg-white/15 sm:block" />
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p>{t("auth.statMonitoring")}</p>
            </div>
            <div className="hidden h-auto w-px bg-white/15 sm:block" />
            <div>
              <p className="text-2xl font-bold text-accent">100%</p>
              <p>{t("auth.statControl")}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 px-8 py-5 text-xs text-white/40 xl:px-14">
          © {year} WeWiFi — {t("auth.copyright")}
        </div>
      </aside>

      {/* Form panel */}
      <main
        className={cn(
          "relative flex min-h-screen flex-col bg-background px-4 py-8 sm:px-6 sm:py-10 lg:min-h-0 lg:justify-center lg:px-8",
          className,
        )}
      >
        {showLanguageToggle || showThemeToggle ? (
          <div className="mb-6 flex justify-end gap-2 lg:absolute lg:end-6 lg:top-6 lg:mb-0 xl:end-8 xl:top-8">
            {showThemeToggle ? <ThemeToggle variant="outline" /> : null}
            {showLanguageToggle ? <LanguageToggle /> : null}
          </div>
        ) : null}

        <div className="mb-6 flex justify-center lg:hidden">
          <Logo size="md" showTagline />
        </div>

        <div className="mx-auto w-full max-w-[420px] flex-1 lg:flex-none">{children}</div>
      </main>
    </div>
  );
}
