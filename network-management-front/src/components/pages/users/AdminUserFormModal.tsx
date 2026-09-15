import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Input } from "@/components/ui/forms";
import { mockAdminRoles } from "@/lib/mocks/adminUsers.mock";
import type { AdminUser, AdminUserFormValues } from "@/types/adminUser";

interface AdminUserFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: AdminUser;
  onClose: () => void;
  onSubmit: (values: AdminUserFormValues) => void;
  isSubmitting?: boolean;
}

export function AdminUserFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AdminUserFormModalProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AdminUserFormValues>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: mockAdminRoles[1]?.id ?? 2,
      status: "active",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      reset({
        name: initial.name,
        username: initial.username,
        email: initial.email ?? "",
        password: "",
        confirmPassword: "",
        roleId: initial.roleId,
        status: initial.status,
      });
      return;
    }
    reset({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: mockAdminRoles[1]?.id ?? 2,
      status: "active",
    });
  }, [open, mode, initial, reset]);

  const validatePasswords = (values: AdminUserFormValues) => {
    if (mode === "create" && !values.password.trim()) {
      return t("users.form.passwordRequired");
    }
    if (values.password && values.password.length < 6) {
      return t("users.form.passwordRequired");
    }
    if (mode === "create" && !values.confirmPassword.trim()) {
      return t("users.form.confirmPasswordRequired");
    }
    if (values.password && values.password !== values.confirmPassword) {
      return t("users.form.passwordsMismatch");
    }
    return true;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "create"
          ? t("users.form.addTitle")
          : t("users.form.editTitle", { username: initial?.username ?? "" })
      }
      className="sm:max-w-xl"
    >
      <form
        onSubmit={handleSubmit((values) => {
          const passwordCheck = validatePasswords(values);
          if (passwordCheck !== true) {
            setError("confirmPassword", { message: passwordCheck });
            return;
          }
          onSubmit(values);
        })}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("users.form.name")}
            placeholder={t("users.form.namePlaceholder")}
            {...register("name", { required: t("users.form.nameRequired") })}
            error={errors.name?.message}
          />
          <Input
            label={t("users.form.username")}
            placeholder={t("users.form.usernamePlaceholder")}
            disabled={mode === "edit"}
            {...register("username", { required: t("users.form.usernameRequired") })}
            error={errors.username?.message}
          />
        </div>

        <Input
          label={t("users.form.email")}
          placeholder={t("users.form.emailPlaceholder")}
          {...register("email")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("users.form.password")}
            type="password"
            placeholder={t("users.form.passwordPlaceholder")}
            {...register("password")}
            error={errors.password?.message}
          />
          <Input
            label={t("users.form.confirmPassword")}
            type="password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>
        {mode === "edit" ? (
          <p className="text-xs text-muted-foreground">{t("users.form.passwordEditHint")}</p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("users.form.role")}</label>
            <select
              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              {...register("roleId", {
                required: t("users.form.roleRequired"),
                valueAsNumber: true,
              })}
            >
              {mockAdminRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("users.form.status")}</label>
            <select
              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
              {...register("status")}
            >
              <option value="active">{t("users.status.active")}</option>
              <option value="inactive">{t("users.status.inactive")}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <ModalFooterButton type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton type="submit" disabled={isSubmitting}>
            {t("common.save")}
          </ModalFooterButton>
        </div>
      </form>
    </Modal>
  );
}
