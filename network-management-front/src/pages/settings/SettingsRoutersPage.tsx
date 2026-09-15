import { ImagePlus, Plus, Router, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";
import { ConfirmDialog } from "@/components/ui/modals";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import { useRouterCatalog } from "@/hooks/useRouterCatalog";
import { ApiError } from "@/types/api";
import type { RouterCatalogItem } from "@/types/router";

export function SettingsRoutersPage() {
  const { t } = useTranslation();
  const { items, isLoading, upsert, remove } = useRouterCatalog();
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editing, setEditing] = useState<RouterCatalogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RouterCatalogItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const resetForm = () => {
    setName("");
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setEditing(null);
  };

  const handleFile = (file: File) => {
    setImageFile(file);
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t("settings.routers.nameRequired"));
      return;
    }
    setIsSaving(true);
    try {
      await upsert({
        id: editing?.id,
        name: trimmed,
        imageFile: imageFile ?? undefined,
      });
      toast.success(editing ? t("settings.routers.updateSuccess") : t("settings.routers.createSuccess"));
      resetForm();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("common.unexpectedError");
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (item: RouterCatalogItem) => {
    setEditing(item);
    setName(item.name);
    setImageFile(null);
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(item.imageUrl);
  };

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <Link
          to="/settings"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span>
          {t("settings.routers.backToSettings")}
        </Link>
        <Heading as="h1">{t("settings.routers.title")}</Heading>
        <Text muted className="mt-2 max-w-2xl">
          {t("settings.routers.subtitle")}
        </Text>
      </div>

      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
        <Heading as="h2" className="text-base font-semibold">
          {editing ? t("settings.routers.editTitle") : t("settings.routers.addTitle")}
        </Heading>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex shrink-0 flex-col items-center gap-2 self-center md:self-start">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/20">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-full w-full object-contain p-2" />
              ) : (
                <Router className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              {t("settings.routers.uploadImage")}
            </Button>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <Input
              label={t("settings.routers.nameLabel")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("settings.routers.namePlaceholder")}
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button type="button" size="sm" className="w-full sm:w-auto" onClick={handleSave} isLoading={isSaving}>
                <Plus className="h-4 w-4" />
                {editing ? t("common.save") : t("settings.routers.add")}
              </Button>
              {editing ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  {t("common.cancel")}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
        <Heading as="h2" className="text-base font-semibold">
          {t("settings.routers.listTitle")}
        </Heading>
        {isLoading ? (
          <LoadingState className="mt-4" />
        ) : items.length === 0 ? (
          <Text muted className="mt-4 text-sm">{t("settings.routers.empty")}</Text>
        ) : (
          <ul className="mt-4 grid min-w-0 list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="min-w-0 max-w-full">
                <article className="flex min-w-0 max-w-full flex-col gap-3 overflow-hidden rounded-lg border border-border/70 bg-muted/10 p-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="h-full w-full object-contain p-1.5" />
                      ) : (
                        <Router className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium leading-snug text-foreground">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full min-w-0"
                      onClick={() => startEdit(item)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setDeleteTarget(item)}
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await remove(deleteTarget.id);
            if (editing?.id === deleteTarget.id) resetForm();
            setDeleteTarget(null);
            toast.success(t("settings.routers.deleteSuccess"));
          } catch (err) {
            const message =
              err instanceof ApiError
                ? err.message
                : err instanceof Error
                  ? err.message
                  : t("common.unexpectedError");
            toast.error(message);
          } finally {
            setIsDeleting(false);
          }
        }}
        title={t("settings.routers.deleteTitle")}
        message={t("settings.routers.deleteMessage", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
