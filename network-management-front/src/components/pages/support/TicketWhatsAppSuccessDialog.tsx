import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/pages/support/WhatsAppIcon";
import { Button } from "@/components/ui/buttons";
import { Modal } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import {
  buildSupportTicketWhatsAppMessage,
  getWhatsAppGroupName,
  openSupportTicketWhatsApp,
  whatsAppShareToastMessage,
} from "@/lib/supportWhatsApp";
import type { SupportTicket } from "@/types/supportTicket";

interface TicketWhatsAppSuccessDialogProps {
  ticket: SupportTicket | null;
  onClose: () => void;
}

export function TicketWhatsAppSuccessDialog({ ticket, onClose }: TicketWhatsAppSuccessDialogProps) {
  const { t } = useTranslation();

  if (!ticket) return null;

  const preview = buildSupportTicketWhatsAppMessage(ticket, t);
  const groupName = getWhatsAppGroupName();

  const sendLabel = groupName
    ? t("support.whatsapp.sendToGroupNamed", { group: groupName })
    : t("support.whatsapp.sendToGroup");

  return (
    <Modal
      open={Boolean(ticket)}
      onClose={onClose}
      title={t("support.whatsapp.successTitle")}
      className="sm:max-w-lg"
    >
      <div className="space-y-5 text-center sm:text-start">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-7 w-7" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <Text muted className="text-sm">
              {t("support.whatsapp.successSubtitle", { ticket: ticket.ticketNumber })}
            </Text>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 text-start">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("support.whatsapp.previewLabel")}
          </p>
          <pre
            dir="auto"
            className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground"
          >
            {preview}
          </pre>
        </div>

        <Text muted className="text-xs">
          {groupName
            ? t("support.whatsapp.openHintGroupNamed", { group: groupName })
            : t("support.whatsapp.openHint")}
        </Text>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            className="gap-2 bg-[#25D366] text-white hover:bg-[#20BD5A]"
            onClick={() => {
              const result = openSupportTicketWhatsApp(ticket, t);
              toast.success(whatsAppShareToastMessage(result, t));
              onClose();
            }}
          >
            <WhatsAppIcon className="h-5 w-5" />
            {sendLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
