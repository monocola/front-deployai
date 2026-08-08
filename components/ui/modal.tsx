"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  iconTone?: "danger" | "success" | "default";
  className?: string;
  disableClose?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  icon,
  iconTone = "default",
  className,
  disableClose = false,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !disableClose) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(frame);
    };
  }, [open, onOpenChange, disableClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity"
        disabled={disableClose}
        onClick={() => {
          if (!disableClose) onOpenChange(false);
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40 outline-none",
          "duration-150 ease-out",
          className
        )}
        style={{
          animation: "manager-modal-in 160ms ease-out",
        }}
      >
        <div className="flex items-start gap-4 border-b border-border px-5 pb-4 pt-5">
          {icon && (
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                iconTone === "danger" && "border-error/30 bg-error/10 text-error",
                iconTone === "success" && "border-success/30 bg-success/10 text-success",
                iconTone === "default" && "border-primary/30 bg-primary/10 text-primary"
              )}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          {!disableClose && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 shrink-0 p-0"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {children && <div className="px-5 py-4">{children}</div>}

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-border bg-card-elevated/40 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
