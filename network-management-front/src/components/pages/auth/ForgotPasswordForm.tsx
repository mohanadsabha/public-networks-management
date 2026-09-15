import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { Heading, Text } from "@/components/ui/typography";
import { authService } from "@/services/auth.service";
import type { ForgotPasswordPayload } from "@/types/auth";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/cn";
import { AuthBackLink } from "./AuthBackLink";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const { t, i18n } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordPayload>({
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordPayload) => {
    setIsSubmitting(true);
    try {
      const response = await authService.requestPasswordReset(values);
      if (response.success) {
        setIsSubmitted(true);
      } else {
        toast.error(response.message ?? t("auth.forgotPassword.error"));
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t("auth.forgotPassword.error");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const headingAlign = "text-center lg:text-start";

  if (isSubmitted) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className={cn("space-y-1.5", headingAlign)}>
          <Heading as="h1">{t("auth.forgotPassword.successTitle")}</Heading>
          <Text muted>{t("auth.forgotPassword.successMessage")}</Text>
        </div>
        <AuthBackLink />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("space-y-1.5", headingAlign)}>
        <Heading as="h1">{t("auth.forgotPassword.title")}</Heading>
        <Text muted>{t("auth.forgotPassword.subtitle")}</Text>
      </div>

      <form
        key={i18n.language}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Input
          label={t("auth.forgotPassword.email")}
          type="email"
          placeholder={t("auth.forgotPassword.emailPlaceholder")}
          autoComplete="email"
          error={errors.email?.message}
          {...register("email", {
            required: t("auth.forgotPassword.emailRequired"),
            pattern: {
              value: EMAIL_PATTERN,
              message: t("auth.forgotPassword.emailInvalid"),
            },
          })}
        />

        <Button type="submit" size="lg" className="mt-2 w-full" isLoading={isSubmitting}>
          {t("auth.forgotPassword.submit")}
        </Button>
      </form>

      <AuthBackLink />
    </div>
  );
}
