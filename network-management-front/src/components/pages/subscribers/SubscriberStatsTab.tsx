import { Calendar, Clock, Gauge, HardDrive, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SubscriberRouterSection } from "@/components/pages/subscribers/SubscriberRouterSection";
import { Button } from "@/components/ui/buttons";
import { Input, PasswordInput, Textarea } from "@/components/ui/forms";
import { DataUsageDisplay, StatCard } from "@/components/ui/data";
import { ProfileSection } from "@/components/ui/profile";
import { Text } from "@/components/ui/typography";
import { useRouterCatalog } from "@/hooks/useRouterCatalog";
import { useRouterMutations } from "@/hooks/useRouters";
import { isRouterCatalogCustomValue } from "@/lib/routerCatalogConstants";
import {
  formatRouterPortApi,
  isSubscriberCustomRouter,
  parseRouterPortDisplay,
  resolveCatalogIdForSubscriber,
  withRouterImageCacheBuster,
} from "@/lib/routerUtils";
import { resolveUsageLimitMb } from "@/lib/speedFairUsage";
import { getDaysUntilDisconnect, getUsageDays, buildSpeedLabel, isSubscriberDataUsageActive } from "@/lib/subscriberUtils";
import type { SubscriberProfilePatch } from "@/hooks/useSubscribers";
import type { MikrotikConnectionMethod } from "@/types/mikrotikConnection";
import type { Subscriber } from "@/types/subscriber";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

type SubscriberProfileSavePatch = SubscriberProfilePatch;

type SubscriberProfileSaveMeta = {
  routerSaved?: boolean;
  routerImageUrl?: string | null;
  routerId?: number | null;
  catalogId?: number | null;
  routerName?: string;
};

interface SubscriberStatsTabProps {
  subscriber: Subscriber;
  canManage?: boolean;
  canViewPasswords?: boolean;
  showNotes?: boolean;
  daysGone?: number | null;
  syncTime?: number | null;
  onSave?: (patch: SubscriberProfileSavePatch, meta?: SubscriberProfileSaveMeta) => void | Promise<void>;
  onProfileRefresh?: () => void | Promise<void>;
  isSubmitting?: boolean;
  showRenew?: boolean;
  onRenewUsername?: () => void;
  isRenewing?: boolean;
  accessUrl?: string | null;
  onlineHost?: string | null;
  isOnline?: boolean;
  connectedTo?: MikrotikConnectionMethod | null;
}

interface ProfileFormValues {
  fullName: string;
  phone: string;
  notes: string;
  password: string;
  packageLine: number;
  firstContactDate: string;
}

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  try {
    return format(parseISO(value), "yyyy-MM-dd");
  } catch {
    return value.slice(0, 10);
  }
}

export function SubscriberStatsTab({
  subscriber,
  canManage = false,
  canViewPasswords = false,
  showNotes = true,
  daysGone = null,
  syncTime = null,
  onSave,
  onProfileRefresh,
  isSubmitting = false,
  showRenew = false,
  onRenewUsername,
  isRenewing = false,
  accessUrl = null,
  onlineHost = null,
  isOnline = false,
  connectedTo = null,
}: SubscriberStatsTabProps) {
  const { t } = useTranslation();
  const { items: routerCatalog } = useRouterCatalog();
  const { createMutation, updateMutation, assignMutation } = useRouterMutations();
  const usageDays = daysGone ?? getUsageDays(subscriber);
  const daysLeft = getDaysUntilDisconnect(subscriber);
  const daysLeftDisplay = daysLeft !== null ? String(Math.max(0, daysLeft)) : "—";
  const speedLabel = subscriber.speedMbps > 0 ? buildSpeedLabel(subscriber.speedMbps) : null;
  const usedMb = subscriber.totalUsage ?? 0;
  const limitMb = resolveUsageLimitMb(
    subscriber.usageLimit,
    subscriber.speedMbps,
    subscriber.speedId ?? undefined,
  );
  const canEditFirstContact = canManage && Boolean(subscriber.usernameId && subscriber.speedId);
  const showUsage = Boolean(subscriber.username && (usedMb > 0 || limitMb != null));
  const usageIsActive = isSubscriberDataUsageActive(subscriber);
  const [routerName, setRouterName] = useState(subscriber.routerName ?? "");
  const [routerImageFile, setRouterImageFile] = useState<File | null>(null);
  const [catalogId, setCatalogId] = useState<number | null>(() =>
    resolveCatalogIdForSubscriber(subscriber, routerCatalog),
  );
  const [isCustomRouter, setIsCustomRouter] = useState(() =>
    isSubscriberCustomRouter(subscriber, routerCatalog),
  );
  const [isAddingToCatalog, setIsAddingToCatalog] = useState(false);
  const [isSavingRouter, setIsSavingRouter] = useState(false);
  const initialPort = parseRouterPortDisplay(subscriber.routerPort);
  const [remoteManagementEnabled, setRemoteManagementEnabled] = useState(initialPort.enabled);
  const [remotePort, setRemotePort] = useState(initialPort.display);
  const [routerImagePreview, setRouterImagePreview] = useState<string | null>(() => {
    const fromCatalog = resolveCatalogIdForSubscriber(subscriber, routerCatalog);
    const catalogItem = fromCatalog
      ? routerCatalog.find((item) => item.id === fromCatalog) ?? null
      : null;
    return catalogItem?.imageUrl ?? subscriber.routerImageUrl ?? null;
  });

  useEffect(() => {
    setRouterName(subscriber.routerName ?? "");
    setRouterImageFile(null);
    const matchedCatalogId = resolveCatalogIdForSubscriber(subscriber, routerCatalog);
    const catalogItem = matchedCatalogId
      ? routerCatalog.find((item) => item.id === matchedCatalogId) ?? null
      : null;
    const useCatalog = Boolean(matchedCatalogId && catalogItem);
    const useCustom = !useCatalog && isSubscriberCustomRouter(subscriber, routerCatalog);
    const portState = parseRouterPortDisplay(subscriber.routerPort);

    setCatalogId(useCatalog ? matchedCatalogId : null);
    setIsCustomRouter(useCustom);
    setRemoteManagementEnabled(portState.enabled);
    setRemotePort(portState.display);

    if (useCatalog && catalogItem) {
      setRouterName(catalogItem.name);
      setRouterImagePreview(withRouterImageCacheBuster(catalogItem.imageUrl, catalogItem.id));
    } else if (useCustom) {
      setRouterName(subscriber.routerName ?? "");
      setRouterImagePreview(
        withRouterImageCacheBuster(
          subscriber.routerImageUrl,
          subscriber.updatedAt ?? subscriber.id,
        ),
      );
    } else {
      setRouterName(subscriber.routerName ?? "");
      setRouterImagePreview(null);
    }
  }, [
    subscriber.id,
    subscriber.routerName,
    subscriber.routerImageUrl,
    subscriber.routerPort,
    subscriber.updatedAt,
    routerCatalog,
  ]);

  useEffect(() => {
    return () => {
      if (routerImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(routerImagePreview);
      }
    };
  }, [routerImagePreview]);

  const currentRouterPortApi = (): string | null =>
    remoteManagementEnabled ? formatRouterPortApi(remotePort) : null;

  const persistRouterChanges = async (patch: SubscriberProfileSavePatch): Promise<SubscriberProfileSaveMeta> => {
    if (!canManage) return {};

    const portApi = currentRouterPortApi();
    const savedPortApi =
      subscriber.routerPort != null ? formatRouterPortApi(String(subscriber.routerPort)) : null;
    const portChanged = portApi !== savedPortApi;
    const trimmedName = routerName.trim();

    const assignRouter = async (routerId: number): Promise<SubscriberProfileSaveMeta> => {
      await assignMutation.mutateAsync({
        routerId,
        subscriberId: subscriber.id,
        routerPort: portApi,
        lineId: subscriber.lineId,
      });
      return { routerSaved: true, routerId, catalogId: isCustomRouter ? null : routerId };
    };

    if (isCustomRouter) {
      if (!trimmedName) return {};

      const existingCustomId =
        subscriber.routerId && isSubscriberCustomRouter(subscriber, routerCatalog)
          ? subscriber.routerId
          : null;
      const nameChanged = trimmedName !== (subscriber.routerName ?? "").trim();

      if (existingCustomId) {
        if (routerImageFile || nameChanged) {
          const updated = await updateMutation.mutateAsync({
            id: existingCustomId,
            name: trimmedName,
            imageFile: routerImageFile ?? undefined,
            subscriberId: subscriber.id,
            lineId: subscriber.lineId,
          });
          if (portChanged || subscriber.routerId !== existingCustomId) {
            await assignRouter(existingCustomId);
          }
          return {
            routerSaved: true,
            routerImageUrl: updated.imageUrl,
            routerId: existingCustomId,
            catalogId: null,
            routerName: updated.name,
          };
        }

        if (portChanged) {
          await assignRouter(existingCustomId);
          return { routerSaved: true, routerId: existingCustomId, catalogId: null };
        }

        return {};
      }

      const created = await createMutation.mutateAsync({
        name: trimmedName,
        imageFile: routerImageFile ?? undefined,
        subscriberId: subscriber.id,
        lineId: subscriber.lineId,
      });
      await assignRouter(created.id);
      return {
        routerSaved: true,
        routerImageUrl: created.imageUrl,
        routerId: created.id,
        catalogId: null,
        routerName: created.name,
      };
    }

    if (catalogId) {
      const catalogItem = routerCatalog.find((entry) => entry.id === catalogId) ?? null;

      if (routerImageFile) {
        const updated = await updateMutation.mutateAsync({
          id: catalogId,
          name: catalogItem?.name ?? trimmedName,
          imageFile: routerImageFile,
          subscriberId: subscriber.id,
          lineId: subscriber.lineId,
        });
        if (subscriber.routerId !== catalogId || portChanged) {
          await assignRouter(catalogId);
        }
        return {
          routerSaved: true,
          routerImageUrl: updated.imageUrl,
          routerId: catalogId,
          catalogId,
          routerName: updated.name,
        };
      }

      const assignedCatalogId = subscriber.routerId ?? resolveCatalogIdForSubscriber(subscriber, routerCatalog);
      const needsAssign = assignedCatalogId !== catalogId;

      if (needsAssign) {
        await assignRouter(catalogId);
        return {
          routerSaved: true,
          routerImageUrl: catalogItem?.imageUrl ?? null,
          routerId: catalogId,
          catalogId,
          routerName: catalogItem?.name,
        };
      }

      if (portChanged) {
        patch.routerPort = portApi;
        return { routerSaved: true, routerId: catalogId, catalogId };
      }

      return {};
    }

    if (portChanged) {
      patch.routerPort = portApi;
      return { routerSaved: true };
    }

    return {};
  };

  const applyRouterSaveMeta = (meta: SubscriberProfileSaveMeta) => {
    if (meta.catalogId !== undefined) {
      setCatalogId(meta.catalogId);
      setIsCustomRouter(meta.catalogId === null);
    }
    if (meta.routerName !== undefined) {
      setRouterName(meta.routerName);
    }
    if (meta.routerImageUrl !== undefined) {
      setRouterImagePreview(withRouterImageCacheBuster(meta.routerImageUrl));
      setRouterImageFile(null);
    }
  };

  const hasProfileFieldChanges = (
    patch: SubscriberProfileSavePatch,
    values: ProfileFormValues,
  ): boolean => {
    if (patch.password !== undefined) return true;
    if (patch.packageLine !== undefined && patch.packageLine !== subscriber.packageLine) return true;
    if (patch.firstContactDate !== undefined) return true;
    if (patch.fullName !== undefined && patch.fullName !== subscriber.fullName) return true;
    if (patch.phone !== undefined && patch.phone !== (subscriber.phone ?? null)) return true;
    if (
      showNotes &&
      patch.notes !== undefined &&
      patch.notes !== (subscriber.notes ?? null)
    ) {
      return true;
    }
    if (patch.routerPort !== undefined) {
      const savedPort =
        subscriber.routerPort != null ? formatRouterPortApi(String(subscriber.routerPort)) : null;
      if (patch.routerPort !== savedPort) return true;
    }
    if (values.fullName.trim() !== subscriber.fullName) return true;
    if ((values.phone.trim() || null) !== (subscriber.phone ?? null)) return true;
    if (showNotes && (values.notes.trim() || null) !== (subscriber.notes ?? null)) return true;
    return false;
  };

  const handleCatalogChange = (value: string) => {
    if (!value) {
      setCatalogId(null);
      setIsCustomRouter(false);
      setRouterImageFile(null);
      setRouterName(subscriber.routerName ?? "");
      setRouterImagePreview(null);
      return;
    }

    if (isRouterCatalogCustomValue(value)) {
      setCatalogId(null);
      setIsCustomRouter(true);
      setRouterName(subscriber.routerName ?? "");
      setRouterImagePreview(subscriber.routerImageUrl ?? null);
      setRouterImageFile(null);
      return;
    }

    const routerId = Number(value);
    const item = routerCatalog.find((entry) => entry.id === routerId) ?? null;
    setCatalogId(Number.isFinite(routerId) ? routerId : null);
    setIsCustomRouter(false);
    if (item) {
      setRouterName(item.name);
      setRouterImagePreview(item.imageUrl);
      setRouterImageFile(null);
    }
  };

  const handleAddToCatalog = async () => {
    const trimmed = routerName.trim();
    if (!trimmed) {
      toast.error(t("settings.routers.nameRequired"));
      return;
    }
    setIsAddingToCatalog(true);
    try {
      const saved = await createMutation.mutateAsync({
        name: trimmed,
        imageFile: routerImageFile ?? undefined,
        subscriberId: subscriber.id,
        lineId: subscriber.lineId,
      });
      await assignMutation.mutateAsync({
        routerId: saved.id,
        subscriberId: subscriber.id,
        routerPort: currentRouterPortApi(),
        lineId: subscriber.lineId,
      });
      setCatalogId(saved.id);
      setIsCustomRouter(false);
      setRouterName(saved.name);
      setRouterImagePreview(withRouterImageCacheBuster(saved.imageUrl, saved.id));
      setRouterImageFile(null);
      toast.success(t("subscribers.profile.router.saveAsModelSuccess"));
    } finally {
      setIsAddingToCatalog(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: subscriber.fullName,
      phone: subscriber.phone ?? "",
      notes: subscriber.notes ?? "",
      password: subscriber.password ?? "",
      packageLine: subscriber.packageLine,
      firstContactDate: toDateInputValue(subscriber.firstContactDate),
    },
  });

  useEffect(() => {
    reset({
      fullName: subscriber.fullName,
      phone: subscriber.phone ?? "",
      notes: subscriber.notes ?? "",
      password: subscriber.password ?? "",
      packageLine: subscriber.packageLine,
      firstContactDate: toDateInputValue(subscriber.firstContactDate),
    });
  }, [
    subscriber.lineId,
    subscriber.packageLine,
    subscriber.fullName,
    subscriber.phone,
    subscriber.notes,
    subscriber.password,
    subscriber.firstContactDate,
    reset,
  ]);

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    try {
      return format(parseISO(value), "yyyy-MM-dd");
    } catch {
      return value;
    }
  };

  const handleImageFileSelect = (file: File) => {
    setRouterImageFile(file);
    setRouterImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Text className="text-sm font-semibold text-foreground">{t("subscribers.profile.cycleOverview")}</Text>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label={t("subscribers.profile.stats.usageDays")}
            value={usageDays ?? "—"}
            hint={t("subscribers.profile.stats.usageDaysHint")}
            icon={Clock}
          />
          <StatCard
            label={t("subscribers.profile.stats.daysLeft")}
            value={daysLeftDisplay}
            hint={t("subscribers.profile.stats.daysLeftHint")}
            icon={Calendar}
            iconClassName="bg-warning/10 text-warning"
          />
          <StatCard
            label={t("subscribers.profile.stats.dataUsage")}
            value={
              showUsage ? (
                <DataUsageDisplay
                  usedMb={usedMb}
                  limitMb={limitMb}
                  size="lg"
                  inactive={!usageIsActive}
                />
              ) : (
                "—"
              )
            }
            hint={
              subscriber.username
                ? [
                    !usageIsActive
                      ? t("subscribers.profile.stats.dataUsageInactiveHint")
                      : null,
                    t("subscribers.profile.stats.dataUsageHint", { username: subscriber.username }),
                    syncTime && syncTime > 0
                      ? t("subscribers.profile.stats.syncEveryMinutes", { minutes: syncTime })
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : t("subscribers.profile.stats.dataUsageNoUsername")
            }
            icon={HardDrive}
            iconClassName={
              usageIsActive ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
            }
            valueClassName={!usageIsActive ? "text-muted-foreground" : undefined}
            className={!usageIsActive ? "border-border/60 bg-muted/25" : undefined}
          />
        </div>
      </div>

      <ProfileSection title={t("subscribers.profile.formSection")} bodyClassName="p-0">
        <div
          className={cn(
            "flex flex-wrap items-start gap-3 border-b border-border/60 bg-gradient-to-r from-primary/5 via-transparent to-transparent px-4 py-4 sm:px-6",
            !speedLabel && "opacity-80",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Gauge className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">{t("subscribers.table.speed")}</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {speedLabel ? t("subscribers.profile.currentSpeed", { speed: speedLabel }) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t("subscribers.profile.speedReadOnlyHint")}</p>
          </div>
          {showRenew ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={onRenewUsername}
              disabled={isRenewing}
              isLoading={isRenewing}
            >
              <RotateCcw className="h-4 w-4" />
              {t("subscribers.username.renewUsername")}
            </Button>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit(async (values) => {
            const patch: SubscriberProfileSavePatch = {
              fullName: values.fullName.trim(),
              phone: values.phone.trim() || null,
              ...(showNotes ? { notes: values.notes.trim() || null } : {}),
            };
            const password = values.password.trim();
            const previous = (subscriber.password ?? "").trim();
            if (canManage && password !== previous) {
              patch.password = password || null;
            }
            if (canManage && values.packageLine !== subscriber.packageLine) {
              patch.packageLine = values.packageLine;
            }
            if (canEditFirstContact) {
              const nextFirstContact = values.firstContactDate.trim();
              const previousFirstContact = toDateInputValue(subscriber.firstContactDate);
              if (nextFirstContact !== previousFirstContact) {
                patch.firstContactDate = nextFirstContact || null;
                patch.usernameId = subscriber.usernameId;
                patch.usernameSpeedId = subscriber.speedId;
              }
            }

            setIsSavingRouter(true);
            try {
              const meta = await persistRouterChanges(patch);
              applyRouterSaveMeta(meta);
              const profileChanged = hasProfileFieldChanges(patch, values);

              if (profileChanged) {
                await onSave?.(patch, meta);
              } else if (meta.routerSaved) {
                toast.success(t("subscribers.profile.router.saveSuccess"));
              }

              if (meta.routerSaved) {
                void onProfileRefresh?.();
              }

              setRouterImageFile(null);
            } catch (err) {
              const message =
                err instanceof Error ? err.message : t("common.unexpectedError");
              toast.error(message);
            } finally {
              setIsSavingRouter(false);
            }
          })}
          className="space-y-6 p-4 sm:p-6"
        >
          <SubscriberRouterSection
            catalog={routerCatalog}
            catalogId={catalogId}
            isCustomRouter={isCustomRouter}
            routerName={routerName}
            imagePreview={routerImagePreview}
            remoteManagementEnabled={remoteManagementEnabled}
            remotePort={remotePort}
            accessUrl={accessUrl}
            onlineHost={onlineHost}
            isOnline={isOnline}
            connectedTo={connectedTo}
            canManage={canManage}
            onCatalogChange={handleCatalogChange}
            onRouterNameChange={setRouterName}
            onImageFileSelect={handleImageFileSelect}
            onAddToCatalog={canManage ? handleAddToCatalog : undefined}
            isAddingToCatalog={isAddingToCatalog}
            onRemoteManagementChange={(enabled) => {
              setRemoteManagementEnabled(enabled);
              if (!enabled) setRemotePort("");
            }}
            onRemotePortChange={setRemotePort}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t("subscribers.table.lineId")} value={subscriber.lineId} readOnly disabled />
            <Input
              label={t("subscribers.form.lineNumber")}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              disabled={!canManage}
              error={errors.packageLine?.message}
              {...register("packageLine", {
                required: t("subscribers.form.lineNumberRequired"),
                valueAsNumber: true,
                min: { value: 1, message: t("subscribers.form.lineNumberRequired") },
              })}
            />
            <Input
              label={t("subscribers.table.username")}
              value={subscriber.username ?? "—"}
              readOnly
              disabled
            />
            {canViewPasswords && canManage ? (
              <PasswordInput
                label={t("subscribers.table.password")}
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password", {
                  validate: (value) => {
                    const trimmed = value?.trim() ?? "";
                    if (!trimmed) return t("subscribers.username.passwordRequired");
                    if (trimmed.length < 4) return t("subscribers.username.passwordMin");
                    return true;
                  },
                })}
              />
            ) : null}
            <Input
              label={t("subscribers.form.fullName")}
              {...register("fullName")}
              disabled={!canManage}
            />
            <Input label={t("subscribers.form.phone")} {...register("phone")} disabled={!canManage} />
            <div className="space-y-1">
              <Input
                label={t("subscribers.profile.firstContact")}
                type="date"
                disabled={!canEditFirstContact}
                {...register("firstContactDate", {
                  validate: (value) => {
                    if (!canEditFirstContact) return true;
                    if (!value?.trim()) return t("subscribers.profile.firstContactRequired");
                    return true;
                  },
                })}
                error={errors.firstContactDate?.message}
              />
              {canManage && !canEditFirstContact ? (
                <Text muted className="text-xs">
                  {t("subscribers.profile.firstContactNoUsername")}
                </Text>
              ) : null}
            </div>
            <Input
              label={t("subscribers.profile.disconnection")}
              value={formatDate(subscriber.disconnectionDate)}
              readOnly
              disabled
            />
          </div>

          {canManage ? (
            <div className="space-y-1">
              <Text muted className="text-xs">
                {t("subscribers.profile.passwordEditHint")}
              </Text>
            </div>
          ) : null}

          {showNotes ? (
            <Textarea
              label={t("subscribers.form.notes")}
              rows={3}
              {...register("notes")}
              disabled={!canManage}
            />
          ) : null}

          {canManage ? (
            <div className="flex justify-end border-t border-border/60 pt-4">
              <Button
                type="submit"
                size="sm"
                isLoading={
                  isSubmitting ||
                  isSavingRouter ||
                  createMutation.isPending ||
                  assignMutation.isPending
                }
              >
                {t("common.save")}
              </Button>
            </div>
          ) : null}
        </form>
      </ProfileSection>
    </div>
  );
}
