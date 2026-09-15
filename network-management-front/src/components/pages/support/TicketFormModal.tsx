import { useEffect, type SelectHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Input, Textarea } from "@/components/ui/forms";
import type {
  SupportTicket,
  TicketChannel,
  TicketPriority,
  TicketStatus,
} from "@/types/supportTicket";

export interface TicketFormValues {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  subscriberName: string;
  subscriberPhone: string;
  assignedTo: string;
}

interface TicketFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialTicket?: SupportTicket;
  prefill?: Partial<Pick<TicketFormValues, "subscriberName" | "subscriberPhone">>;
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => void;
  isSubmitting?: boolean;
}

const STATUS_OPTIONS: TicketStatus[] = ["open", "in_progress", "waiting_customer", "resolved"];
const PRIORITY_OPTIONS: TicketPriority[] = ["low", "medium", "high", "urgent"];
const CHANNEL_OPTIONS: TicketChannel[] = ["phone", "visit", "whatsapp", "other"];

export function TicketFormModal({
  open,
  mode,
  initialTicket,
  prefill,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TicketFormModalProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormValues>({
    defaultValues: {
      title: initialTicket?.title ?? "",
      description: initialTicket?.description ?? "",
      status: initialTicket?.status ?? "open",
      priority: initialTicket?.priority ?? "medium",
      channel: initialTicket?.channel ?? "phone",
      subscriberName: initialTicket?.subscriberName ?? "",
      subscriberPhone: initialTicket?.subscriberPhone ?? "",
      assignedTo: initialTicket?.assignedTo ?? "",
    },
  });

  const title =
    mode === "add"
      ? t("support.form.addTitle")
      : t("support.form.editTitle", { ticket: initialTicket?.ticketNumber ?? "" });

  useEffect(() => {
    if (open) {
      reset({
        title: initialTicket?.title ?? "",
        description: initialTicket?.description ?? "",
        status: initialTicket?.status ?? "open",
        priority: initialTicket?.priority ?? "medium",
        channel: initialTicket?.channel ?? "phone",
        subscriberName: initialTicket?.subscriberName ?? prefill?.subscriberName ?? "",
        subscriberPhone: initialTicket?.subscriberPhone ?? prefill?.subscriberPhone ?? "",
        assignedTo: initialTicket?.assignedTo ?? "Unassigned",
      });
    }
  }, [open, initialTicket, prefill, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      closeLabel={t("common.cancel")}
      className="sm:max-w-xl"
      footer={
        <>
          <ModalFooterButton variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton type="submit" form="support-ticket-form" isLoading={isSubmitting}>
            {mode === "add" ? t("support.form.create") : t("common.save")}
          </ModalFooterButton>
        </>
      }
    >
      <form id="support-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t("support.form.title")}
          placeholder={t("support.form.titlePlaceholder")}
          error={errors.title?.message}
          {...register("title", { required: t("support.form.titleRequired") })}
        />

        <Textarea
          label={t("support.form.description")}
          placeholder={t("support.form.descriptionPlaceholder")}
          error={errors.description?.message}
          {...register("description", { required: t("support.form.descriptionRequired") })}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            label={t("support.form.status")}
            error={errors.status?.message}
            options={STATUS_OPTIONS.map((value) => ({
              value,
              label: t(`support.status.${value}`),
            }))}
            {...register("status", { required: true })}
          />
          <SelectField
            label={t("support.form.priority")}
            error={errors.priority?.message}
            options={PRIORITY_OPTIONS.map((value) => ({
              value,
              label: t(`support.priority.${value}`),
            }))}
            {...register("priority", { required: true })}
          />
          <SelectField
            label={t("support.form.channel")}
            error={errors.channel?.message}
            options={CHANNEL_OPTIONS.map((value) => ({
              value,
              label: t(`support.channel.${value}`),
            }))}
            {...register("channel", { required: true })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t("support.form.subscriberName")}
            placeholder={t("support.form.subscriberNamePlaceholder")}
            error={errors.subscriberName?.message}
            {...register("subscriberName", { required: t("support.form.subscriberNameRequired") })}
          />
          <Input
            label={t("support.form.subscriberPhone")}
            placeholder={t("support.form.subscriberPhonePlaceholder")}
            error={errors.subscriberPhone?.message}
            {...register("subscriberPhone", { required: t("support.form.subscriberPhoneRequired") })}
          />
        </div>

        <Input
          label={t("support.form.assignedTo")}
          placeholder={t("support.form.assignedToPlaceholder")}
          error={errors.assignedTo?.message}
          {...register("assignedTo", { required: t("support.form.assignedToRequired") })}
        />

        <p className="text-xs text-muted-foreground">{t("support.form.hint")}</p>
      </form>
    </Modal>
  );
}

function SelectField({
  label,
  error,
  options,
  ...props
}: {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <select
        className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
