"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastItem extends Required<Pick<ToastInput, "title" | "variant">> {
  id: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (input: ToastInput) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: string }
> = {
  success: {
    container: "bg-[#16A34A] border-[#15803D] border-b-[#15803D] text-[#FFFFFF]",
    icon: "check_circle",
  },
  error: {
    container: "bg-[#E11D48] border-[#BE123C] border-b-[#BE123C] text-[#FFFFFF]",
    icon: "error",
  },
  warning: {
    container: "bg-[#D97706] border-[#B45309] border-b-[#B45309] text-[#FFFFFF]",
    icon: "warning",
  },
  info: {
    container: "bg-[#0284C7] border-[#0369A1] border-b-[#0369A1] text-[#FFFFFF]",
    icon: "info",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismissToast = useCallback((id: string) => {
    const existing = timersRef.current.get(id);
    if (existing) {
      clearTimeout(existing);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      durationMs = 3500,
    }: ToastInput) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((prev) => [...prev, { id, title, description, variant }]);

      if (durationMs > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, durationMs);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-2.5 sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 sm:w-[360px]"
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border-2 border-b-[5px] p-3.5 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
                style.container
              )}
            >
              <Icon name={style.icon} size="md" filled className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold leading-5">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-0.5 font-sans text-[13px] font-medium leading-[18px]">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border-2 border-[#E2E8F0] border-b-[3px] border-b-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] transition-transform duration-100 cursor-pointer active:translate-y-[1px] active:border-b-2"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}
