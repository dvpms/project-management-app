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
import {
  DEFAULT_THEME_ID,
  THEME_MAP,
  THEME_OPTIONS,
  isValidThemeId,
  type ThemeId,
} from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "space-kanban-theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (next: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  initialTheme,
  onPersistTheme,
  children,
}: {
  initialTheme?: ThemeId;
  onPersistTheme?: (theme: ThemeId) => void | Promise<void>;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (initialTheme && isValidThemeId(initialTheme)) return initialTheme;
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isValidThemeId(saved)) return saved;
    }
    return DEFAULT_THEME_ID;
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Abaikan jika storage diblokir
    }
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeId) => {
      setThemeState(next);
      if (onPersistTheme) {
        void onPersistTheme(next);
      }
    },
    [onPersistTheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  }
  return ctx;
}

export function ThemeSwitcher({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const active = THEME_MAP[theme] ?? THEME_MAP[DEFAULT_THEME_ID];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="inline-flex h-9 items-center gap-2 rounded-xl border-2 border-border-soft border-b-[4px] border-b-border-lip bg-surface-container px-3 font-display text-[13px] font-bold text-ink transition-all duration-100 hover:bg-surface-hover cursor-pointer active:translate-y-[2px] active:border-b-2"
      >
        <span
          aria-hidden="true"
          style={{ backgroundColor: active.primaryHex }}
          className="h-3.5 w-3.5 shrink-0 rounded-full"
        />
        {!compact && <span className="hidden sm:inline">{active.name}</span>}
        <Icon name={open ? "expand_less" : "palette"} size="sm" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Pilih tema warna"
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border-2 border-border-soft border-b-[5px] border-b-border-lip bg-surface-container p-2"
        >
          <p className="px-2.5 py-1.5 font-mono text-[10px] font-bold text-ink-muted">
            TEMA WARNA (SKY TACTILE 3D)
          </p>
          <div className="flex flex-col gap-1">
            {THEME_OPTIONS.map((option) => {
              const isSelected = option.id === theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setTheme(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-primary text-on-primary"
                      : "text-ink hover:bg-surface-hover"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: option.primaryHex }}
                      className="h-4 w-4 shrink-0 rounded-full border-2 border-[#FFFFFF]"
                    />
                    <span className="truncate font-display text-[13px] font-bold">
                      {option.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {option.isDark && (
                      <Icon name="dark_mode" size="sm" className="text-[14px]" />
                    )}
                    {isSelected && <Icon name="check" size="sm" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
