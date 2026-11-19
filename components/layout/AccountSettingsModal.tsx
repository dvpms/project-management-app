"use client";

import { useState, useTransition } from "react";
import { signOutAction } from "@/actions/auth-actions";
import { updateWorkspaceIdentityAction } from "@/actions/user-actions";
import {
  Button,
  FormField,
  Icon,
  Input,
  Modal,
  useConfirm,
  useTheme,
  useToast,
} from "@/components/ui";
import { THEME_OPTIONS } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

interface AccountSettingsModalProps {
  open: boolean;
  userEmail: string | null;
  userName: string | null;
  workspaceTitle: string;
  workspaceSubtitle: string;
  onClose: () => void;
}

function AccountSettingsModalInner({
  userEmail,
  userName,
  workspaceTitle,
  workspaceSubtitle,
  onClose,
}: Omit<AccountSettingsModalProps, "open">) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(workspaceTitle);
  const [subtitle, setSubtitle] = useState(workspaceSubtitle);
  const [titleError, setTitleError] = useState("");

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("Judul workspace wajib diisi.");
      return;
    }

    startTransition(async () => {
      const result = await updateWorkspaceIdentityAction({
        workspaceTitle: trimmedTitle,
        workspaceSubtitle: subtitle.trim(),
      });

      if (!result.ok) {
        showToast({
          title: "Gagal menyimpan",
          description: result.error ?? "Terjadi kesalahan.",
          variant: "error",
        });
        return;
      }

      showToast({
        title: "Pengaturan disimpan",
        variant: "success",
      });
      onClose();
    });
  };

  const handleSignOut = async () => {
    onClose();
    const ok = await confirm({
      title: `Keluar dari ${workspaceTitle}?`,
      message: "Anda perlu masuk kembali dengan Google untuk mengakses proyek.",
      confirmLabel: "Ya, Keluar",
      cancelLabel: "Tetap di Sini",
      tone: "primary",
    });

    if (ok) {
      await signOutAction();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Pengaturan Akun & Workspace"
      description={userEmail ? `${userName ?? "Pengguna"} (${userEmail})` : undefined}
      size="md"
      headerTone="blue"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Icon name="logout" size="sm" />}
            onClick={handleSignOut}
            disabled={isPending}
          >
            Keluar Akun
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Tutup
            </Button>
            <Button
              variant="primary"
              leftIcon={<Icon name="save" size="sm" />}
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3.5">
          <FormField
            label="Judul pada Navbar"
            htmlFor="workspace-title"
            required
            error={titleError}
          >
            <Input
              id="workspace-title"
              hasError={Boolean(titleError)}
              value={title}
              maxLength={40}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              placeholder="Space Kanban"
            />
          </FormField>

          <FormField
            label="Deskripsi Singkat (di bawah judul)"
            htmlFor="workspace-subtitle"
          >
            <Input
              id="workspace-subtitle"
              value={subtitle}
              maxLength={100}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Kelola proyek & tugas harian secara sinkron"
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-2.5 border-t-2 border-border-soft pt-4">
          <span className="font-display text-[14px] font-bold text-ink">
            Tema Warna (Sky Tactile 3D)
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {THEME_OPTIONS.map((option) => {
              const isSelected = option.id === theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-2xl border-2 border-b-[4px] px-3.5 py-2.5 text-left transition-all duration-100 cursor-pointer active:translate-y-[2px] active:border-b-2",
                    isSelected
                      ? "border-primary-lip bg-primary text-on-primary"
                      : "border-border-soft border-b-border-lip bg-surface-container text-ink hover:bg-surface-hover"
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
                  {isSelected && <Icon name="check" size="sm" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function AccountSettingsModal(props: AccountSettingsModalProps) {
  if (!props.open) return null;
  const modalKey = `${props.workspaceTitle}-${props.workspaceSubtitle}`;
  return <AccountSettingsModalInner key={modalKey} {...props} />;
}
