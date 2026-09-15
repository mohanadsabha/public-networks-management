import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { PasswordInput } from "@/components/ui/forms";
import { Heading, Text } from "@/components/ui/typography";
import { authService } from "@/services/auth.service";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/cn";
import { AuthBackLink } from "./AuthBackLink";

const MIN_PASSWORD_LENGTH = 8;

interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFormProps {
  token: string;
  className?: string;
}

export function ResetPasswordForm({ token, className }: ResetPasswordFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = watch("password");

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      const response = await authService.resetPassword({
        token,
        password: values.password,
      });

      if (response.success) {
        toast.success(t("auth.resetPassword.success"));
        navigate("/login", { replace: true });
      } else {
        toast.error(response.message ?? t("auth.resetPassword.error"));
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t("auth.resetPassword.error");
      toast.error(message);
    }
  };

  const headingAlign = "text-center lg:text-start";

  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("space-y-1.5", headingAlign)}>
        <Heading as="h1">{t("auth.resetPassword.title")}</Heading>
        <Text muted>{t("auth.resetPassword.subtitle")}</Text>
      </div>

      <form
        key={i18n.language}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <PasswordInput
          label={t("auth.resetPassword.newPassword")}
          placeholder={t("auth.resetPassword.newPasswordPlaceholder")}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password", {
            required: t("auth.resetPassword.passwordRequired"),
            minLength: {
              value: MIN_PASSWORD_LENGTH,
              message: t("auth.resetPassword.passwordMinLength"),
            },
          })}
        />

        <PasswordInput
          label={t("auth.resetPassword.confirmPassword")}
          placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: t("auth.resetPassword.confirmPasswordRequired"),
            validate: (value) =>
              value === password || t("auth.resetPassword.passwordMismatch"),
          })}
        />

        <Button type="submit" size="lg" className="mt-2 w-full" isLoading={isSubmitting}>
          {t("auth.resetPassword.submit")}
        </Button>
      </form>

      <AuthBackLink />
    </div>
  );
}

interface InvalidResetTokenProps {
  className?: string;
}

export function InvalidResetToken({ className }: InvalidResetTokenProps) {
  const { t } = useTranslation();
  const headingAlign = "text-center lg:text-start";

  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("space-y-1.5", headingAlign)}>
        <Heading as="h1">{t("auth.resetPassword.invalidTokenTitle")}</Heading>
        <Text muted>{t("auth.resetPassword.invalidTokenMessage")}</Text>
      </div>

      <Link
        to="/forgot-password"
        className="inline-flex text-sm font-medium text-primary hover:text-primary-hover"
      >
        {t("auth.resetPassword.requestNewLink")}
      </Link>

      <AuthBackLink />
    </div>
  );
}
