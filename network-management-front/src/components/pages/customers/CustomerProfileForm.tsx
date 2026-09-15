import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";
import { ProfileSection } from "@/components/ui/profile";
import { Text } from "@/components/ui/typography";
import { FACILITY_TYPE_OPTIONS } from "@/lib/mocks/subscribers.mock";
import type { Customer } from "@/types/customer";

export interface CustomerProfileFormValues {
  fullName: string;
  facilityType: string;
  facilityTypeOther: string;
  phone: string;
  packageLine: number;
  notes: string;
}

interface CustomerProfileFormProps {
  customer: Customer;
  canManage?: boolean;
  onSave: (values: CustomerProfileFormValues) => void;
  isSubmitting?: boolean;
}

export function CustomerProfileForm({
  customer,
  canManage = false,
  onSave,
  isSubmitting = false,
}: CustomerProfileFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CustomerProfileFormValues>({
    defaultValues: {
      fullName: customer.fullName,
      facilityType: customer.facilityType,
      facilityTypeOther: "",
      phone: customer.phone ?? "",
      packageLine: customer.packageLine,
      notes: customer.notes ?? "",
    },
  });

  const facilityType = watch("facilityType");

  useEffect(() => {
    reset({
      fullName: customer.fullName,
      facilityType: customer.facilityType,
      facilityTypeOther: "",
      phone: customer.phone ?? "",
      packageLine: customer.packageLine,
      notes: customer.notes ?? "",
    });
  }, [customer, reset]);

  return (
    <ProfileSection title={t("customers.profile.detailsSection")}>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Input
          label={t("customers.form.fullName")}
          disabled={!canManage}
          error={errors.fullName?.message}
          {...register("fullName", { required: t("customers.form.fullNameRequired") })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("customers.form.facilityType")}</label>
            <select
              disabled={!canManage}
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
              {...register("facilityType")}
            >
              {FACILITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {facilityType === "أخرى" ? (
            <Input
              label={t("customers.form.facilityTypeOther")}
              disabled={!canManage}
              {...register("facilityTypeOther", {
                required: t("customers.form.facilityTypeOtherRequired"),
              })}
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("customers.form.phone")} disabled={!canManage} dir="ltr" {...register("phone")} />
          <div>
            <Input
              label={t("customers.form.lineNumber")}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              disabled={!canManage}
              error={errors.packageLine?.message}
              {...register("packageLine", {
                required: t("customers.form.lineNumberRequired"),
                valueAsNumber: true,
                min: { value: 1, message: t("customers.form.lineNumberRequired") },
              })}
            />
            <Text muted className="mt-1.5 text-xs" dir="ltr">
              {t("customers.form.subscriberId")}: {customer.lineId}
            </Text>
          </div>
        </div>

        <Textarea label={t("customers.form.notes")} disabled={!canManage} rows={3} {...register("notes")} />

        {canManage ? (
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            {t("customers.form.saveProfile")}
          </Button>
        ) : null}
      </form>
    </ProfileSection>
  );
}
