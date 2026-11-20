"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AccountSettingsModal } from "@/components/layout/AccountSettingsModal";
import { Button, Icon } from "@/components/ui";
import type { WorkspaceUserProfile } from "@/lib/auth-guard";
import { SPRING_PILL } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Navbar({ user }: { user: WorkspaceUserProfile }) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: "dashboard",
      active: pathname === "/",
    },
    {
      href: "/projects",
      label: "Daftar Proyek",
      icon: "folder",
      active: pathname.startsWith("/projects"),
    },
  ];

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
            className="flex flex-wrap items-center gap-2.5"
          >
            <div className="flex items-center rounded-2xl border-2 border-border-soft border-b-[4px] border-b-border-lip bg-surface-container p-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-flex h-8 items-center gap-1.5 rounded-xl px-3.5 font-display text-[13px] font-bold transition-colors duration-150",
                    item.active
                      ? "text-on-primary"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  {item.active && (
                    <motion.span
                      layoutId="navbar-nav-pill"
                      transition={SPRING_PILL}
                      className="absolute inset-0 rounded-xl bg-primary"
                    />
                  )}
                  <Icon
                    name={item.icon}
                    size="sm"
                    className="relative z-10"
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              ))}
            </div>

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
