import { useEffect, useRef } from "react";

type PopupWindowProps = {
  children: React.ReactNode;
  onClose: () => void;
  ariaLabel: string;
  cardClassName?: string;
  overlayClassName?: string;
};

const defaultOverlayClassName: string =
  "fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-md p-4";
// "w-screen h-lvh fixed top-0 left-0 flex justify-center items-center bg-black/80 backdrop-blur-xs z-40";

const defaultCardClassName: string =
  "relative w-full max-w-4xl bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden";

export default function ModalWindow({
  children,
  onClose,
  ariaLabel,
  cardClassName = defaultCardClassName,
  overlayClassName = defaultOverlayClassName,
}: PopupWindowProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    );
    firstFocusable?.focus();

    return () => returnFocusRef.current?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    ));
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={overlayClassName} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        ref={dialogRef}
        className={cardClassName}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
}
