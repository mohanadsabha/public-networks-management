import { ImagePlus, PenLine, Plus, Router, X } from "lucide-react";
import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/buttons";
import { Input, Select } from "@/components/ui/forms";
import { Heading, Text } from "@/components/ui/typography";
import { ROUTER_CATALOG_CUSTOM_ID } from "@/lib/routerCatalogConstants";
import { buildAccessUrlFromConnection, parseOnlineHost } from "@/lib/subscriberConnection";
import { cn } from "@/lib/cn";
import type { MikrotikConnectionMethod } from "@/types/mikrotikConnection";
import type { RouterCatalogItem } from "@/types/router";

interface SubscriberRouterSectionProps {
  catalog: RouterCatalogItem[];
  catalogId: number | null;
  isCustomRouter: boolean;
  routerName: string;
  imagePreview: string | null;
  remoteManagementEnabled: boolean;
  remotePort: string;
  accessUrl: string | null;
  onlineHost?: string | null;
  isOnline: boolean;
  connectedTo?: MikrotikConnectionMethod | null;
  canManage?: boolean;
  onCatalogChange: (value: string) => void;
  onRouterNameChange: (value: string) => void;
  onImageFileSelect: (file: File) => void;
  onRemoteManagementChange: (enabled: boolean) => void;
  onRemotePortChange: (value: string) => void;
  onAddToCatalog?: () => void;
  isAddingToCatalog?: boolean;
}

export function SubscriberRouterSection({
  catalog,
  catalogId,
  isCustomRouter,
  routerName,
  imagePreview,
  remoteManagementEnabled,
  remotePort,
  accessUrl,
  onlineHost = null,
  isOnline,
  connectedTo = null,
  canManage = false,
  onCatalogChange,
  onRouterNameChange,
  onImageFileSelect,
  onRemoteManagementChange,
  onRemotePortChange,
  onAddToCatalog,
  isAddingToCatalog = false,
}: SubscriberRouterSectionProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedCatalog =
    !isCustomRouter && catalogId ? catalog.find((item) => item.id === catalogId) ?? null : null;
  const selectValue = isCustomRouter
    ? ROUTER_CATALOG_CUSTOM_ID
    : catalogId != null
      ? String(catalogId)
      : "";
  const showCatalogPreview = Boolean(selectedCatalog);
  const showCustomForm = isCustomRouter;
  const routerLinkUrl = useMemo(() => {
    if (!isOnline) return null;

    if (accessUrl?.trim()) return accessUrl.trim();

    const port = remotePort.trim() || null;
    const fromConnection = buildAccessUrlFromConnection({ onlineHost, routerPort: port });
    if (fromConnection) return fromConnection;

    const host = onlineHost?.trim();
    if (!host) return null;

    const parsed = parseOnlineHost(host);
    if (parsed?.ip) return `http://${parsed.host}`;

    return /^[\d.a-fA-F:]+/.test(host) ? `http://${host}` : null;
  }, [accessUrl, isOnline, onlineHost, remotePort]);

  const catalogOptions = useMemo(
    () =>
      catalog.map((item) => ({
        value: String(item.id),
        label: item.name,
        imageUrl: item.imageUrl,
      })),
    [catalog],
  );

  const trailingOption = useMemo(
    () => ({
      value: ROUTER_CATALOG_CUSTOM_ID,
      label: t("subscribers.profile.router.modelCustom"),
      icon: <PenLine className="h-4 w-4" strokeWidth={2} aria-hidden />,
      description: t("subscribers.profile.router.modelCustomHint"),
    }),
    [t],
  );

  const catalogEmptyHint =
    catalog.length === 0 ? (
      <>
        {t("subscribers.profile.router.catalogEmpty")}{" "}
        <Link to="/settings/routers" className="font-medium text-primary hover:underline">
          {t("subscribers.profile.router.catalogSettingsLink")}
        </Link>
      </>
    ) : undefined;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onImageFileSelect(file);
    event.target.value = "";
  };

  const imageContent = (alt: string) => (
    <>
      {imagePreview ? (
        <img src={imagePreview} alt={alt} className="h-full w-full object-contain p-3" />
      ) : (
        <div className="flex flex-col items-center gap-2 px-3 text-center text-muted-foreground">
          <Router className="h-8 w-8 opacity-50" strokeWidth={1.5} />
          <Text muted className="text-xs">{t("subscribers.profile.router.noImage")}</Text>
        </div>
      )}
      {isOnline ? (
        <span
          className="absolute end-2 top-2 h-3 w-3 rounded-full bg-success ring-2 ring-surface"
          title={
            connectedTo
              ? t("subscribers.profile.router.onlineVia", { method: connectedTo })
              : t("subscribers.profile.router.online")
          }
          aria-hidden
        />
      ) : null}
    </>
  );

  const renderRouterImageFrame = (alt: string, sizeClass: string) => {
    const frameClass = cn(
      "relative flex items-center justify-center overflow-hidden rounded-xl border bg-muted/30",
      sizeClass,
      routerLinkUrl
        ? "border-border transition-shadow hover:border-success/50 hover:shadow-md"
        : "border-dashed border-border",
    );

    if (routerLinkUrl) {
      return (
        <a
          href={routerLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={t("subscribers.profile.router.openAccess", { url: routerLinkUrl })}
          className={frameClass}
          onClick={(event) => event.stopPropagation()}
        >
          {imageContent(alt)}
        </a>
      );
    }

    return <div className={frameClass}>{imageContent(alt)}</div>;
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-muted/10 p-4 sm:p-5">
      <div>
        <Heading as="h3" className="text-sm font-semibold">
          {t("subscribers.profile.router.sectionTitle")}
        </Heading>
        <Text muted className="mt-1 text-xs">
          {t("subscribers.profile.router.sectionHint")}
        </Text>
      </div>

      <div
        className={cn(
          "flex flex-col gap-6",
          (showCatalogPreview || showCustomForm) && "lg:flex-row lg:items-start",
        )}
      >
        {showCatalogPreview ? (
          <div className="flex shrink-0 flex-col items-center gap-3">
            {renderRouterImageFrame(selectedCatalog!.name, "h-48 w-48 sm:h-52 sm:w-52")}
            <Text muted className="max-w-[9rem] text-center text-xs">
              {t("subscribers.profile.router.catalogImageHint")}
            </Text>
          </div>
        ) : null}

        <div className="min-w-0 flex-1 space-y-4">
          <Select
            label={t("subscribers.profile.router.modelLabel")}
            placeholder={t("subscribers.profile.router.modelPlaceholder")}
            value={selectValue}
            onChange={onCatalogChange}
            disabled={!canManage}
            options={catalogOptions}
            trailingOption={trailingOption}
            hint={catalogEmptyHint}
          />

          {showCatalogPreview ? (
            <div className="rounded-lg border border-border/70 bg-background/60 p-3">
              <Text className="text-xs font-medium text-muted-foreground">
                {t("subscribers.profile.router.nameLabel")}
              </Text>
              <Text className="mt-1 text-sm font-medium">{selectedCatalog!.name}</Text>
              <Text muted className="mt-2 text-xs">
                {t("subscribers.profile.router.catalogSelectedHint")}
              </Text>
            </div>
          ) : null}

          {showCustomForm ? (
            <div className="space-y-4 rounded-lg border border-border/70 bg-background/60 p-4">
              <Text className="text-sm font-medium text-foreground">
                {t("subscribers.profile.router.addCustomTitle")}
              </Text>
              <Input
                label={t("subscribers.profile.router.nameLabel")}
                value={routerName}
                onChange={(event) => onRouterNameChange(event.target.value)}
                placeholder={t("subscribers.profile.router.namePlaceholder")}
                disabled={!canManage}
              />
              <div className="space-y-2">
                <Text className="text-sm font-medium text-foreground">
                  {t("subscribers.profile.router.imageLabel")}
                </Text>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  {renderRouterImageFrame(
                    routerName || t("subscribers.profile.router.imageAlt"),
                    "h-40 w-40 shrink-0 sm:h-48 sm:w-48",
                  )}
                  {canManage ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImagePlus className="h-4 w-4" />
                        {t("subscribers.profile.router.uploadImage")}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
              {canManage && onAddToCatalog ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddToCatalog}
                  disabled={!routerName.trim() || isAddingToCatalog}
                  isLoading={isAddingToCatalog}
                >
                  <Plus className="h-4 w-4" />
                  {t("subscribers.profile.router.saveAsModel")}
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-lg border border-border/70 bg-background/60 p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={remoteManagementEnabled}
                onChange={(event) => onRemoteManagementChange(event.target.checked)}
                disabled={!canManage}
                className="rounded border-border"
              />
              <span className="text-sm font-medium">{t("subscribers.profile.router.remoteEnabled")}</span>
            </label>

            {remoteManagementEnabled ? (
              <div className="mt-3">
                <Input
                  label={t("subscribers.profile.router.remotePortLabel")}
                  value={remotePort}
                  onChange={(event) => onRemotePortChange(event.target.value)}
                  placeholder={t("subscribers.profile.router.remotePortPlaceholder")}
                  disabled={!canManage}
                  inputMode="numeric"
                  dir="ltr"
                />
                <Text muted className="mt-1 text-xs">
                  {t("subscribers.profile.router.remotePortHint")}
                </Text>
              </div>
            ) : (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                <X className="h-3.5 w-3.5 text-danger" aria-hidden />
                {t("subscribers.profile.router.remoteDisabled")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
