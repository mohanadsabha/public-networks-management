import type { ReactNode } from "react";
import { ExternalLink, Filter, Router, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { buttonBaseClassName, buttonSizes, buttonVariants } from "@/components/ui/buttons/buttonStyles";
import {
  dataTableActionsCellClass,
  dataTableActionsHeadCellClass,
  dataTableBodyRowClass,
  dataTableCellClass,
  dataTableFixedClass,
  dataTableHeadCellClass,
  dataTableHeadRowClass,
  dataTableScrollMinClass,
  dataTableWrapClass,
  LtrText,
} from "@/components/ui/data";
import { splitHostAndPort } from "@/lib/ipAddressUtils";
import { formatSnapshotDateTime } from "@/lib/formatSnapshotDateTime";
import { getPackageLineForOnlineUser } from "@/lib/onlineUsersUtils";
import { parseRouterPortDisplay } from "@/lib/routerUtils";
import { subscriberProfilePath } from "@/lib/routePaths";
import type { OnlineUser } from "@/types/onlineUser";
import { cn } from "@/lib/cn";

interface OnlineUsersTableProps {
  rows: OnlineUser[];
  hasSearch: boolean;
  onFilterByLine?: (packageLine: number) => void;
  className?: string;
}

const externalLinkClass =
  "text-primary underline-offset-2 transition-colors hover:text-primary/80 hover:underline";

export function OnlineUsersTable({
  rows,
  hasSearch,
  onFilterByLine,
  className,
}: OnlineUsersTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border border-dashed border-border px-6 py-14 text-center",
          className,
        )}
      >
        <Wifi className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="mt-3 text-sm text-foreground">
          {hasSearch ? t("onlineUsers.table.noResults") : t("onlineUsers.table.empty")}
        </p>
        {!hasSearch ? (
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">{t("onlineUsers.table.emptyHint")}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-3 lg:hidden">
        {rows.map((row, index) => (
          <OnlineUserMobileCard
            key={`${row.username}-${row.ipAddress}`}
            row={row}
            index={index + 1}
            onFilterByLine={onFilterByLine}
          />
        ))}
      </div>

      <div className={cn("hidden lg:block", dataTableWrapClass)}>
        <table className={cn(dataTableFixedClass, dataTableScrollMinClass)}>
          <colgroup>
            <col className="w-[3%]" />
            <col className="w-[13%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[22%]" />
            <col className="w-[9%]" />
            <col className="w-[7%]" />
            <col className="w-[11%]" />
            <col className="w-[7%]" />
          </colgroup>
          <thead>
            <tr className={dataTableHeadRowClass}>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.index")}</th>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.username")}</th>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.fullName")}</th>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.ipAddress")}</th>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.router")}</th>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.uptime")}</th>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.status")}</th>
              <th className={dataTableHeadCellClass}>{t("onlineUsers.table.updatedAt")}</th>
              <th className={dataTableActionsHeadCellClass} aria-hidden />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.username}-${row.ipAddress}`} className={dataTableBodyRowClass}>
                <td className={cn("text-muted-foreground", dataTableCellClass)}>{index + 1}</td>
                <td className={dataTableCellClass}>
                  <SubscriberProfileLink lineId={row.lineId} className="font-mono text-sm font-medium">
                    {row.username}
                  </SubscriberProfileLink>
                </td>
                <td className={dataTableCellClass}>
                  {row.fullName ? (
                    <SubscriberProfileLink lineId={row.lineId} className="text-sm">
                      {row.fullName}
                    </SubscriberProfileLink>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className={dataTableCellClass}>
                  <OnlineIpLink address={row.ipAddress} />
                </td>
                <td className={dataTableCellClass}>
                  <OnlineRouterCell row={row} />
                </td>
                <td className={dataTableCellClass}>
                  <LtrText className="text-sm">{row.uptime || "—"}</LtrText>
                </td>
                <td className={dataTableCellClass}>
                  <OnlineStatusBadge />
                </td>
                <td className={dataTableCellClass}>
                  <LtrText className="text-xs text-muted-foreground">
                    {formatSnapshotDateTime(row.lastUpdated)}
                  </LtrText>
                </td>
                <td className={dataTableActionsCellClass}>
                  <div className="flex items-center justify-center gap-0.5">
                    <SameGroupActions
                      row={row}
                      onFilterByLine={onFilterByLine}
                      compact
                    />
                    {row.lineId ? (
                      <Link
                        to={subscriberProfilePath(row.lineId, "stats")}
                        className={cn(buttonBaseClassName, buttonVariants.ghost, buttonSizes.sm, "h-8 w-8 p-0")}
                        title={t("onlineUsers.table.openProfile")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OnlineIpLink({ address }: { address: string }) {
  if (!address?.trim()) {
    return <span className="text-muted-foreground">—</span>;
  }

  const { host, port } = splitHostAndPort(address);
  const href = `http://${address}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
      <LtrText className="font-mono text-sm">
        {host}
        {port ? (
          <>
            <span className="text-muted-foreground">:</span>
            <span className="font-semibold text-accent">{port}</span>
          </>
        ) : null}
      </LtrText>
    </a>
  );
}

function OnlineRouterCell({ row }: { row: OnlineUser }) {
  const { t } = useTranslation();
  const remote = parseRouterPortDisplay(row.routerPort);
  const hasRouter = Boolean(row.routerName?.trim() || row.routerImageUrl);

  if (!hasRouter) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
        {row.routerImageUrl ? (
          <img src={row.routerImageUrl} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <Router className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{row.routerName}</p>
        {remote.enabled ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("onlineUsers.table.remotePort")}:{" "}
            <LtrText className="font-mono font-medium text-accent">{remote.display}</LtrText>
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">{t("onlineUsers.table.remoteOff")}</p>
        )}
      </div>
    </div>
  );
}

function SameGroupActions({
  row,
  onFilterByLine,
  compact = false,
}: {
  row: OnlineUser;
  onFilterByLine?: (packageLine: number) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const packageLine = getPackageLineForOnlineUser(row);

  if (!onFilterByLine || packageLine == null) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", compact ? "justify-center" : "mt-3")}>
      <button
        type="button"
        onClick={() => onFilterByLine(packageLine)}
        className={cn(
          buttonBaseClassName,
          buttonVariants.outline,
          buttonSizes.sm,
          compact ? "h-8 w-8 p-0" : "gap-1.5",
        )}
        title={t("onlineUsers.table.filterSameLine")}
        aria-label={t("onlineUsers.table.sameLineAction", { line: packageLine })}
      >
        <Filter className="h-3.5 w-3.5" aria-hidden />
        {!compact ? (
          <span className="text-xs">
            {t("onlineUsers.table.sameLineAction", { line: packageLine })}
          </span>
        ) : null}
      </button>
    </div>
  );
}

function SubscriberProfileLink({
  lineId,
  children,
  className,
}: {
  lineId?: string | null;
  children: ReactNode;
  className?: string;
}) {
  if (!lineId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={subscriberProfilePath(lineId, "stats")}
      className={cn("text-foreground hover:text-primary hover:underline", className)}
    >
      {children}
    </Link>
  );
}

function OnlineStatusBadge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
      {t("onlineUsers.table.online")}
    </span>
  );
}

function OnlineUserMobileCard({
  row,
  index,
  onFilterByLine,
}: {
  row: OnlineUser;
  index: number;
  onFilterByLine?: (packageLine: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">#{index}</p>
          <SubscriberProfileLink lineId={row.lineId} className="mt-1 block font-mono text-sm font-semibold">
            {row.username}
          </SubscriberProfileLink>
          {row.fullName ? (
            <SubscriberProfileLink lineId={row.lineId} className="mt-1 block text-sm">
              {row.fullName}
            </SubscriberProfileLink>
          ) : null}
        </div>
        <OnlineStatusBadge />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">{t("onlineUsers.table.ipAddress")}</dt>
          <dd className="mt-0.5">
            <OnlineIpLink address={row.ipAddress} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{t("onlineUsers.table.uptime")}</dt>
          <dd className="mt-0.5">
            <LtrText className="text-xs">{row.uptime || "—"}</LtrText>
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-muted-foreground">{t("onlineUsers.table.router")}</dt>
          <dd className="mt-1">
            <OnlineRouterCell row={row} />
          </dd>
        </div>
      </dl>

      <SameGroupActions row={row} onFilterByLine={onFilterByLine} />

      {row.lineId ? (
        <Link
          to={subscriberProfilePath(row.lineId, "stats")}
          className={cn(
            buttonBaseClassName,
            buttonVariants.outline,
            buttonSizes.sm,
            "mt-4 w-full",
          )}
        >
          <ExternalLink className="h-4 w-4" />
          {t("onlineUsers.table.openProfile")}
        </Link>
      ) : null}
    </article>
  );
}
