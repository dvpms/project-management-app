"use client";

import { useCallback, type ReactNode } from "react";
import { updateThemeAction } from "@/actions/user-actions";
import {
  ConfirmModalProvider,
  ThemeProvider,
  ToastProvider,
} from "@/components/ui";
import type { ThemeId } from "@/lib/theme-presets";

export function WorkspaceProviders({
  initialTheme,
  children,
}: {
  initialTheme: ThemeId;
  children: ReactNode;
}) {
  const handlePersistTheme = useCallback(async (nextTheme: ThemeId) => {
    const result = await updateThemeAction(nextTheme);
    if (!result.ok) {
      console.error("Gagal menyinkronkan tema ke database:", result.error);
    }
  }, []);

  return (
    <ThemeProvider
      initialTheme={initialTheme}
      onPersistTheme={handlePersistTheme}
    >
      <ToastProvider>
        <ConfirmModalProvider>{children}</ConfirmModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
