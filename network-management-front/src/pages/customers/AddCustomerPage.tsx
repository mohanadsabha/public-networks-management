import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";
import { Heading, Text } from "@/components/ui/typography";
import { AddSubscriberSuccessModal } from "@/components/pages/customers";
import { useCustomerMutations } from "@/hooks/useCustomers";
import { customerProfilePath } from "@/lib/routePaths";
import { FACILITY_TYPE_OPTIONS } from "@/lib/mocks/subscribers.mock";
import { ApiError } from "@/types/api";
import type { Customer } from "@/types/customer";

interface AddFormValues {
  fullName: string;
  facilityType: string;
  facilityTypeOther: string;
  phone: string;
  packageLine: number;
  balance: number;
  notes: string;
}

export function AddCustomerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createMutation } = useCustomerMutations();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddFormValues>({
    defaultValues: {
      fullName: "",
      facilityType: FACILITY_TYPE_OPTIONS[0],
      facilityTypeOther: "",
      phone: "",
      packageLine: 4,
      balance: 0,
      notes: "",
    },
  });

  const facilityType = watch("facilityType");
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);

  const onSubmit = async (values: AddFormValues) => {
    const resolvedFacility =
      values.facilityType === "أخرى" ? values.facilityTypeOther.trim() : values.facilityType;

    try {
      const created = await createMutation.mutateAsync({
        fullName: values.fullName.trim(),
        facilityType: resolvedFacility,
        phone: values.phone.trim(),
        lineId: String(values.packageLine),
        balance: Number.isFinite(values.balance) ? values.balance : 0,
        notes: values.notes.trim() || null,
      });
      toast.success(t("customers.form.createSuccess"));
      setCreatedCustomer(created);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  const handleAddAnother = () => {
    setCreatedCustomer(null);
    reset();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/customers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("customers.profile.backToList")}
      </Link>

      <div>
        <Heading as="h1">{t("customers.add.title")}</Heading>
        <Text muted className="mt-2">
          {t("customers.add.hint")}
        </Text>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6"
      >
        <Input
          label={t("customers.form.fullName")}
          error={errors.fullName?.message}
          {...register("fullName", { required: t("customers.form.fullNameRequired") })}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium">{t("customers.form.facilityType")}</label>
          <select
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
            error={errors.facilityTypeOther?.message}
            {...register("facilityTypeOther", {
              required: t("customers.form.facilityTypeOtherRequired"),
            })}
          />
        ) : null}

        <Input
          label={t("customers.form.phone")}
          dir="ltr"
          {...register("phone", { required: t("customers.form.fullNameRequired") })}
        />

        <Input
          label={t("customers.form.lineNumber")}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          error={errors.packageLine?.message}
          {...register("packageLine", {
            required: t("customers.form.lineNumberRequired"),
            valueAsNumber: true,
            min: { value: 1, message: t("customers.form.lineNumberRequired") },
          })}
        />

        <div>
          <Input
            label={t("customers.form.balance")}
            type="number"
            step="0.01"
            dir="ltr"
            error={errors.balance?.message}
            {...register("balance", {
              valueAsNumber: true,
              validate: (value) =>
                Number.isFinite(value) || t("customers.form.balanceInvalid"),
            })}
          />
          <Text muted className="mt-1.5 text-xs">
            {t("customers.form.balanceHint")}
          </Text>
        </div>

        <Textarea label={t("customers.form.notes")} rows={3} {...register("notes")} />

        <Button type="submit" isLoading={createMutation.isPending}>
          {t("customers.form.create")}
        </Button>
      </form>

      <AddSubscriberSuccessModal
        open={Boolean(createdCustomer)}
        customer={createdCustomer}
        onClose={() => {
          setCreatedCustomer(null);
          navigate("/customers");
        }}
        onAddAnother={handleAddAnother}
        onGoToProfile={(customer) => navigate(customerProfilePath(customer.lineId))}
      />
    </div>
  );
}
