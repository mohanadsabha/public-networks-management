import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Input, Textarea } from "@/components/ui/forms";
import { FACILITY_TYPE_OPTIONS } from "@/lib/mocks/subscribers.mock";
import type { Subscriber } from "@/types/subscriber";

export interface SubscriberFormValues {
  fullName: string;
  facilityType: string;
  facilityTypeOther: string;
  phone: string;
  packageLine: number;
  notes: string;
  /** List quick-edit only */
  monthlyPrice?: number;
  firstContactDate?: string;
}

interface SubscriberFormModalProps {
  open: boolean;
  mode: "edit";
  initial?: Subscriber;
  onClose: () => void;
  onSubmit: (values: SubscriberFormValues) => void;
  isSubmitting?: boolean;
}

export function SubscriberFormModal({
  open,
  initial,
  onClose,
  onSubmit,
  isSubmitting = false,
}: SubscriberFormModalProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubscriberFormValues>({
    defaultValues: {
      fullName: "",
      facilityType: FACILITY_TYPE_OPTIONS[0],
      facilityTypeOther: "",
      phone: "",
      packageLine: 4,
      notes: "",
      monthlyPrice: 120,
      firstContactDate: "",
    },
  });

  const facilityType = watch("facilityType");

  useEffect(() => {
    if (open && initial) {
      const isOther = !FACILITY_TYPE_OPTIONS.includes(
        initial.facilityType as (typeof FACILITY_TYPE_OPTIONS)[number],
      );
      reset({
        fullName: initial.fullName,
        facilityType: isOther ? "أخرى" : initial.facilityType,
        facilityTypeOther: isOther ? initial.facilityType : "",
        phone: initial.phone ?? "",
        packageLine: initial.packageLine,
        notes: initial.notes ?? "",
        monthlyPrice: initial.monthlyPrice,
        firstContactDate: initial.firstContactDate ?? "",
      });
    }
  }, [open, initial, reset]);

  const resolveFacility = (values: SubscriberFormValues) =>
    values.facilityType === "أخرى"
      ? values.facilityTypeOther.trim()
      : values.facilityType;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("subscribers.form.editTitle", { lineId: initial?.lineId ?? "" })}
      className="sm:max-w-xl"
    >
      <form
        onSubmit={handleSubmit((values) =>
          onSubmit({ ...values, facilityType: resolveFacility(values) }),
        )}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("subscribers.form.fullName")}
            {...register("fullName", { required: t("subscribers.form.fullNameRequired") })}
            error={errors.fullName?.message}
          />
          <Input
            label={t("subscribers.form.phone")}
            {...register("phone")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("subscribers.form.facilityType")}</label>
            <select
              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              {...register("facilityType")}
            >
              {FACILITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <Input
            label={t("subscribers.form.lineNumber")}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            error={errors.packageLine?.message}
            {...register("packageLine", {
              required: t("subscribers.form.lineNumberRequired"),
              valueAsNumber: true,
              min: { value: 1, message: t("subscribers.form.lineNumberRequired") },
            })}
          />
        </div>

        {facilityType === "أخرى" ? (
          <Input
            label={t("subscribers.form.facilityTypeOther")}
            {...register("facilityTypeOther", {
              required: t("subscribers.form.facilityTypeOtherRequired"),
            })}
            error={errors.facilityTypeOther?.message}
          />
        ) : null}

        <Textarea label={t("subscribers.form.notes")} rows={3} {...register("notes")} />

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <ModalFooterButton variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton type="submit" isLoading={isSubmitting}>
            {t("common.save")}
          </ModalFooterButton>
        </div>
      </form>
    </Modal>
  );
}
