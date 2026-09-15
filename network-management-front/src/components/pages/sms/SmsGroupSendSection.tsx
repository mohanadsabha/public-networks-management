import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/typography";
import { SmsRecipientTable } from "@/components/pages/sms/SmsRecipientTable";
import type { SmsCustomGroup, SmsRecipient } from "@/types/sms";

interface SmsGroupSendSectionProps {
  groups: SmsCustomGroup[];
  selectedGroupId: number | null;
  onGroupChange: (groupId: number | null) => void;
}

function membersAsRecipients(group: SmsCustomGroup | null): SmsRecipient[] {
  if (!group) return [];
  return group.members.map((member) => ({
    id: member.subscriberId,
    lineId: member.lineId,
    fullName: member.fullName,
    phone: member.phone,
    username: member.username,
    balance: 0,
    daysLeft: null,
    isSuspended: false,
  }));
}

export function SmsGroupSendSection({
  groups,
  selectedGroupId,
  onGroupChange,
}: SmsGroupSendSectionProps) {
  const { t } = useTranslation();
  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const rows = membersAsRecipients(selectedGroup);
  const withPhone = rows.filter((row) => row.phone?.trim());

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground" htmlFor="sms-group-select">
          {t("sms.groups.send.selectLabel")}
        </label>
        <select
          id="sms-group-select"
          value={selectedGroupId ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            onGroupChange(value ? Number(value) : null);
          }}
          className="flex h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm shadow-sm focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15"
        >
          <option value="">{t("sms.groups.send.selectPlaceholder")}</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name} ({group.members.length})
            </option>
          ))}
        </select>
        {groups.length === 0 ? (
          <Text muted className="text-xs">
            {t("sms.groups.send.empty")}{" "}
            <Link to="/sms/groups" className="font-medium text-primary hover:underline">
              {t("sms.groups.send.createLink")}
            </Link>
          </Text>
        ) : (
          <Text muted className="text-xs">
            <Link to="/sms/groups" className="font-medium text-primary hover:underline">
              {t("sms.groups.send.manageLink")}
            </Link>
          </Text>
        )}
      </div>

      {selectedGroup ? (
        <>
          {selectedGroup.description ? (
            <Text muted className="text-sm">{selectedGroup.description}</Text>
          ) : null}
          <Text muted className="text-sm">
            {t("sms.groups.send.membersSummary", {
              total: rows.length,
              withPhone: withPhone.length,
            })}
          </Text>
          <SmsRecipientTable
            rows={rows}
            selectedIds={new Set(rows.map((row) => row.id))}
            onToggleRow={() => {}}
            onToggleAll={() => {}}
            readOnly
          />
        </>
      ) : null}
    </div>
  );
}
