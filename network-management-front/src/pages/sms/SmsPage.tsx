import { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  SmsAudienceFilters,
  SmsComposePanel,
  SmsGroupSendSection,
  SmsGroupsPanel,
  SmsLogsTable,
  SmsRecipientTable,
  SmsSectionNav,
  SmsTemplatesPanel,
} from "@/components/pages/sms";
import { Button } from "@/components/ui/buttons";
import { LoadingState } from "@/components/ui/feedback";
import { Heading, Text } from "@/components/ui/typography";
import {
  useSendSmsMutation,
  useSmsLogsQuery,
  useSmsRecipientsQuery,
  useSmsTemplatesQuery,
} from "@/hooks/useSms";
import { useSmsGroups } from "@/hooks/useSmsGroups";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { useOnlineUsersQuery } from "@/hooks/useOnlineUsers";
import { filterSmsConnectedRecipients, smsRecipientsApiAudience } from "@/lib/smsUtils";
import { smsPath, type SmsSection } from "@/lib/routePaths";
import type { SmsAudienceFilter, SmsRecipientMode, SmsTemplate } from "@/types/sms";
import { ApiError } from "@/types/api";

const SMS_SECTIONS: SmsSection[] = ["send", "groups", "logs", "templates"];

export function SmsPage() {
  const { t } = useTranslation();
  const { canManage } = useRoleAccess();
  const { section: sectionParam } = useParams<{ section?: string }>();
  const section: SmsSection =
    sectionParam && SMS_SECTIONS.includes(sectionParam as SmsSection)
      ? (sectionParam as SmsSection)
      : "send";

  if (sectionParam && !SMS_SECTIONS.includes(sectionParam as SmsSection)) {
    return <Navigate to={smsPath("send")} replace />;
  }

  const [recipientMode, setRecipientMode] = useState<SmsRecipientMode>("subscribers");
  const [audience, setAudience] = useState<SmsAudienceFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [customPhone, setCustomPhone] = useState("");
  const [logsPage, setLogsPage] = useState(1);

  const { groups } = useSmsGroups();
  const listAudience: SmsAudienceFilter =
    recipientMode === "customers" ? "customers" : audience;
  const apiAudience = smsRecipientsApiAudience(listAudience);
  const needsOnlineUsers =
    section === "send" && recipientMode === "subscribers" && listAudience === "connected";

  const templatesQuery = useSmsTemplatesQuery();
  const templates = templatesQuery.data ?? [];

  const {
    data: apiRows = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSmsRecipientsQuery(
    apiAudience,
    search,
    section === "send" && recipientMode !== "custom" && recipientMode !== "groups",
  );

  const { data: onlineUsers = [], isLoading: onlineUsersLoading } = useOnlineUsersQuery({
    enabled: needsOnlineUsers,
    refetchIntervalMs: false,
  });

  const onlineUsernameSet = useMemo(() => {
    const set = new Set<string>();
    for (const user of onlineUsers) {
      const key = user.username?.trim().toLowerCase();
      if (key) set.add(key);
    }
    return set;
  }, [onlineUsers]);

  const recipientsLoading = isLoading || (needsOnlineUsers && onlineUsersLoading);

  const filteredRows = useMemo(() => {
    if (listAudience === "connected") {
      return filterSmsConnectedRecipients(apiRows, onlineUsernameSet);
    }
    return apiRows;
  }, [apiRows, listAudience, onlineUsernameSet]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const groupSendTargets = useMemo(
    () =>
      (selectedGroup?.members ?? []).filter((member) => member.phone?.trim()),
    [selectedGroup],
  );

  const logsQuery = useSmsLogsQuery(logsPage);
  const sendMutation = useSendSmsMutation();

  useEffect(() => {
    setSelectedIds(new Set());
  }, [audience, search, recipientMode]);

  useEffect(() => {
    if (recipientMode !== "groups") {
      setSelectedGroupId(null);
    }
  }, [recipientMode]);

  useEffect(() => {
    if (!templates.length || activeTemplateId != null) return;
    setActiveTemplateId(templates[0].id);
    setMessage(templates[0].body);
  }, [templates, activeTemplateId]);

  const selectedRecipients = useMemo(
    () => filteredRows.filter((r) => selectedIds.has(r.id)),
    [filteredRows, selectedIds],
  );

  const recipientCount =
    recipientMode === "groups" ? groupSendTargets.length : selectedRecipients.length;

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    else setSelectedIds(new Set());
  };

  const handleTemplateChange = (template: SmsTemplate) => {
    setActiveTemplateId(template.id);
    setMessage(template.body);
  };

  const handleSend = async () => {
    if (!canManage) return;

    const trimmed = message.trim();
    if (!trimmed) {
      toast.error(t("sms.toast.noMessage"));
      return;
    }

    try {
      if (recipientMode === "custom") {
        if (!customPhone.trim()) {
          toast.error(t("sms.toast.noPhone"));
          return;
        }
        const result = await sendMutation.mutateAsync({
          recipientType: "custom",
          phone: customPhone.trim(),
          message: trimmed,
          templateId: activeTemplateId ?? undefined,
        });
        toast.success(t("sms.toast.sent", { count: result.sentCount }));
        return;
      }

      if (recipientMode === "groups") {
        if (!selectedGroup || groupSendTargets.length === 0) {
          toast.error(t("sms.toast.noGroupRecipients"));
          return;
        }
        const result = await sendMutation.mutateAsync({
          recipientType: "subscribers",
          subscriberIds: groupSendTargets.map((member) => member.subscriberId),
          phones: groupSendTargets.map((member) => member.phone!.trim()),
          message: trimmed,
          templateId: activeTemplateId ?? undefined,
        });
        if (result.failedCount > 0) {
          toast.warning(t("sms.toast.partial", { sent: result.sentCount, failed: result.failedCount }));
        } else {
          toast.success(t("sms.toast.sent", { count: result.sentCount }));
        }
        return;
      }

      if (selectedRecipients.length === 0) {
        toast.error(t("sms.toast.noRecipients"));
        return;
      }

      const result = await sendMutation.mutateAsync({
        recipientType: "subscribers",
        subscriberIds: selectedRecipients.map((r) => r.id),
        phones: selectedRecipients.map((r) => r.phone!).filter(Boolean),
        message: trimmed,
        templateId: activeTemplateId ?? undefined,
      });

      if (result.failedCount > 0) {
        toast.warning(t("sms.toast.partial", { sent: result.sentCount, failed: result.failedCount }));
      } else {
        toast.success(t("sms.toast.sent", { count: result.sentCount }));
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.unexpectedError"));
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <Heading as="h1">{t("sms.title")}</Heading>
          <Text muted className="mt-2 max-w-3xl">
            {t("sms.subtitle")}
          </Text>
        </div>
      </div>

      <SmsSectionNav />

      {section === "send" ? (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
          <section className="min-w-0 space-y-4 rounded-2xl border border-border/70 bg-surface p-4 shadow-sm ring-1 ring-border/40 sm:p-6">
            <SmsAudienceFilters
              search={search}
              onSearchChange={setSearch}
              audience={audience}
              onAudienceChange={setAudience}
              recipientMode={recipientMode}
              onRecipientModeChange={setRecipientMode}
            />

            {recipientMode === "groups" ? (
              <SmsGroupSendSection
                groups={groups}
                selectedGroupId={selectedGroupId}
                onGroupChange={setSelectedGroupId}
              />
            ) : null}

            {recipientMode === "subscribers" || recipientMode === "customers" ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Text muted className="text-sm">
                    {t("sms.table.sectionSubtitle", {
                      count: filteredRows.length,
                      selected: selectedIds.size,
                    })}
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
                      {t("sms.table.selectAll")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIds(new Set())}
                      disabled={selectedIds.size === 0}
                    >
                      {t("sms.table.clearSelection")}
                    </Button>
                  </div>
                </div>

                {recipientsLoading ? (
                  <LoadingState layout="table" variant="section" />
                ) : isError ? (
                  <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                    <Text muted>
                      {error instanceof ApiError ? error.message : t("common.unexpectedError")}
                    </Text>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                      {t("common.retry")}
                    </Button>
                  </div>
                ) : (
                  <SmsRecipientTable
                    rows={filteredRows}
                    selectedIds={selectedIds}
                    onToggleRow={toggleRow}
                    onToggleAll={toggleAll}
                  />
                )}
              </>
            ) : null}
          </section>

          <SmsComposePanel
            className="min-w-0"
            recipientMode={recipientMode}
            message={message}
            onMessageChange={setMessage}
            templates={templates}
            activeTemplateId={activeTemplateId}
            onTemplateChange={handleTemplateChange}
            customPhone={customPhone}
            onCustomPhoneChange={setCustomPhone}
            recipientCount={recipientCount}
            groupName={selectedGroup?.name ?? null}
            onSend={handleSend}
            isSending={sendMutation.isPending}
            canSend={canManage}
          />
        </div>
      ) : null}

      {section === "groups" ? (
        <section className="min-w-0 rounded-2xl border border-border/70 bg-surface p-4 shadow-sm ring-1 ring-border/40 sm:p-6">
          <SmsGroupsPanel canManage={canManage} />
        </section>
      ) : null}

      {section === "logs" ? (
        <section className="min-w-0 space-y-4 rounded-2xl border border-border/70 bg-surface p-4 shadow-sm ring-1 ring-border/40 sm:p-6">
          <Text muted className="text-sm">{t("sms.logs.subtitle")}</Text>
          {logsQuery.isLoading ? (
            <LoadingState layout="table" variant="section" />
          ) : logsQuery.isError ? (
            <div className="text-center">
              <Text muted>{t("common.unexpectedError")}</Text>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => logsQuery.refetch()}>
                {t("common.retry")}
              </Button>
            </div>
          ) : (
            <>
              <SmsLogsTable rows={logsQuery.data?.items ?? []} />
              {(logsQuery.data?.total ?? 0) > (logsQuery.data?.limit ?? 50) ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logsPage <= 1}
                    onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                  >
                    {t("sms.logs.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logsPage * (logsQuery.data?.limit ?? 50) >= (logsQuery.data?.total ?? 0)}
                    onClick={() => setLogsPage((p) => p + 1)}
                  >
                    {t("sms.logs.next")}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      {section === "templates" ? (
        <section className="min-w-0 rounded-2xl border border-border/70 bg-surface p-4 shadow-sm ring-1 ring-border/40 sm:p-6">
          <SmsTemplatesPanel
            templates={templates}
            canManage={canManage}
            isLoading={templatesQuery.isLoading}
          />
        </section>
      ) : null}
    </div>
  );
}
