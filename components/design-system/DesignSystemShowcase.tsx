"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  ConfirmModalProvider,
  FormField,
  Icon,
  IconButton,
  Input,
  Modal,
  Select,
  SurfaceColumn,
  Textarea,
  ThemeProvider,
  ThemeSwitcher,
  ToastProvider,
  useConfirm,
  useToast,
} from "@/components/ui";

const COLOR_SWATCHES = [
  { name: "Surface", hex: "#F7F8FC", text: "#0F172A" },
  { name: "Column", hex: "#EEF2F6", text: "#0F172A" },
  { name: "Card", hex: "#FFFFFF", text: "#0F172A" },
  { name: "Primary 3D", hex: "#2563EB", text: "#FFFFFF" },
  { name: "Success", hex: "#16A34A", text: "#FFFFFF" },
  { name: "Info", hex: "#0284C7", text: "#FFFFFF" },
  { name: "Warning", hex: "#D97706", text: "#FFFFFF" },
  { name: "Danger", hex: "#E11D48", text: "#FFFFFF" },
  { name: "Emerald", hex: "#059669", text: "#FFFFFF" },
  { name: "Orange", hex: "#EA580C", text: "#FFFFFF" },
  { name: "Teal", hex: "#0D9488", text: "#FFFFFF" },
  { name: "Neutral", hex: "#475569", text: "#FFFFFF" },
] as const;

function ShowcaseContent() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [sampleTitle, setSampleTitle] = useState("Integrasi Google OAuth Auth.js");

  const handleConfirmTest = async () => {
    const ok = await confirm({
      title: "Arsipkan Tugas Selesai?",
      message:
        "Seluruh tugas di kolom Selesai akan dipindahkan ke Riwayat Arsip tanpa mengurangi progres Milestone.",
      confirmLabel: "Ya, Arsipkan",
      cancelLabel: "Batal",
      tone: "warning",
    });

    showToast(
      ok
        ? {
            title: "Tugas diarsipkan!",
            description: "Papan Space Kanban kembali rapi.",
            variant: "success",
          }
        : {
            title: "Dibatalkan",
            description: "Tidak ada tugas yang diarsipkan.",
            variant: "info",
          }
    );
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border-2 border-border-soft border-b-[6px] border-b-border-lip bg-surface-container p-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="primary" mono>
              SKY TACTILE 3D
            </Badge>
            <Badge variant="emerald" icon={<Icon name="palette" size="sm" />}>
              7 Tema Warna Solid
            </Badge>
          </div>
          <h1 className="font-display text-[32px] font-extrabold leading-10 tracking-[-0.02em] text-ink">
            Design System Space Kanban
          </h1>
          <p className="mt-1 font-sans text-[15px] font-medium text-ink-muted">
            Modern, empuk, 3D taktil, dan lega di mata.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeSwitcher />
          <Button
            variant="primary"
            leftIcon={<Icon name="notifications_active" size="sm" />}
            onClick={() =>
              showToast({
                title: "Berhasil disimpan!",
                description: "Perubahan tugas langsung tersinkron ke proyek.",
                variant: "success",
              })
            }
          >
            Tes Toast
          </Button>
          <Button
            variant="outline"
            leftIcon={<Icon name="open_in_new" size="sm" />}
            onClick={() => setFormModalOpen(true)}
          >
            Tes Form Modal
          </Button>
          <Button
            variant="danger"
            leftIcon={<Icon name="warning" size="sm" />}
            onClick={handleConfirmTest}
          >
            Tes Confirm Modal
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[22px] font-bold leading-7 tracking-[-0.015em]">
          1. Palet Warna Solid
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {COLOR_SWATCHES.map((swatch) => (
            <div
              key={swatch.name}
              style={{ backgroundColor: swatch.hex, color: swatch.text }}
              className="flex flex-col justify-between rounded-2xl border-2 border-[#E2E8F0] border-b-4 border-b-[#CBD5E1] p-4"
            >
              <span className="font-display text-[14px] font-bold">
                {swatch.name}
              </span>
              <span className="mt-4 font-mono text-[11px] font-bold">
                {swatch.hex}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-[22px] font-bold leading-7 tracking-[-0.015em]">
          2. Tipografi &amp; Skala
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-3 py-5">
            <p className="font-display text-[32px] font-extrabold leading-10 tracking-[-0.02em]">
              Display Large — Nunito 32px ExtraBold
            </p>
            <p className="font-display text-[22px] font-bold leading-7 tracking-[-0.015em]">
              Headline Large — Nunito 22px Bold
            </p>
            <p className="font-sans text-[15px] font-medium leading-[22px]">
              Body Large — Plus Jakarta Sans 15px Medium untuk deskripsi tugas dan
              catatan proyek yang nyaman dibaca.
            </p>
            <p className="font-mono text-[11px] font-bold leading-4 text-[#64748B]">
              MONO-SM — SPACE MONO 11PX BOLD · #TASK-042 · 18 NOV 2026
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>3. Tombol Interaktif (Tactile 3D)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="primary" leftIcon={<Icon name="add" size="sm" />}>
              Mulai Tugas
            </Button>
            <Button variant="secondary">Simpan Draf</Button>
            <Button variant="outline">Batal</Button>
            <Button variant="success" leftIcon={<Icon name="check" size="sm" />}>
              Selesai!
            </Button>
            <Button variant="warning">Review</Button>
            <Button variant="danger" leftIcon={<Icon name="delete" size="sm" />}>
              Hapus
            </Button>
            <Button variant="info">Detail</Button>
            <IconButton
              variant="outline"
              label="Pengaturan"
              icon={<Icon name="tune" size="md" />}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Badge Solid &amp; Chip Filter 3D</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral">Belum dikerjakan</Badge>
              <Badge variant="info">Sedang dikerjakan</Badge>
              <Badge variant="warning">Review</Badge>
              <Badge variant="success">Selesai!</Badge>
              <Badge variant="danger">Prioritas Tinggi</Badge>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Chip
                active={selectedFilter === "all"}
                tone="blue"
                onClick={() => setSelectedFilter("all")}
              >
                Semua Proyek
              </Chip>
              <Chip
                active={selectedFilter === "p1"}
                tone="sky"
                onClick={() => setSelectedFilter("p1")}
              >
                Space Kanban
              </Chip>
              <Chip
                active={selectedFilter === "p2"}
                tone="emerald"
                onClick={() => setSelectedFilter("p2")}
              >
                API Gateway
              </Chip>
              <Chip
                active={selectedFilter === "p3"}
                tone="orange"
                mono
                onClick={() => setSelectedFilter("p3")}
              >
                Next.js 16
              </Chip>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>5. Form Controls Solid</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FormField label="Judul Tugas" htmlFor="ds-title" required>
              <Input
                id="ds-title"
                value={sampleTitle}
                onChange={(e) => setSampleTitle(e.target.value)}
              />
            </FormField>
            <FormField label="Status Kanban" htmlFor="ds-status">
              <Select id="ds-status" defaultValue="ON_PROGRESS">
                <option value="BACKLOG">Belum dikerjakan</option>
                <option value="ON_PROGRESS">Sedang dikerjakan</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Selesai</option>
              </Select>
            </FormField>
            <FormField
              label="Catatan Markdown"
              htmlFor="ds-desc"
              error="Contoh pesan validasi error."
            >
              <Textarea
                id="ds-desc"
                hasError
                defaultValue="- Setup Prisma adapter PostgreSQL"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Pratinjau Kolom Kanban &amp; Kartu Proyek</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SurfaceColumn className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-[15px] font-bold">
                  Sedang dikerjakan
                </span>
                <span className="font-mono text-[12px] font-bold text-[#64748B]">
                  2
                </span>
              </div>
              <Card interactive className="p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="sky">Space Kanban</Badge>
                  <Badge variant="danger">Tinggi</Badge>
                </div>
                <p className="font-display text-[14px] font-bold">
                  Setup Skema Prisma 7
                </p>
              </Card>
            </SurfaceColumn>

            <Card className="p-4">
              <div className="mb-3 flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                <span className="font-display text-[16px] font-bold">
                  Space Kanban
                </span>
                <Badge variant="success">Aktif</Badge>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                <div className="flex items-center justify-between py-2">
                  <span className="font-sans text-[13px] font-medium">
                    Auth Google OAuth
                  </span>
                  <Badge variant="info">Progres</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="font-sans text-[13px] font-medium">
                    Drag-and-drop board
                  </span>
                  <Badge variant="neutral">Backlog</Badge>
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      </section>

      <Modal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Edit Detail Tugas"
        description="Contoh Form Modal kustom dengan gaya Soft Tactile 3D."
        headerTone="blue"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormModalOpen(false)}>
              Tutup
            </Button>
            <Button
              variant="primary"
              leftIcon={<Icon name="save" size="sm" />}
              onClick={() => {
                setFormModalOpen(false);
                showToast({
                  title: "Perubahan disimpan",
                  description: sampleTitle,
                  variant: "success",
                });
              }}
            >
              Simpan Perubahan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <FormField label="Judul Tugas" htmlFor="modal-title" required>
            <Input
              id="modal-title"
              value={sampleTitle}
              onChange={(e) => setSampleTitle(e.target.value)}
            />
          </FormField>
          <FormField label="Prioritas" htmlFor="modal-priority">
            <Select id="modal-priority" defaultValue="HIGH">
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </Select>
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

export function DesignSystemShowcase() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmModalProvider>
          <ShowcaseContent />
        </ConfirmModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
