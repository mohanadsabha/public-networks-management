import { CheckCircle2, Hash, MessageSquare, Phone, Send, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SmsTemplatePicker } from "@/components/pages/sms/SmsTemplatePicker";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import { Button } from "@/components/ui/buttons";
import { useSendSmsMutation, useSmsTemplatesQuery } from "@/hooks/useSms";
import {
  applySmsTemplateVariables,
  findWelcomeSmsTemplate,
  SMS_MAX_LENGTH,
} from "@/lib/smsUtils";
import { cn } from "@/lib/cn";
import { ApiError } from "@/types/api";
import type { Customer } from "@/types/customer";
import type { SmsTemplate } from "@/types/sms";

interface AddSubscriberSuccessModalProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onAddAnother: () => void;
  onGoToProfile: (customer: Customer) => void;
}

export function AddSubscriberSuccessModal({
  open,
  customer,
  onClose,
  onAddAnother,
  onGoToProfile,
}: AddSubscriberSuccessModalProps) {
  const { t } = useTranslation();
  const sendMutation = useSendSmsMutation();
  const templatesQuery = useSmsTemplatesQuery();
  const templates = templatesQuery.data ?? [];
  const [message, setMessage] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const phone = customer?.phone?.trim() ?? "";

  const templateVars = customer
    ? {
        name: customer.fullName,
        fullName: customer.fullName,
        lineId: customer.lineId,
        phone: customer.phone ?? "",
      }
    : null;

  useEffect(() => {
    if (!open || !customer) return;
    setSent(false);

    const welcomeTemplate = findWelcomeSmsTemplate(templates);
    const initialTemplate = welcomeTemplate ?? templates[0];

    if (initialTemplate) {
      setActiveTemplateId(initialTemplate.id);
      setMessage(applySmsTemplateVariables(initialTemplate.body, templateVars!));
      return;
    }

    setActiveTemplateId(null);
    setMessage(
      t("customers.successModal.welcomeDefault", {
        name: customer.fullName,
        lineId: customer.lineId,
      }),
    );
  }, [open, customer, templates, t]);

  if (!customer) return null;

  const trimmed = message.trim();
  const canSend = Boolean(phone) && trimmed.length > 0 && trimmed.length <= SMS_MAX_LENGTH;

  const handleTemplateChange = (template: SmsTemplate) => {
    setActiveTemplateId(template.id);
    setMessage(applySmsTemplateVariables(template.body, templateVars!));
    setSent(false);
  };

  const handleSend = async () => {
    if (!canSend) return;
    try {
      const result = await sendMutation.mutateAsync({
        recipientType: "subscribers",
        subscriberIds: [customer.id],
        phones: [phone],
        message: trimmed,
        templateId: activeTemplateId ?? undefined,
      });
      if (result.failedCount > 0) {
        toast.warning(
          t("sms.toast.partial", { sent: result.sentCount, failed: result.failedCount }),
        );
      } else {
        toast.success(t("customers.successModal.sendSuccess"));
        setSent(true);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("customers.successModal.title")}
      closeLabel={t("common.close")}
      footer={
        <>
          <ModalFooterButton variant="outline" onClick={onAddAnother}>
            {t("customers.successModal.addAnother")}
          </ModalFooterButton>
          <ModalFooterButton variant="primary" onClick={() => onGoToProfile(customer)}>
            {t("customers.successModal.goToProfile")}
          </ModalFooterButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </div>
          <div>
            <Text className="text-base font-semibold">{t("customers.successModal.title")}</Text>
            <Text muted className="mt-1 text-sm">
              {t("customers.successModal.subtitle")}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-muted/20 p-3 sm:grid-cols-3">
          <InfoCell icon={User} label={t("customers.successModal.nameLabel")} value={customer.fullName} />
          <InfoCell icon={Hash} label={t("customers.successModal.lineIdLabel")} value={customer.lineId} ltr />
          <InfoCell
            icon={Phone}
            label={t("customers.successModal.phoneLabel")}
            value={phone || t("customers.successModal.noPhone")}
            ltr={Boolean(phone)}
            muted={!phone}
          />
        </div>

        <div className="space-y-3 rounded-xl border border-border/70 bg-surface p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" aria-hidden />
            <Text className="text-sm font-semibold">{t("customers.successModal.welcomeLabel")}</Text>
          </div>

          {!phone ? (
            <Text muted className="text-sm">
              {t("customers.successModal.noPhoneHint")}
            </Text>
          ) : (
            <>
              <SmsTemplatePicker
                templates={templates}
                activeTemplateId={activeTemplateId}
                onTemplateChange={handleTemplateChange}
              />

              <div className="flex items-center justify-end">
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    message.length > SMS_MAX_LENGTH ? "text-danger" : "text-muted-foreground",
                  )}
                >
                  {message.length} / {SMS_MAX_LENGTH}
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={SMS_MAX_LENGTH}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setSent(false);
                }}
                placeholder={t("sms.compose.messagePlaceholder")}
                className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border"
              />
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSend}
                  isLoading={sendMutation.isPending}
                  disabled={!canSend || sent}
                  variant={sent ? "outline" : "primary"}
                >
                  {sent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      {t("customers.successModal.sentLabel")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("customers.successModal.sendWelcome")}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface InfoCellProps {
  icon: typeof User;
  label: string;
  value: string;
  ltr?: boolean;
  muted?: boolean;
}

function InfoCell({ icon: Icon, label, value, ltr, muted }: InfoCellProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <Text className="text-[11px] font-medium text-muted-foreground">{label}</Text>
        <Text
          dir={ltr ? "ltr" : undefined}
          className={cn("truncate text-sm font-medium", muted && "text-muted-foreground")}
        >
          {value}
        </Text>
      </div>
    </div>
  );
}
