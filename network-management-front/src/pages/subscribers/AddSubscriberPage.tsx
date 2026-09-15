import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";
import { Heading, Text } from "@/components/ui/typography";
import { FACILITY_TYPE_OPTIONS } from "@/lib/mocks/subscribers.mock";

interface AddFormValues {
  fullName: string;
  facilityType: string;
  facilityTypeOther: string;
  phone: string;
  packageLine: number;
  notes: string;
  username: string;
  password: string;
}

export function AddSubscriberPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const withUsername = params.get("withUsername") === "1";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddFormValues>({
    defaultValues: {
      fullName: "",
      facilityType: FACILITY_TYPE_OPTIONS[0],
      facilityTypeOther: "",
      phone: "",
      packageLine: 4,
      notes: "",
      username: "",
      password: "",
    },
  });

  const facilityType = watch("facilityType");

  const onSubmit = async (_values: AddFormValues) => {
    await new Promise((r) => setTimeout(r, 400));
    toast.success(t("subscribers.form.createSuccess"));
    navigate("/subscribers");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/subscribers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("subscribers.profile.backToList")}
      </Link>

      <div>
        <Heading as="h1">
          {withUsername
            ? t("subscribers.add.withUsernameTitle")
            : t("subscribers.add.withoutUsernameTitle")}
        </Heading>
        <Text muted className="mt-2">
          {withUsername ? t("subscribers.add.withUsernameHint") : t("subscribers.add.withoutUsernameHint")}
        </Text>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6"
      >
        <Input
          label={t("subscribers.form.fullName")}
          {...register("fullName", { required: t("subscribers.form.fullNameRequired") })}
          error={errors.fullName?.message}
        />

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
          {facilityType === "أخرى" ? (
            <Input
              label={t("subscribers.form.facilityTypeOther")}
              {...register("facilityTypeOther", {
                required: t("subscribers.form.facilityTypeOtherRequired"),
              })}
              error={errors.facilityTypeOther?.message}
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t("subscribers.form.phone")} {...register("phone")} />
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

        {withUsername ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("subscribers.table.username")}
              {...register("username", { required: t("subscribers.add.usernameRequired") })}
              error={errors.username?.message}
            />
            <Input
              label={t("subscribers.table.password")}
              {...register("password", { required: t("subscribers.add.passwordRequired") })}
              error={errors.password?.message}
            />
          </div>
        ) : null}

        <Textarea label={t("subscribers.form.notes")} rows={3} {...register("notes")} />

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" type="button" onClick={() => navigate("/subscribers")}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t("subscribers.form.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}
