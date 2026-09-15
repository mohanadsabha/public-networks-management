import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Text } from "@/components/ui/typography";
import { smsPath } from "@/lib/routePaths";
import { cn } from "@/lib/cn";
import type { SmsTemplate } from "@/types/sms";

interface SmsTemplatePickerProps {
  templates: SmsTemplate[];
  activeTemplateId: number | null;
  onTemplateChange: (template: SmsTemplate) => void;
  showManageLink?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function SmsTemplatePicker({
  templates,
  activeTemplateId,
  onTemplateChange,
  showManageLink = true,
  emptyMessage,
  className,
}: SmsTemplatePickerProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("sms.compose.templatesLabel")}
        </Text>
        {showManageLink ? (
          <Link to={smsPath("templates")} className="text-xs font-medium text-primary hover:underline">
            {t("sms.compose.manageTemplates")}
          </Link>
        ) : null}
      </div>

      {templates.length === 0 ? (
        <Text muted className="text-sm">
          {emptyMessage ?? t("subscribers.profile.sms.noTemplates")}
        </Text>
      ) : (
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onTemplateChange(template)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeTemplateId === template.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 text-foreground/80 hover:border-primary/40 hover:text-foreground",
              )}
            >
              {template.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
