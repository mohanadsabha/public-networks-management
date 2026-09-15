import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/forms";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import type { UsernameHistoryEntry } from "@/types/subscriber";

export interface UsernameHistoryFormValues {
  oldUsername: string;
  oldPassword: string;
  usageStartDate: string;
  usageEndDate: string;
}

interface UsernameHistoryFormModalProps {
  open: boolean;
  onClose: () => void;
  entry?: UsernameHistoryEntry | null;
  onSubmit: (values: UsernameHistoryFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function UsernameHistoryFormModal({
  open,
  onClose,
  entry,
  onSubmit,
  isSubmitting = false,
}: UsernameHistoryFormModalProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(entry);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsernameHistoryFormValues>({
    defaultValues: {
      oldUsername: "",
      oldPassword: "",
      usageStartDate: "",
      usageEndDate: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      oldUsername: entry?.oldUsername ?? "",
      oldPassword: entry?.oldPassword ?? "",
      usageStartDate: toDateInput(entry?.usageStartDate ?? null),
      usageEndDate: toDateInput(entry?.usageEndDate ?? null),
    });
  }, [open, entry, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("subscribers.username.historyEditTitle") : t("subscribers.username.historyAddTitle")}
    >
      <form
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          onClose();
        })}
        className="space-y-4"
      >
        <Text muted className="text-sm">
          {isEdit ? t("subscribers.username.historyEditHint") : t("subscribers.username.historyAddHint")}
        </Text>

        <Input
          label={t("subscribers.table.username")}
          dir="ltr"
          error={errors.oldUsername?.message}
          {...register("oldUsername", { required: t("subscribers.username.historyUsernameRequired") })}
        />

        <Input
          label={t("subscribers.table.password")}
          dir="ltr"
          {...register("oldPassword")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("subscribers.username.usageStart")}
            type="date"
            {...register("usageStartDate")}
          />
          <Input
            label={t("subscribers.username.usageEnd")}
            type="date"
            {...register("usageEndDate")}
          />
        </div>

        <div className="flex justify-end gap-2">
          <ModalFooterButton variant="outline" type="button" onClick={onClose}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton type="submit" isLoading={isSubmitting}>
            {isEdit ? t("common.save") : t("subscribers.username.historyAdd")}
          </ModalFooterButton>
        </div>
      </form>
    </Modal>
  );
}
