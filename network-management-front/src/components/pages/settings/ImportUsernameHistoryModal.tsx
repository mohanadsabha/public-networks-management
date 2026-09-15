import { FileSpreadsheet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalFooterButton } from "@/components/ui/modals";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

interface ImportUsernameHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
  isSubmitting?: boolean;
}

export function ImportUsernameHistoryModal({
  open,
  onClose,
  onImport,
  isSubmitting = false,
}: ImportUsernameHistoryModalProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) setFile(null);
  }, [open]);

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  const handleImport = () => {
    if (!file) return;
    onImport(file);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("settings.excel.usernameHistory.importModalTitle")}
      closeLabel={t("common.cancel")}
      footer={
        <>
          <ModalFooterButton variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </ModalFooterButton>
          <ModalFooterButton onClick={handleImport} disabled={!file} isLoading={isSubmitting}>
            {t("settings.excel.usernameHistory.importSubmit")}
          </ModalFooterButton>
        </>
      }
    >
      <div className="space-y-4">
        <Text muted className="text-sm">
          {t("settings.excel.usernameHistory.importHint")}
        </Text>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border",
            "bg-muted/20 px-4 py-8 transition-colors hover:border-primary/40 hover:bg-muted/40",
          )}
        >
          <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {file ? file.name : t("settings.excel.usernameHistory.selectFile")}
          </span>
          <span className="text-xs text-muted-foreground">.xlsx, .xls</span>
        </button>
      </div>
    </Modal>
  );
}
