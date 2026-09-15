import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { Input, PasswordInput } from "@/components/ui/forms";
import { Heading, Text } from "@/components/ui/typography";
import { useAuth } from "@/hooks/useAuth";
import type { LoginPayload } from "@/types/auth";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/cn";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoggingIn, isDevMode } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginPayload) => {
    try {
      const response = await login(values);
      if (response.success) {
        toast.success(t("auth.loginSuccess"));
        navigate("/", { replace: true });
      } else {
        toast.error(response.message ?? t("auth.loginFailed"));
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : t("auth.loginError");
      toast.error(message);
    }
  };

  const headingAlign = "text-center lg:text-start";

  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("space-y-1.5", headingAlign)}>
        <Heading as="h1">{t("auth.welcome")}</Heading>
        <Text muted>{t("auth.subtitle")}</Text>
      </div>

      {isDevMode ? (
        <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
          <span className="font-semibold text-accent">{t("auth.devModeTitle")}</span>{" "}
          <span className="text-muted-foreground">{t("auth.devModeMessage")}</span>
        </div>
      ) : null}

      <form
        key={i18n.language}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Input
          label={t("auth.username")}
          placeholder={t("auth.usernamePlaceholder")}
          autoComplete="username"
          error={errors.username?.message}
          {...register("username", { required: t("auth.usernameRequired") })}
        />

        <div className="space-y-2">
          <PasswordInput
            label={t("auth.password")}
            placeholder={t("auth.passwordPlaceholder")}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password", { required: t("auth.passwordRequired") })}
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              {t("auth.forgotPasswordLink")}
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-2 w-full"
          isLoading={isLoggingIn}
        >
          {t("auth.submit")}
        </Button>
      </form>
    </div>
  );
}
