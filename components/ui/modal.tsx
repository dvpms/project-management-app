"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button, IconButton, type ButtonVariant } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  headerTone?: "white" | "blue" | "rose" | "amber" | "emerald";
  children: ReactNode;
  footer?: ReactNode;
}

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const HEADER_TONES: Record<NonNullable<ModalProps["headerTone"]>, string> = {
  white: "bg-surface-container",
  blue: "bg-surface-subtle",
  rose: "bg-surface-subtle",
  amber: "bg-surface-subtle",
  emerald: "bg-surface-subtle",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  headerTone = "white",
  children,
  footer,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      {/* Standar modal scrim gelap untuk meredupkan latar */}
      <div
        className="fixed inset-0 bg-[#0F172A]/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl border-2 border-border-soft border-b-[6px] border-b-border-lip bg-surface-container text-ink",
          SIZE_CLASSES[size]
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-3 border-b-2 border-border-soft px-6 py-4",
            HEADER_TONES[headerTone]
          )}
        >
          <div>
            <h2
              id={titleId}
              className="font-display text-[20px] font-bold leading-6 tracking-[-0.015em] text-ink"
            >
              {title}
            </h2>
            {description && (
              <p
                id={descId}
                className="mt-1 font-sans text-[13px] font-medium leading-[18px] text-ink-muted"
              >
                {description}
              </p>
            )}
          </div>
          <IconButton
            ref={closeRef}
            size="sm"
            variant="outline"
            label="Tutup dialog"
            icon={<Icon name="close" size="sm" />}
            onClick={onClose}
          />
        </div>

        <div className="overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t-2 border-border-soft bg-surface-subtle px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "warning" | "primary";
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const CONFIRM_BUTTON_VARIANT: Record<
  NonNullable<ConfirmOptions["tone"]>,
  ButtonVariant
> = {
  danger: "danger",
  warning: "warning",
  primary: "primary",
};

const CONFIRM_HEADER_TONE: Record<
  NonNullable<ConfirmOptions["tone"]>,
  NonNullable<ModalProps["headerTone"]>
> = {
  danger: "rose",
  warning: "amber",
  primary: "blue",
};

const ConfirmContext = createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

export function ConfirmModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleResolve = useCallback(
    (accepted: boolean) => {
      if (!state) return;
      state.resolve(accepted);
      setState(null);
    },
    [state]
  );

  const tone = state?.tone ?? "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(state)}
        onClose={() => handleResolve(false)}
        title={state?.title ?? ""}
        size="sm"
        headerTone={CONFIRM_HEADER_TONE[tone]}
        footer={
          <>
            <Button variant="outline" onClick={() => handleResolve(false)}>
              {state?.cancelLabel ?? "Batal"}
            </Button>
            <Button
              variant={CONFIRM_BUTTON_VARIANT[tone]}
              onClick={() => handleResolve(true)}
            >
              {state?.confirmLabel ?? "Ya, Lanjutkan"}
            </Button>
          </>
        }
      >
        <p className="font-sans text-[15px] font-medium leading-[22px] text-ink">
          {state?.message}
        </p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm harus digunakan di dalam ConfirmModalProvider");
  }
  return context;
}
