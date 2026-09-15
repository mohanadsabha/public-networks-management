import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/buttons";
import { Heading } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  closeLabel?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  closeLabel = "Close",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-border bg-surface shadow-dropdown sm:max-h-[85dvh] sm:max-w-lg sm:rounded-2xl",
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <Heading as="h2" id="modal-title" className="text-lg">
            {title}
          </Heading>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  isLoading?: boolean;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <ModalFooterButton variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </ModalFooterButton>
          <ModalFooterButton
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </ModalFooterButton>
        </>
      }
    >
      <p className="text-sm leading-6 text-muted-foreground">{message}</p>
    </Modal>
  );
}

interface ModalFooterButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "danger";
  disabled?: boolean;
  isLoading?: boolean;
  type?: "button" | "submit";
  form?: string;
  className?: string;
}

export function ModalFooterButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  isLoading,
  type = "button",
  form,
  className,
}: ModalFooterButtonProps) {
  return (
    <Button
      type={type}
      form={form}
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      isLoading={isLoading}
      className={cn("w-full sm:w-auto", className)}
    >
      {children}
    </Button>
  );
}
