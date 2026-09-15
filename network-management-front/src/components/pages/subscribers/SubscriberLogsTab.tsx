import { format, parseISO } from "date-fns";
import { History, ScrollText } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TablePagination } from "@/components/ui/data/TablePagination";
import { LoadingState } from "@/components/ui/feedback";
import { Text } from "@/components/ui/typography";
import { useSubscriberLogsQuery } from "@/hooks/useSubscribers";
import { formatSubscriberLogSummary } from "@/lib/mapSubscriberActivityLog";
import type { Subscriber } from "@/types/subscriber";
import type { SubscriberActivityLog } from "@/types/subscriberActivityLog";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 15;

interface SubscriberLogsTabProps {
  subscriber: Pick<Subscriber, "id" | "lineId" | "fullName">;
}

const ACTION_VARIANT: Record<string, string> = {
  Created: "bg-success/15 text-success ring-success/25",
  Updated: "bg-primary/15 text-primary ring-primary/25",
  Deleted: "bg-danger/15 text-danger ring-danger/25",
};

function formatTimestamp(value: string): string {
  if (!value) return "—";
  try {
    return format(parseISO(value), "yyyy-MM-dd HH:mm");
  } catch {
    return value;
  }
}

function formatActionLabel(action: string, t: (key: string) => string): string {
  const key = `activityLogs.actions.${action}`;
  const translated = t(key);
  return translated === key ? action : translated;
}

function LogEntry({ log }: { log: SubscriberActivityLog }) {
  const { t } = useTranslation();
  const summary = formatSubscriberLogSummary(log, t);
  const badgeClass = ACTION_VARIANT[log.action] ?? "bg-muted text-muted-foreground ring-border";

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      <div className="relative flex w-5 shrink-0 justify-center">
        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/15" aria-hidden />
        <span className="absolute top-4 bottom-0 w-px bg-border" aria-hidden />
      </div>

      <article className="min-w-0 flex-1 rounded-xl border border-border/80 bg-surface px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{summary}</p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
              badgeClass,
            )}
          >
            {formatActionLabel(log.action, t)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {t("subscribers.logs.by", { name: log.adminName?.trim() || t("subscribers.logs.systemUser") })}
          </span>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <time className="tabular-nums" dir="ltr" dateTime={log.createdAt}>
            {formatTimestamp(log.createdAt)}
          </time>
          {log.ipAddress ? (
            <>
              <span className="hidden md:inline" aria-hidden>
                ·
              </span>
              <span className="font-mono tabular-nums" dir="ltr">
                {log.ipAddress}
              </span>
            </>
          ) : null}
        </div>

        {log.subjectName && log.subjectType !== "Subscriber" ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t(`activityLogs.subjectTypes.${log.subjectType}`, { defaultValue: log.subjectType })}
            {log.subjectName ? (
              <>
                {": "}
                <span className="font-medium text-foreground">{log.subjectName}</span>
              </>
            ) : null}
          </p>
        ) : null}
      </article>
    </li>
  );
}

export function SubscriberLogsTab({ subscriber }: SubscriberLogsTabProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const logsQuery = useSubscriberLogsQuery(
    subscriber.id,
    { lineId: subscriber.lineId, fullName: subscriber.fullName },
    { page, limit: PAGE_SIZE },
  );

  const logs = logsQuery.data?.items ?? [];
  const total = logsQuery.data?.total ?? 0;
  const showInitialLoading = logsQuery.isLoading && logs.length === 0;
  const isBackgroundRefresh = logsQuery.isFetching && !showInitialLoading;

  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <History className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{t("subscribers.logs.title")}</h2>
          <Text muted className="mt-1 text-sm">
            {t("subscribers.logs.subtitle")}
          </Text>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface px-4 py-4 sm:px-6 sm:py-5">
        {total > 0 ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Text muted className="text-sm">
              {t("subscribers.logs.sectionSubtitle", { count: logs.length, total })}
            </Text>
            {isBackgroundRefresh ? (
              <Text muted className="text-xs">
                {t("common.loading")}
              </Text>
            ) : null}
          </div>
        ) : null}

        {showInitialLoading ? (
          <LoadingState variant="inline" />
        ) : logsQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Text muted className="text-sm">{t("subscribers.logs.loadError")}</Text>
            <button
              type="button"
              className="mt-3 text-sm font-medium text-primary hover:underline"
              onClick={() => logsQuery.refetch()}
            >
              {t("common.retry")}
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border px-6 py-12 text-center">
            <ScrollText className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-foreground">{t("subscribers.logs.empty")}</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">{t("subscribers.logs.emptyHint")}</p>
          </div>
        ) : (
          <>
            <ol className="m-0 list-none p-0">
              {logs.map((log) => (
                <LogEntry key={log.id} log={log} />
              ))}
            </ol>
            <TablePagination
              page={page}
              limit={logsQuery.data?.limit ?? PAGE_SIZE}
              total={total}
              onPageChange={setPage}
              disabled={logsQuery.isFetching}
              className="mt-6 border-t border-border pt-4"
            />
          </>
        )}
      </div>
    </section>
  );
}
