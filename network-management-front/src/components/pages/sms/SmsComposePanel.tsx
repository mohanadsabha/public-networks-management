import { Lightbulb, Send, Signal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { Text } from "@/components/ui/typography";
import { SMS_MAX_LENGTH } from "@/lib/smsUtils";
import { cn } from "@/lib/cn";
import type { SmsRecipientMode, SmsTemplate } from "@/types/sms";
import { SmsTemplatePicker } from "./SmsTemplatePicker";

interface SmsComposePanelProps {
  recipientMode: SmsRecipientMode;
  message: string;
  onMessageChange: (value: string) => void;
  templates: SmsTemplate[];
  activeTemplateId: number | null;
  onTemplateChange: (template: SmsTemplate) => void;
  customPhone: string;
  onCustomPhoneChange: (value: string) => void;
  recipientCount: number;
  groupName?: string | null;
  onSend: () => void;
  isSending?: boolean;
  canSend?: boolean;
  className?: string;
}

export function SmsComposePanel({
  recipientMode,
  message,
  onMessageChange,
  templates,
  activeTemplateId,
  onTemplateChange,
  customPhone,
  onCustomPhoneChange,
  recipientCount,
  groupName = null,
  onSend,
  isSending = false,
  canSend = true,
  className,
}: SmsComposePanelProps) {
  const { t } = useTranslation();
  const charCount = message.length;

  return (
    <div className={cn("space-y-5 lg:sticky lg:top-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-gradient-to-r from-primary/5 via-surface to-surface px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Signal className="h-4 w-4 text-primary" />
          <span>{t("sms.provider")}</span>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {t("sms.charLimit")}
        </span>
      </div>

      <div className="rounded-2xl border border-border/70 bg-surface p-5 shadow-sm ring-1 ring-border/40">
        <Text className="text-base font-semibold">{t("sms.compose.title")}</Text>

        {recipientMode === "custom" ? (
          <div className="mt-4 space-y-1.5">
            <label htmlFor="sms-custom-phone" className="text-sm font-medium">
              {t("sms.compose.customPhoneLabel")}
            </label>
            <input
              id="sms-custom-phone"
              type="tel"
              value={customPhone}
              onChange={(e) => onCustomPhoneChange(e.target.value)}
              placeholder={t("sms.compose.customPhonePlaceholder")}
              className="flex h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15"
              dir="ltr"
            />
            <Text muted className="text-xs">{t("sms.compose.customPhoneHint")}</Text>
          </div>
        ) : recipientMode === "groups" ? (
          <Text muted className="mt-2 text-sm">
            {groupName
              ? t("sms.compose.previewGroup", { name: groupName, count: recipientCount })
              : t("sms.compose.previewRecipients", { count: recipientCount })}
          </Text>
        ) : (
          <Text muted className="mt-2 text-sm">
            {t("sms.compose.previewRecipients", { count: recipientCount })}
          </Text>
        )}

        <SmsTemplatePicker
          templates={templates}
          activeTemplateId={activeTemplateId}
          onTemplateChange={onTemplateChange}
        />

        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="sms-message" className="text-sm font-medium">
              {t("sms.compose.messageLabel")}
            </label>
            <span
              className={cn(
                "text-xs tabular-nums",
                charCount > SMS_MAX_LENGTH ? "text-danger" : "text-muted-foreground",
              )}
            >
              {charCount} / {SMS_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="sms-message"
            rows={6}
            maxLength={SMS_MAX_LENGTH}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={t("sms.compose.messagePlaceholder")}
            className="w-full resize-y rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button onClick={onSend} isLoading={isSending} disabled={!canSend || isSending} size="sm">
            <Send className="h-4 w-4" />
            {isSending ? t("sms.compose.sending") : t("sms.compose.send")}
          </Button>
        </div>
      </div>

      <aside className="rounded-2xl border border-border/60 bg-muted/15 p-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" />
          <Text className="text-sm font-semibold">{t("sms.tips.title")}</Text>
        </div>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
          <li>{t("sms.tips.item1")}</li>
          <li>{t("sms.tips.item2")}</li>
          <li>{t("sms.tips.item3")}</li>
        </ul>
        <Text muted className="mt-3 text-xs">{t("sms.tips.note")}</Text>
      </aside>
    </div>
  );
}
