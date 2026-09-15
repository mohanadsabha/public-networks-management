import { BarChart3, CalendarDays, RefreshCw } from "lucide-react";

import { format } from "date-fns";

import { ar, enUS } from "date-fns/locale";

import { useState } from "react";

import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";

import {

  StatisticsActivitySection,

  StatisticsChartsSection,

  StatisticsLifecycleCards,

  StatisticsOverviewCards,

  StatisticsNewSubscribersSection,

  StatisticsPoolSection,

  StatisticsUsernameChangesSection,

} from "@/components/pages/statistics";

import { Button } from "@/components/ui/buttons";

import { LoadingState } from "@/components/ui/feedback";

import { Text } from "@/components/ui/typography";

import { usePermissions } from "@/hooks/usePermissions";
import { useConnectedActiveSubscribersCount } from "@/hooks/useConnectedActiveSubscribersCount";
import { useStatisticsQuery } from "@/hooks/useStatistics";

import { cn } from "@/lib/cn";

import { MIKROTIK_FEATURES_ENABLED } from "@/lib/vpnConfig";

import { ApiError } from "@/types/api";



const YEAR_OPTIONS = [0, 1, 2].map((offset) => new Date().getFullYear() - offset);



export function StatisticsPage() {

  const { t, i18n } = useTranslation();
  const { can } = usePermissions();

  const [year, setYear] = useState(new Date().getFullYear());



  const { data, isLoading, isError, error, refetch, isFetching } = useStatisticsQuery(year);
  const connectedCounts = useConnectedActiveSubscribersCount();

  const handleRefresh = () => {
    void refetch();
    if (MIKROTIK_FEATURES_ENABLED) {
      void connectedCounts.refetch();
    }
  };

  const isRefreshing = isFetching || connectedCounts.isFetching;



  const locale = i18n.language.startsWith("ar") ? ar : enUS;

  const todayLabel = format(new Date(), "PPP", { locale });



  if (isLoading) {

    return <LoadingState layout="statistics" variant="page" />;

  }



  if (isError || !data) {

    return (

      <div className="flex min-h-[min(50vh,28rem)] flex-col items-center justify-center gap-4 px-4 text-center">

        <Text muted>

          {error instanceof ApiError ? error.message : t("common.unexpectedError")}

        </Text>

        <Button variant="outline" onClick={() => refetch()}>

          {t("common.retry")}

        </Button>

      </div>

    );

  }



  const connectedCount = connectedCounts.statisticsActive ?? 0;
  const activeSubscribers = Math.max(
    data.overview.activeSubscribers,
    connectedCounts.statisticsActive !== null ? connectedCount : 0,
  );



  return (

    <div className="min-w-0 space-y-6 pb-4 sm:space-y-8">

      <section

        className={cn(

          "relative overflow-hidden rounded-2xl border border-border/70",

          "bg-gradient-to-br from-primary/[0.08] via-surface to-accent/[0.06]",

          "px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8",

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



        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div className="min-w-0 max-w-2xl">

            <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">

              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary sm:px-3 sm:py-1 sm:text-xs">

                <BarChart3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />

                {t("statistics.liveBadge")}

              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface/80 px-2.5 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm sm:px-3 sm:py-1 sm:text-xs">

                <CalendarDays className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />

                <span className="truncate">{todayLabel}</span>

              </div>

            </div>



            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">

              {t("statistics.title")}

            </h1>

            <Text muted className="mt-2 text-sm leading-relaxed sm:mt-3">

              {t("statistics.subtitle")}

            </Text>

          </div>



          <div className="flex w-full min-w-0 flex-col gap-3 lg:w-auto lg:shrink-0">

            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-surface/80 p-2.5 backdrop-blur-sm sm:grid-cols-4 sm:gap-4 sm:p-3">

              <HeroKpi

                value={data.overview.totalRecords}

                label={t("statistics.hero.totalRecords")}

              />

              <div className="border-s border-border/60 ps-2 sm:ps-4">

                <HeroKpi

                  value={activeSubscribers}

                  label={t("statistics.hero.activeSubscribers")}

                />

              </div>

              <div className="border-s border-border/60 ps-2 sm:ps-4">

                <HeroKpi

                  value={connectedCounts.statisticsActive ?? 0}

                  label={t("statistics.hero.connectedSubscribers")}

                  muted={connectedCounts.statisticsActive === null}

                />

              </div>

              <div className="border-s border-border/60 ps-2 sm:ps-4">

                <HeroKpi

                  value={data.overview.totalAvailableUsernames}

                  label={t("statistics.hero.poolAvailable")}

                />

              </div>

            </div>



            <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">

              <label className="flex flex-1 items-center sm:flex-none">

                <span className="sr-only">{t("statistics.yearLabel")}</span>

                <select

                  value={year}

                  onChange={(e) => setYear(Number(e.target.value))}

                  className={cn(

                    "h-9 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-sm sm:h-10 sm:w-auto sm:min-w-[5.5rem]",

                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",

                  )}

                >

                  {YEAR_OPTIONS.map((y) => (

                    <option key={y} value={y}>

                      {y}

                    </option>

                  ))}

                </select>

              </label>



              <Button

                size="sm"

                variant="outline"

                onClick={handleRefresh}

                disabled={isRefreshing}

                className="h-9 shrink-0 sm:h-10"

              >

                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />

                <span className="hidden sm:inline">{t("statistics.refresh")}</span>

              </Button>

            </div>

          </div>

        </div>

      </section>



      <StatisticsOverviewCards

        overview={{ ...data.overview, activeSubscribers }}

        weekNewSubscribers={data.thisWeek.newSubscribers}

        weekUsernamesAdded={data.thisWeek.availableUsernamesAdded}

        connectedActiveSubscribers={connectedCounts.statisticsActive}

      />



      <StatisticsLifecycleCards summary={data.subscription.summary} />



      <StatisticsActivitySection

        thisWeek={data.thisWeek}

        newThisMonth={data.thisMonth.newSubscribers}

      />



      <StatisticsChartsSection data={data} />



      <StatisticsPoolSection rows={data.availableDaysBreakdownBySpeed} />



      <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-2">

        <StatisticsNewSubscribersSection />

        <StatisticsUsernameChangesSection />

      </div>



      <div className="flex flex-wrap gap-2 border-t border-border pt-4">

        {can("customers.view") ? (
          <QuickLink to="/customers" label={t("statistics.links.viewCustomers")} />
        ) : null}

        <QuickLink to="/subscribers" label={t("statistics.links.viewSubscribers")} />

        <QuickLink to="/expiring" label={t("statistics.links.viewExpiring")} />

        {can("disabled.view") ? (
          <QuickLink to="/stopped" label={t("statistics.links.viewStopped")} />
        ) : null}

      </div>

    </div>

  );

}



function HeroKpi({
  value,
  label,
  muted = false,
}: {
  value: number;
  label: string;
  muted?: boolean;
}) {

  return (

    <div className="min-w-0 text-center sm:text-start">

      <p
        className={cn(
          "truncate text-lg font-bold tabular-nums sm:text-2xl",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >

        {muted ? "—" : value.toLocaleString()}

      </p>

      <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{label}</p>

    </div>

  );

}



function QuickLink({ to, label }: { to: string; label: string }) {

  return (

    <Link

      to={to}

      className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

    >

      {label}

    </Link>

  );

}


