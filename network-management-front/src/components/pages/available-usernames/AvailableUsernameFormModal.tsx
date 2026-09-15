import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Input, PasswordInput } from "@/components/ui/forms";
import type { SpeedTier } from "@/types/speeds";
import {
  buildCooldownDates,
  formatConnectionDateTime,
  getDaysUntilExpiry,
  getPoolStatusFromRow,
  nowDatetimeLocal,
  toDatetimeLocalValue,
  USERNAME_COOLDOWN_DAYS,
  type AvailableUsername,
  type AvailableUsernamePoolStatus,
} from "@/types/availableUsername";
import { cn } from "@/lib/cn";

export interface AvailableUsernameFormValues {
  username: string;
  password: string;
  poolStatus: AvailableUsernamePoolStatus;
  assignedAt?: string;
}

const POOL_STATUS_OPTIONS: AvailableUsernamePoolStatus[] = ["new", "in_cooldown", "owner"];

interface AvailableUsernameFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  speedTier: SpeedTier;
  initialRow?: AvailableUsername;
  onClose: () => void;
  onSubmit: (values: AvailableUsernameFormValues) => void;
  isSubmitting?: boolean;
}

function poolStatusLabel(
  status: AvailableUsernamePoolStatus,
  t: (key: string) => string,
): string {
  switch (status) {
    case "new":
      return t("availableUsernames.filters.new");
    case "in_cooldown":
      return t("availableUsernames.filters.inCooldown");
    case "owner":
      return t("availableUsernames.filters.owner");
  }
}

function poolStatusHint(
  status: AvailableUsernamePoolStatus,
  t: (key: string) => string,
): string {
  switch (status) {
    case "new":
      return t("availableUsernames.form.statusNewHint");
    case "in_cooldown":
      return t("availableUsernames.form.statusRunningHint");
    case "owner":
      return t("availableUsernames.form.statusOwnerHint");
  }
}

export function AvailableUsernameFormModal({
  open,
  mode,
  speedTier,
  initialRow,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AvailableUsernameFormModalProps) {
  const { t, i18n } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AvailableUsernameFormValues>({
    defaultValues: {
      username: "",
      password: "",
      poolStatus: "new",
      assignedAt: nowDatetimeLocal(),
    },
  });

  const poolStatus = watch("poolStatus");
  const assignedAt = watch("assignedAt");

  const expiryPreview = useMemo(() => {
    if (poolStatus !== "in_cooldown" || !assignedAt) {
      return null;
    }
    const { expiryDate } = buildCooldownDates(assignedAt);
    return {
      expiryDate,
      days: getDaysUntilExpiry(expiryDate),
    };
  }, [poolStatus, assignedAt]);

  const title =
    mode === "add"
      ? t("availableUsernames.form.addTitle", { speed: speedTier.label })
      : t("availableUsernames.form.editTitle", { username: initialRow?.username ?? "" });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialRow) {
      const status = getPoolStatusFromRow(initialRow);
      reset({
        username: initialRow.username,
        password: "",
        poolStatus: status,
        assignedAt: initialRow.assignedAt
          ? toDatetimeLocalValue(initialRow.assignedAt)
          : nowDatetimeLocal(),
      });
      return;
    }

    reset({
      username: "",
      password: "",
      poolStatus: "new",
      assignedAt: nowDatetimeLocal(),
    });
  }, [open, mode, initialRow, reset]);

  useEffect(() => {
    if (poolStatus !== "in_cooldown") {
      clearErrors("assignedAt");
      if (poolStatus === "new") {
        setValue("assignedAt", undefined);
      }
    }
  }, [poolStatus, clearErrors, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (values: AvailableUsernameFormValues) => {
    if (values.poolStatus === "in_cooldown" && !values.assignedAt?.trim()) {
      setError("assignedAt", {
        type: "required",
        message: t("availableUsernames.form.assignedAtRequired"),
      });
      return;
    }
    onSubmit(values);
  };

  const handlePoolStatusChange = (option: AvailableUsernamePoolStatus) => {
    setValue("poolStatus", option, { shouldDirty: true });
    if (option === "in_cooldown") {
      const fallback = initialRow?.assignedAt
        ? toDatetimeLocalValue(initialRow.assignedAt)
        : assignedAt ?? nowDatetimeLocal();
      setValue("assignedAt", fallback);
    }
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
          <ModalFooterButton type="submit" form="available-username-form" isLoading={isSubmitting}>
            {mode === "add" ? t("availableUsernames.form.create") : t("common.save")}
          </ModalFooterButton>
        </>
      }
    >
      <form
        id="available-username-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <Input
          label={t("availableUsernames.form.speed")}
          value={speedTier.label}
          readOnly
          disabled
          className="bg-muted/50"
        />

        <Input
          label={t("availableUsernames.table.username")}
          placeholder={t("availableUsernames.form.usernamePlaceholder")}
          autoComplete="off"
          readOnly={mode === "edit"}
          disabled={mode === "edit"}
          className={mode === "edit" ? "bg-muted/50" : undefined}
          error={errors.username?.message}
          {...register("username", {
            required: mode === "add" ? t("availableUsernames.form.usernameRequired") : false,
          })}
        />

        {mode === "edit" ? (
          <p className="text-xs text-muted-foreground">
            {t("availableUsernames.form.usernameEditHint")}
          </p>
        ) : null}

        <PasswordInput
          label={t("availableUsernames.table.password")}
          placeholder={t("availableUsernames.form.passwordPlaceholder")}
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password", {
            required: mode === "add" ? t("availableUsernames.form.passwordRequired") : false,
            minLength: mode === "add"
              ? { value: 4, message: t("availableUsernames.form.passwordMin") }
              : undefined,
          })}
        />

        {mode === "edit" ? (
          <p className="text-xs text-muted-foreground">{t("availableUsernames.form.passwordEditHint")}</p>
        ) : null}

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">
            {t("availableUsernames.form.status")}
          </legend>
          <p className="text-xs text-muted-foreground">
            {mode === "edit"
              ? t("availableUsernames.form.statusEditHint")
              : t("availableUsernames.form.statusHint")}
          </p>

          <input type="hidden" {...register("poolStatus", { required: true })} />

          <div className="flex flex-wrap gap-2">
            {POOL_STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handlePoolStatusChange(option)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  poolStatus === option
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {poolStatusLabel(option, t)}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">{poolStatusHint(poolStatus, t)}</p>

          {poolStatus === "in_cooldown" ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
              <Input
                type="datetime-local"
                step={60}
                label={t("availableUsernames.form.assignedAt")}
                max={nowDatetimeLocal()}
                error={errors.assignedAt?.message}
                {...register("assignedAt")}
              />
              <p className="text-xs text-muted-foreground">
                {t("availableUsernames.form.assignedAtHint", {
                  days: USERNAME_COOLDOWN_DAYS,
                })}
              </p>
              {expiryPreview ? (
                <p className="text-xs font-medium text-primary">
                  {t("availableUsernames.form.expiryPreview", {
                    datetime: formatConnectionDateTime(expiryPreview.expiryDate, i18n.language),
                    count: expiryPreview.days,
                  })}
                </p>
              ) : null}
            </div>
          ) : null}
        </fieldset>
      </form>
    </Modal>
  );
}
