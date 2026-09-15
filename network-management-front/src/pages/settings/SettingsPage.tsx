import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ConnectionPathText } from "@/components/pages/settings";
import { Card } from "@/components/ui/cards";
import { Heading, Text } from "@/components/ui/typography";
import { usePermissions } from "@/hooks/usePermissions";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { settingsHubItems } from "@/lib/dashboardNav";
export function SettingsPage() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const { canManage } = useRoleAccess();

  const items = settingsHubItems.filter((item) => {
    if (item.requiresManage && !canManage) return false;
    return !item.permission || can(item.permission);
  });

  return (
    <div className="space-y-6">
      <div>
        <Heading as="h1">{t("settings.title")}</Heading>
        <Text muted className="mt-2 max-w-2xl">
          {t("settings.subtitle")}
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ titleKey, descriptionKey, to, icon: Icon, badgeKey }) => (
          <Link key={to} to={to} className="group block h-full">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <div className="flex items-start gap-3 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{t(titleKey)}</p>
                    {badgeKey ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t(badgeKey)}
                      </span>
                    ) : null}
                  </div>
                  <Text muted className="mt-2 text-sm">
                    {to === "/settings/vpn" ? <ConnectionPathText /> : t(descriptionKey)}
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
