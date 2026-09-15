import { Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { SmsRecipientTable } from "@/components/pages/sms/SmsRecipientTable";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";
import { LoadingState } from "@/components/ui/feedback";
import { ConfirmDialog, Modal, ModalFooterButton } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import { useSmsGroups } from "@/hooks/useSmsGroups";
import { useSmsRecipientsQuery } from "@/hooks/useSms";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/cn";
import type { SmsCustomGroup, SmsGroupMember, SmsRecipient } from "@/types/sms";

function toGroupMember(row: SmsRecipient): SmsGroupMember {
  return {
    subscriberId: row.id,
    lineId: row.lineId,
    fullName: row.fullName,
    phone: row.phone,
    username: row.username,
  };
}

interface SmsGroupsPanelProps {
  canManage?: boolean;
}

export function SmsGroupsPanel({ canManage = false }: SmsGroupsPanelProps) {
  const { t } = useTranslation();
  const { groups, isLoading: groupsLoading, upsert, remove } = useSmsGroups();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SmsCustomGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SmsCustomGroup | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Map<number, SmsGroupMember>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: subscribers = [], isLoading: recipientsLoading } = useSmsRecipientsQuery(
    "all",
    search,
    editorOpen,
  );

  const selectedIds = useMemo(() => new Set(selectedMembers.keys()), [selectedMembers]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setSearch("");
    setSelectedMembers(new Map());
    setEditorOpen(true);
  };

  const openEdit = (group: SmsCustomGroup) => {
    setEditing(group);
    setName(group.name);
    setDescription(group.description ?? "");
    setSearch("");
    setSelectedMembers(new Map(group.members.map((member) => [member.subscriberId, member])));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  const toggleRow = (id: number) => {
    setSelectedMembers((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      const row = subscribers.find((entry) => entry.id === id);
      if (row) next.set(id, toGroupMember(row));
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (!checked) {
      setSelectedMembers(new Map());
      return;
    }
    setSelectedMembers((prev) => {
      const next = new Map(prev);
      for (const row of subscribers) {
        next.set(row.id, toGroupMember(row));
      }
      return next;
    });
  };

  const removeMember = (subscriberId: number) => {
    setSelectedMembers((prev) => {
      const next = new Map(prev);
      next.delete(subscriberId);
      return next;
    });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t("sms.groups.nameRequired"));
      return;
    }
    const members = Array.from(selectedMembers.values());
    if (members.length === 0) {
      toast.error(t("sms.groups.membersRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await upsert({
        id: editing?.id,
        name: trimmed,
        description: description.trim() || null,
        members,
      });
      toast.success(editing ? t("sms.groups.updateSuccess") : t("sms.groups.createSuccess"));
      closeEditor();
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

  const groupStats = useMemo(
    () =>
      groups.map((group) => ({
        group,
        withPhone: group.members.filter((member) => member.phone?.trim()).length,
      })),
    [groups],
  );

  const selectedList = useMemo(() => Array.from(selectedMembers.values()), [selectedMembers]);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Text className="text-sm font-semibold text-foreground">{t("sms.groups.panelTitle")}</Text>
          <Text muted className="mt-1 max-w-2xl text-sm">{t("sms.groups.panelSubtitle")}</Text>
        </div>
        {canManage ? (
          <Button size="sm" className="w-full shrink-0 sm:w-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("sms.groups.add")}
          </Button>
        ) : null}
      </div>

      {groupsLoading ? (
        <LoadingState variant="section" />
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <Text className="mt-4 font-medium">{t("sms.groups.emptyTitle")}</Text>
          <Text muted className="mt-2 max-w-md text-sm">{t("sms.groups.emptyHint")}</Text>
          {canManage ? (
            <Button size="sm" className="mt-6" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("sms.groups.add")}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groupStats.map(({ group, withPhone }) => (
            <article
              key={group.id}
              className="flex flex-col rounded-2xl border border-border/70 bg-surface p-4 shadow-sm ring-1 ring-border/40"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-foreground">{group.name}</h3>
                  {group.description ? (
                    <Text muted className="mt-1 line-clamp-2 text-xs">{group.description}</Text>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2.5 py-1">
                  {t("sms.groups.memberCount", { count: group.members.length })}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1">
                  {t("sms.groups.withPhoneCount", { count: withPhone })}
                </span>
              </div>
              {canManage ? (
                <div className="mt-4 flex gap-2 border-t border-border/60 pt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(group)}>
                    <Pencil className="h-4 w-4" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(group)}
                    aria-label={t("common.delete")}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <Modal
        open={editorOpen}
        onClose={closeEditor}
        title={editing ? t("sms.groups.editTitle") : t("sms.groups.addTitle")}
        className="sm:max-w-5xl"
        closeLabel={t("common.cancel")}
        footer={
          <>
            <ModalFooterButton variant="outline" onClick={closeEditor} disabled={isSaving}>
              {t("common.cancel")}
            </ModalFooterButton>
            <ModalFooterButton onClick={handleSave} isLoading={isSaving}>
              {t("common.save")}
            </ModalFooterButton>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4">
            <Input
              label={t("sms.groups.nameLabel")}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("sms.groups.namePlaceholder")}
            />
            <Textarea
              label={t("sms.groups.descriptionLabel")}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("sms.groups.descriptionPlaceholder")}
              rows={2}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border/70 bg-muted/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Text className="text-sm font-medium">{t("sms.groups.pickMembers")}</Text>
              <Text muted className="text-xs">
                {t("sms.groups.selectedMembers", { count: selectedList.length })}
              </Text>
            </div>

            {selectedList.length > 0 ? (
              <div className="custom-scrollbar flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border/60 bg-muted/20 p-2">
                {selectedList.map((member) => (
                  <span
                    key={member.subscriberId}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2.5 py-1 text-xs"
                  >
                    <span className="truncate font-medium">{member.fullName}</span>
                    <span className="text-muted-foreground" dir="ltr">
                      {member.lineId}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.subscriberId)}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={t("common.delete")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <Text muted className="text-xs">{t("sms.groups.noMembersSelected")}</Text>
            )}

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("subscribers.filters.searchPlaceholder")}
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleAll(true)} disabled={subscribers.length === 0}>
                {t("sms.table.selectAll")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMembers(new Map())}
                disabled={selectedList.length === 0}
              >
                {t("sms.table.clearSelection")}
              </Button>
            </div>

            <div
              className={cn(
                "custom-scrollbar -mx-1 min-w-0 overflow-hidden rounded-lg border border-border/60 bg-muted/10 px-1",
                "max-h-[min(18rem,50dvh)] overflow-y-auto sm:max-h-72",
              )}
            >
              {recipientsLoading ? (
                <LoadingState layout="table" variant="section" />
              ) : (
                <SmsRecipientTable
                  rows={subscribers}
                  selectedIds={selectedIds}
                  onToggleRow={toggleRow}
                  onToggleAll={toggleAll}
                />
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await remove(deleteTarget.id);
            setDeleteTarget(null);
            toast.success(t("sms.groups.deleteSuccess"));
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
        title={t("sms.groups.deleteTitle")}
        message={t("sms.groups.deleteMessage", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
