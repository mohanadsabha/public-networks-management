import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";

interface SubscribersImportModalProps {
  open: boolean;
  onClose: () => void;
}

/** Placeholder until API — documents expected Excel columns for backend. */
export function SubscribersImportModal({ open, onClose }: SubscribersImportModalProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={t("subscribers.import.title")} className="sm:max-w-md">
      <Text muted className="text-sm leading-relaxed">
        {t("subscribers.import.hint")}
      </Text>
      <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-muted-foreground">
        <li>{t("subscribers.import.columns.id")}</li>
        <li>{t("subscribers.import.columns.username")}</li>
        <li>{t("subscribers.import.columns.password")}</li>
        <li>{t("subscribers.import.columns.fullName")}</li>
        <li>{t("subscribers.import.columns.phone")}</li>
        <li>{t("subscribers.import.columns.line")}</li>
        <li>{t("subscribers.import.columns.speed")}</li>
      </ul>
      <div className="mt-6 flex justify-end">
        <ModalFooterButton variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </ModalFooterButton>
      </div>
    </Modal>
  );
}
