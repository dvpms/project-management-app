"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import { MODAL_TRANSITION } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ModalHeaderTone = "white" | "blue" | "rose" | "amber" | "emerald";
export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  headerTone?: ModalHeaderTone;
  children: ReactNode;
  footer?: ReactNode;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

const HEADER_TONES: Record<ModalHeaderTone, string> = {
  white: "bg-surface-container",
  blue: "bg-surface-subtle",
  rose: "bg-surface-subtle",
  amber: "bg-surface-subtle",
  emerald: "bg-surface-subtle",
};

export function ModalShell({
  open,
  onClose,
  size = "md",
  labelledBy,
  describedBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  labelledBy?: string;
  describedBy?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence propagate>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          {/* Standar modal scrim gelap untuk meredupkan latar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-[#0F172A]/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={MODAL_TRANSITION}
            className={cn(
              "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl border-2 border-border-soft border-b-[6px] border-b-border-lip bg-surface-container text-ink",
              SIZE_CLASSES[size]
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ModalHeader({
  title,
  description,
  headerTone = "white",
  titleId,
  descId,
  onClose,
  autoFocusClose = true,
}: {
  title: string;
  description?: string;
  headerTone?: ModalHeaderTone;
  titleId?: string;
  descId?: string;
  onClose: () => void;
  autoFocusClose?: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocusClose) {
      closeRef.current?.focus();
    }
  }, [autoFocusClose]);

  return (
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
  );
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="overflow-y-auto px-6 py-5">{children}</div>;
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5 border-t-2 border-border-soft bg-surface-subtle px-6 py-4">
      {children}
    </div>
  );
}

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

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      size={size}
      labelledBy={titleId}
      describedBy={description ? descId : undefined}
    >
      <ModalHeader
        title={title}
        description={description}
        headerTone={headerTone}
        titleId={titleId}
        descId={descId}
        onClose={onClose}
      />
      <ModalBody>{children}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </ModalShell>
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
  ModalHeaderTone
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
  const [open, setOpen] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
      setOpen(true);
    });
  }, []);

  const handleResolve = useCallback(
    (accepted: boolean) => {
      if (!state || !open) return;
      setOpen(false);
      state.resolve(accepted);
    },
    [state, open]
  );

  const tone = state?.tone ?? "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={open}
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
