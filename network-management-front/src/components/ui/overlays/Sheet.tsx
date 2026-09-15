import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LG_MEDIA_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  /** Accessible label for the close control area */
  ariaLabel?: string;
}

export function Sheet({ open, onClose, children, className, ariaLabel = "Close" }: SheetProps) {
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);

  useEffect(() => {
    if (!open || isDesktop) return;

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
  }, [open, onClose, isDesktop]);

  if (!open || isDesktop) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:hidden"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "dashboard-sidebar fixed inset-y-0 start-0 z-50 flex w-[min(100vw-2.5rem,18rem)] flex-col overflow-hidden text-sidebar-foreground shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          className,
        )}
      >
        {children}
      </aside>
    </>,
    document.body,
  );
}

interface SheetHeaderProps {
  children: ReactNode;
  onClose: () => void;
  closeLabel: string;
  className?: string;
}

export function SheetHeader({ children, onClose, closeLabel, className }: SheetHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="rounded-lg p-2 text-sidebar-foreground transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
