import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/forms";
import { Text } from "@/components/ui/typography";
import {
  USERNAME_CHANGE_CAUSE_TEMPLATES,
  type UsernameChangeCauseTemplate,
} from "@/lib/usernameChangeCause";
import { cn } from "@/lib/cn";

interface UsernameChangeCauseFieldProps {
  template: UsernameChangeCauseTemplate;
  customText: string;
  onTemplateChange: (template: UsernameChangeCauseTemplate) => void;
  onCustomTextChange: (text: string) => void;
  error?: string;
  className?: string;
}

export function UsernameChangeCauseField({
  template,
  customText,
  onTemplateChange,
  onCustomTextChange,
  error,
  className,
}: UsernameChangeCauseFieldProps) {
  const { t } = useTranslation();

  const templateLabels = useMemo(
    () =>
      Object.fromEntries(
        USERNAME_CHANGE_CAUSE_TEMPLATES.map((key) => [
          key,
          t(`subscribers.username.changeCauseTemplates.${key}`),
        ]),
      ) as Record<UsernameChangeCauseTemplate, string>,
    [t],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <Text className="text-sm font-medium">{t("subscribers.username.changeCauseTitle")}</Text>
        <Text muted className="mt-1 text-xs">
          {t("subscribers.username.changeCauseHint")}
        </Text>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {USERNAME_CHANGE_CAUSE_TEMPLATES.map((key) => {
          const selected = template === key;
          return (
            <label
              key={key}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40",
              )}
            >
              <input
                type="radio"
                name="username-change-cause"
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
                checked={selected}
                onChange={() => onTemplateChange(key)}
              />
              <span className="text-sm leading-snug text-foreground">{templateLabels[key]}</span>
            </label>
          );
        })}
      </div>

      {template === "other" ? (
        <Textarea
          rows={3}
          value={customText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder={t("subscribers.username.changeCausePlaceholder")}
          error={error}
        />
      ) : error ? (
        <Text className="text-xs text-danger">{error}</Text>
      ) : null}
    </div>
  );
}
