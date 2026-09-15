import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import { useSmsTemplateMutations } from "@/hooks/useSms";
import { SMS_MAX_LENGTH } from "@/lib/smsUtils";
import { ApiError } from "@/types/api";
import type { SmsTemplate } from "@/types/sms";

interface TemplateFormValues {
  name: string;
  body: string;
}

interface SmsTemplatesPanelProps {
  templates: SmsTemplate[];
  canManage?: boolean;
  isLoading?: boolean;
}

export function SmsTemplatesPanel({ templates, canManage = false, isLoading = false }: SmsTemplatesPanelProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { createMutation, deleteMutation } = useSmsTemplateMutations();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    defaultValues: { name: "", body: "" },
  });

  const bodyLength = watch("body")?.length ?? 0;

  const showError = (err: unknown) => {
    toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
  };

  const onSubmit = async (values: TemplateFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        body: values.body.trim(),
      });
      toast.success(t("sms.templatesPanel.createSuccess"));
      reset();
      setOpen(false);
    } catch (err) {
      showError(err);
    }
  };

  const handleDelete = async (template: SmsTemplate) => {
    try {
      await deleteMutation.mutateAsync(template.id);
      toast.success(t("sms.templatesPanel.deleteSuccess"));
    } catch (err) {
      showError(err);
    }
  };

  if (isLoading) {
    return <Text muted>{t("common.loading")}</Text>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Text className="text-sm font-semibold">{t("sms.templatesPanel.title")}</Text>
          <Text muted className="mt-1 text-sm">{t("sms.templatesPanel.subtitle")}</Text>
        </div>
        {canManage ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("sms.templatesPanel.add")}
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        {templates.map((template) => (
          <article
            key={template.id}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Text className="text-sm font-semibold">{template.name}</Text>
                  {template.isSystem ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {t("sms.templatesPanel.system")}
                    </span>
                  ) : null}
                </div>
                <Text muted className="mt-2 whitespace-pre-wrap text-sm">{template.body}</Text>
                {!template.isSystem && template.createdByUsername ? (
                  <Text muted className="mt-2 text-xs">
                    {t("sms.templatesPanel.createdBy", { user: template.createdByUsername })}
                  </Text>
                ) : null}
              </div>
              {canManage ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(template)}
                  aria-label={t("common.delete")}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t("sms.templatesPanel.addTitle")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("sms.templatesPanel.nameLabel")}
            error={errors.name?.message}
            {...register("name", { required: t("sms.templatesPanel.nameRequired") })}
          />
          <div className="space-y-1">
            <Textarea
              label={t("sms.templatesPanel.bodyLabel")}
              rows={4}
              maxLength={SMS_MAX_LENGTH}
              error={errors.body?.message}
              {...register("body", {
                required: t("sms.templatesPanel.bodyRequired"),
                maxLength: { value: SMS_MAX_LENGTH, message: t("sms.charLimit") },
              })}
            />
            <Text muted className="text-xs">
              {bodyLength} / {SMS_MAX_LENGTH}
            </Text>
          </div>
          <div className="flex justify-end gap-2">
            <ModalFooterButton variant="outline" type="button" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </ModalFooterButton>
            <ModalFooterButton type="submit" isLoading={createMutation.isPending}>
              {t("sms.templatesPanel.save")}
            </ModalFooterButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
