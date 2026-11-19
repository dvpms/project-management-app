"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AccountSettingsModal } from "@/components/layout/AccountSettingsModal";
import { Button, Icon } from "@/components/ui";
import type { WorkspaceUserProfile } from "@/lib/auth-guard";
import { cn } from "@/lib/utils";

export function Navbar({ user }: { user: WorkspaceUserProfile }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isDashboard = pathname === "/";
  const isProjects = pathname.startsWith("/projects");

  return (
    <>
      <header className="sticky top-0 z-30 border-b-2 border-border-soft bg-surface-container px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-primary-lip border-b-[4px] bg-primary text-on-primary">
              <Icon name="view_kanban" size="md" />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-display text-[19px] font-extrabold leading-6 tracking-[-0.015em] text-ink">
                {user.workspaceTitle}
              </span>
              {user.workspaceSubtitle && (
                <span className="block truncate font-sans text-[12px] font-medium leading-4 text-ink-muted">
                  {user.workspaceSubtitle}
                </span>
              )}
            </div>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="flex flex-wrap items-center gap-2"
          >
            <Link
              href="/"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-b-[5px] px-3.5 font-display text-[13px] font-bold transition-all duration-100 active:translate-y-[3px] active:border-b-2",
                isDashboard
                  ? "border-primary-lip bg-primary text-on-primary hover:bg-primary-hover"
                  : "border-border-soft border-b-border-lip bg-surface-container text-ink hover:bg-surface-hover"
              )}
            >
              <Icon name="dashboard" size="sm" />
              Dashboard
            </Link>

            <Link
              href="/projects"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-b-[5px] px-3.5 font-display text-[13px] font-bold transition-all duration-100 active:translate-y-[3px] active:border-b-2",
                isProjects
                  ? "border-primary-lip bg-primary text-on-primary hover:bg-primary-hover"
                  : "border-border-soft border-b-border-lip bg-surface-container text-ink hover:bg-surface-hover"
              )}
            >
              <Icon name="folder" size="sm" />
              Daftar Proyek
            </Link>

            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon name="manage_accounts" size="sm" />}
              onClick={() => setSettingsOpen(true)}
            >
              Akun &amp; Tema
            </Button>
          </nav>
        </div>
      </header>

      <AccountSettingsModal
        open={settingsOpen}
        userEmail={user.email}
        userName={user.name}
        workspaceTitle={user.workspaceTitle}
        workspaceSubtitle={user.workspaceSubtitle}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
