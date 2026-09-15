import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/cards";
import { Heading, Text } from "@/components/ui/typography";
import { excelHubItems } from "@/lib/excelHubItems";

export function ExcelToolsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span>
          {t("settings.excel.backToSettings")}
        </Link>
        <Heading as="h1">{t("settings.excel.title")}</Heading>
        <Text muted className="mt-2 max-w-2xl">
          {t("settings.excel.subtitle")}
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {excelHubItems.map(({ titleKey, descriptionKey, to, icon: Icon }) => (
          <Link key={to} to={to} className="group block h-full">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <div className="flex items-start gap-3 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{t(titleKey)}</p>
                  <Text muted className="mt-2 text-sm">
                    {t(descriptionKey)}
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
