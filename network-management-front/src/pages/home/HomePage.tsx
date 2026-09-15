import { useTranslation } from "react-i18next";
import { HomeQuickLinkCard } from "@/components/pages/home/HomeQuickLinkCard";
import { HOME_LINKS } from "@/components/pages/home/homeLinks";
import { Text } from "@/components/ui/typography";
import { useAuthUserLabels } from "@/hooks/useAuthUserLabels";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { cn } from "@/lib/cn";

export function HomePage() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const { isViewer } = useRoleAccess();
  const { displayName } = useAuthUserLabels();

  const visible = HOME_LINKS.filter((item) => {
    if (isViewer && item.to === "/customers") return false;
    return can(item.permission);
  });
  const quickLinks = visible.filter((item) => item.section === "quick");
  const adminLinks = visible.filter((item) => item.section === "admin");

  const greetingName = displayName.trim() || t("home.guestName");

  return (
    <div className="space-y-8 pb-4">
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/70",
          "bg-gradient-to-br from-primary/[0.08] via-surface to-accent/[0.06]",
          "px-5 py-8 sm:px-8 sm:py-10",
        )}
      >
        <div
          className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -start-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              WeWiFi
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("home.greeting", { name: greetingName })}
            </h1>
            <Text muted className="mt-3 text-sm leading-relaxed sm:text-base">
              {t("home.subtitle")}
            </Text>
          </div>

          <div className="flex shrink-0 gap-6 rounded-xl border border-border/60 bg-surface/80 px-5 py-3 backdrop-blur-sm sm:gap-8">
            <div className="text-center sm:text-start">
              <p className="text-2xl font-bold tabular-nums text-foreground">{quickLinks.length}</p>
              <p className="text-xs text-muted-foreground">{t("home.shortcuts")}</p>
            </div>
            {adminLinks.length > 0 ? (
              <div className="border-s border-border/60 ps-6 text-center sm:text-start">
                <p className="text-2xl font-bold tabular-nums text-foreground">{adminLinks.length}</p>
                <p className="text-xs text-muted-foreground">{t("home.adminShortcuts")}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {quickLinks.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("home.quickAccess")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quickLinks.map((item) => (
              <HomeQuickLinkCard key={item.to} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {adminLinks.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("home.adminTools")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {adminLinks.map((item) => (
              <HomeQuickLinkCard key={item.to} item={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
