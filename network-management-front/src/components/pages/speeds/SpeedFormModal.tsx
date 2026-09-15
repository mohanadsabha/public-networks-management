import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Input } from "@/components/ui/forms";
import { getFairUsageGbForSpeed } from "@/lib/speedFairUsage";
import type { SpeedTier } from "@/types/speeds";

export interface SpeedFormValues {
  valueMbps: number;
  price: number;
  fairUsageGb: number | null;
}

interface SpeedFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  initialTier?: SpeedTier;
  onClose: () => void;
  onSubmit: (values: SpeedFormValues) => void;
  isSubmitting?: boolean;
}

export function SpeedFormModal({
  open,
  mode,
  initialTier,
  onClose,
  onSubmit,
  isSubmitting = false,
}: SpeedFormModalProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SpeedFormValues>({
    defaultValues: {
      valueMbps: initialTier?.valueMbps ?? undefined,
      price: initialTier?.price ?? undefined,
      fairUsageGb: initialTier?.fairUsageGb ?? null,
    },
  });

  const title =
    mode === "add" ? t("speeds.form.addTitle") : t("speeds.form.editTitle", { speed: initialTier?.label ?? "" });

  useEffect(() => {
    if (open) {
      reset({
        valueMbps: initialTier?.valueMbps ?? undefined,
        price: initialTier?.price ?? undefined,
        fairUsageGb:
          initialTier?.fairUsageGb ??
          (initialTier
            ? getFairUsageGbForSpeed(initialTier.valueMbps, initialTier.id)
            : null),
      });
    }
  }, [open, initialTier, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = (values: SpeedFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      closeLabel={t("common.cancel")}
      footer={
        <>
          <ModalFooterButton variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton
            type="submit"
            form="speed-form"
            isLoading={isSubmitting}
          >
            {mode === "add" ? t("speeds.form.create") : t("common.save")}
          </ModalFooterButton>
        </>
      }
    >
      <form id="speed-form" onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input
          label={t("speeds.form.valueMbps")}
          type="number"
          min={1}
          step={1}
          placeholder={t("speeds.form.valueMbpsPlaceholder")}
          error={errors.valueMbps?.message}
          {...register("valueMbps", {
            required: t("speeds.form.valueMbpsRequired"),
            valueAsNumber: true,
            min: { value: 1, message: t("speeds.form.valueMbpsMin") },
          })}
        />

        <Input
          label={t("speeds.form.price")}
          type="number"
          min={0}
          step={1}
          placeholder={t("speeds.form.pricePlaceholder")}
          error={errors.price?.message}
          {...register("price", {
            required: t("speeds.form.priceRequired"),
            valueAsNumber: true,
            min: { value: 0, message: t("speeds.form.priceMin") },
          })}
        />

        <Input
          label={t("speeds.form.fairUsageGb")}
          type="number"
          min={1}
          step={1}
          placeholder={t("speeds.form.fairUsageGbPlaceholder")}
          error={errors.fairUsageGb?.message}
          {...register("fairUsageGb", {
            setValueAs: (value) => {
              if (value === "" || value == null) return null;
              const parsed = Number(value);
              return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
            },
            min: { value: 1, message: t("speeds.form.fairUsageGbMin") },
          })}
        />

        <p className="text-xs text-muted-foreground">{t("speeds.form.fairUsageGbHint")}</p>
        <p className="text-xs text-muted-foreground">{t("speeds.form.hint")}</p>
      </form>
    </Modal>
  );
}
