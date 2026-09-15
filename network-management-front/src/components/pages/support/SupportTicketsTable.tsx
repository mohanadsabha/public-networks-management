import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { TicketStatusBadge } from "@/components/pages/support/TicketStatusBadge";
import { WhatsAppIcon } from "@/components/pages/support/WhatsAppIcon";
import { Button } from "@/components/ui/buttons";
import { openSupportTicketWhatsApp, whatsAppShareToastMessage } from "@/lib/supportWhatsApp";
import { StatusBadge } from "@/components/ui/data";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import type { SupportTicket } from "@/types/supportTicket";
import { cn } from "@/lib/cn";
import { format } from "date-fns";

interface SupportTicketsTableProps {
  rows: SupportTicket[];
  className?: string;
  hideSubscriberColumn?: boolean;
  onEdit?: (row: SupportTicket) => void;
  onDelete?: (row: SupportTicket) => void;
}

export function SupportTicketsTable({
  rows,
  className,
  hideSubscriberColumn = false,
  onEdit,
  onDelete,
}: SupportTicketsTableProps) {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();

  if (rows.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center", className)}>
        <p className="text-sm text-muted-foreground">{t("support.table.empty")}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <SupportTicketsMobileList
        rows={rows}
        canManage={canManage}
        hideSubscriberColumn={hideSubscriberColumn}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <div className="hidden w-full overflow-hidden rounded-xl border border-border lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-[12%] px-4 py-3 text-start font-semibold">{t("support.table.ticket")}</th>
              <th
                className={cn(
                  "px-4 py-3 text-start font-semibold",
                  hideSubscriberColumn ? "w-[30%]" : "w-[22%]",
                )}
              >
                {t("support.table.title")}
              </th>
              {hideSubscriberColumn ? null : (
                <th className="w-[14%] px-4 py-3 text-start font-semibold">{t("support.table.subscriber")}</th>
              )}
              <th className="w-[10%] px-4 py-3 text-start font-semibold">{t("support.table.channel")}</th>
              <th className="w-[10%] px-4 py-3 text-start font-semibold">{t("support.table.priority")}</th>
              <th className="w-[12%] px-4 py-3 text-start font-semibold">{t("support.table.status")}</th>
              <th className="w-[10%] px-4 py-3 text-start font-semibold">{t("support.table.createdAt")}</th>
              {canManage ? (
                <th className="w-[10%] px-4 py-3 text-center align-middle font-semibold">{t("support.table.actions")}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 align-middle font-mono text-xs text-muted-foreground">
                  {row.ticketNumber}
                </td>
                <td className="px-4 py-3 align-middle">
                  <p className="font-medium text-foreground">{row.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{row.description}</p>
                </td>
                {hideSubscriberColumn ? null : (
                  <td className="px-4 py-3 align-middle">
                    <p className="font-medium">{row.subscriberName}</p>
                    <p className="text-xs text-muted-foreground">{row.subscriberPhone}</p>
                  </td>
                )}
                <td className="px-4 py-3 align-middle">
                  {t(`support.channel.${row.channel}`)}
                </td>
                <td className="px-4 py-3 align-middle">
                  <PriorityBadge priority={row.priority} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <TicketStatusBadge status={row.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-middle text-muted-foreground">
                  {format(new Date(row.createdAt), "yyyy-MM-dd")}
                </td>
                {canManage ? (
                  <td className="px-4 py-3 text-center align-middle">
                    <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupportTicketsMobileList({
  rows,
  canManage,
  hideSubscriberColumn,
  onEdit,
  onDelete,
}: {
  rows: SupportTicket[];
  canManage: boolean;
  hideSubscriberColumn?: boolean;
  onEdit?: (row: SupportTicket) => void;
  onDelete?: (row: SupportTicket) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 lg:hidden">
      {rows.map((row) => (
        <article key={row.id} className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs text-muted-foreground">{row.ticketNumber}</p>
              <p className="mt-1 font-semibold text-foreground">{row.title}</p>
            </div>
            <TicketStatusBadge status={row.status} />
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{row.description}</p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {hideSubscriberColumn ? null : (
              <div>
                <dt className="text-xs font-medium text-muted-foreground">{t("support.table.subscriber")}</dt>
                <dd className="mt-1">{row.subscriberName}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t("support.table.channel")}</dt>
              <dd className="mt-1">{t(`support.channel.${row.channel}`)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t("support.table.priority")}</dt>
              <dd className="mt-1">
                <PriorityBadge priority={row.priority} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">{t("support.table.createdAt")}</dt>
              <dd className="mt-1 text-muted-foreground">
                {format(new Date(row.createdAt), "yyyy-MM-dd")}
              </dd>
            </div>
          </dl>

          {canManage ? (
            <div className="mt-4 flex justify-end border-t border-border pt-3">
              <RowActions row={row} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: SupportTicket["priority"] }) {
  const { t } = useTranslation();

  const variant =
    priority === "urgent"
      ? "danger"
      : priority === "high"
        ? "warning"
        : priority === "medium"
          ? "primary"
          : "muted";

  return <StatusBadge label={t(`support.priority.${priority}`)} variant={variant} />;
}

function RowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: SupportTicket;
  onEdit?: (row: SupportTicket) => void;
  onDelete?: (row: SupportTicket) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="inline-flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#1DA851]"
        aria-label={t("support.whatsapp.sendAction")}
        onClick={() => {
          const result = openSupportTicketWhatsApp(row, t);
          toast.success(whatsAppShareToastMessage(result, t));
        }}
      >
        <WhatsAppIcon />
      </Button>
      <Button variant="ghost" size="icon" aria-label={t("common.edit")} onClick={() => onEdit?.(row)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={t("common.delete")} onClick={() => onDelete?.(row)}>
        <Trash2 className="h-4 w-4 text-danger" />
      </Button>
    </div>
  );
}
