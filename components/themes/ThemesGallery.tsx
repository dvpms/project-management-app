"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, Chip, Icon, SurfaceColumn } from "@/components/ui";
import { THEME_OPTIONS, type ThemeId, type ThemeOption } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";

function ThemeMiniPreview({
  option,
  selected,
  onSelect,
}: {
  option: ThemeOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border-2 bg-[#FFFFFF] transition-all duration-150",
        selected
          ? "border-[#2563EB] ring-4 ring-[#DBEAFE]"
          : "border-[#E2E8F0] hover:border-[#94A3B8]"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] p-5">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h2 className="font-display text-[20px] font-extrabold text-[#0F172A]">
              {option.name}
            </h2>
            <Badge variant={option.badgeVariant} mono>
              {option.tag}
            </Badge>
          </div>
          <p className="font-sans text-[13px] font-medium text-[#64748B]">
            {option.description}
          </p>
        </div>

        <div className="flex gap-1.5 pt-1">
          {option.swatches.map((hex) => (
            <span
              key={hex}
              title={hex}
              style={{ backgroundColor: hex }}
              className="h-6 w-6 rounded-full border border-[#CBD5E1]"
            />
          ))}
        </div>
      </div>

      {/* Live preview canvas scoped via data-theme */}
      <div
        data-theme={option.id}
        className="flex flex-1 flex-col gap-4 bg-surface p-5 text-ink"
      >
        <div className="flex items-center justify-between rounded-2xl border-2 border-border-soft bg-surface-container px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-primary-lip border-b-[4px] bg-primary text-on-primary">
              <Icon name="view_kanban" size="sm" />
            </div>
            <span className="font-display text-[15px] font-extrabold text-ink">
              Space Kanban
            </span>
          </div>
          <Button size="sm" variant="primary" leftIcon={<Icon name="add" size="sm" />} onClick={onSelect}>
            Tugas Baru
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip active tone="theme" className="px-3 py-1 text-[11px]">
            Semua Proyek (3)
          </Chip>
          <Chip tone="theme" className="px-3 py-1 text-[11px]">
            Space Kanban
          </Chip>
          <Chip tone="theme" className="px-3 py-1 text-[11px]">
            API Gateway
          </Chip>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SurfaceColumn className="flex flex-col gap-2.5 p-3.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-[13px] font-bold text-ink">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7]" />
                Sedang dikerjakan
              </span>
              <span className="font-mono text-[11px] font-bold text-ink-muted">
                2
              </span>
            </div>
            <Card interactive className="flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <Badge variant="sky">Space Kanban</Badge>
                <Badge variant="danger">Tinggi</Badge>
              </div>
              <p className="font-display text-[13px] font-bold text-ink">
                Setup Skema Prisma 7
              </p>
              <span className="font-mono text-[10px] font-bold text-ink-muted">
                20 NOV 2026 · M1
              </span>
            </Card>
          </SurfaceColumn>

          <SurfaceColumn className="flex flex-col gap-2.5 p-3.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-[13px] font-bold text-ink">
                <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
                Selesai
              </span>
              <span className="font-mono text-[11px] font-bold text-ink-muted">
                1
              </span>
            </div>
            <Card interactive className="flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">API Gateway</Badge>
                <Badge variant="success">Selesai</Badge>
              </div>
              <p className="font-display text-[13px] font-bold text-ink">
                Middleware Rate Limiter
              </p>
            </Card>
          </SurfaceColumn>
        </div>

        <Card className="flex flex-col gap-2 rounded-3xl p-4">
          <div className="flex items-center justify-between border-b border-border-soft pb-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#0284C7]" />
              <span className="font-display text-[14px] font-bold text-ink">
                Space Kanban
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-ink-muted">
              3 aktif
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-display text-[13px] font-bold text-ink">
              Drag-and-drop board
            </span>
            <Badge variant="neutral">Belum dikerjakan</Badge>
          </div>
        </Card>
      </div>

      <div
        data-theme={option.id}
        className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#FFFFFF] px-5 py-4"
      >
        <Button
          size="sm"
          variant={selected ? "primary" : "outline"}
          onClick={onSelect}
        >
          {selected ? "Terpilih" : "Tandai Pilihan"}
        </Button>

        <Link
          href={`/prototype?theme=${option.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border-2 border-primary-lip border-b-[5px] bg-primary px-3.5 font-display text-[13px] font-bold text-on-primary transition-all duration-100 hover:bg-primary-hover active:translate-y-[3px] active:border-b-2"
        >
          Coba Live di Prototipe
          <Icon name="arrow_forward" size="sm" />
        </Link>
      </div>
    </article>
  );
}

export function ThemesGallery() {
  const [selectedId, setSelectedId] = useState<ThemeId>("sky-blue");

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-6 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="primary" mono>
              SKY TACTILE 3D · 7 TEMA WARNA
            </Badge>
            <h1 className="mt-2 font-display text-[32px] font-extrabold leading-10 tracking-[-0.02em] text-[#0F172A]">
              Galeri Tema Warna Space Kanban
            </h1>
            <p className="mt-1 font-sans text-[15px] font-medium text-[#64748B]">
              Semua tema memakai gaya <strong className="text-[#0F172A]">Sky Tactile 3D</strong> yang seragam dan akan tersedia di pemilih tema Navbar.
            </p>
          </div>

          <Link
            href={`/prototype?theme=${selectedId}`}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#1D4ED8] border-b-[5px] bg-[#2563EB] px-5 py-2.5 font-display text-[14px] font-bold text-[#FFFFFF] transition-all duration-100 active:translate-y-[2px] active:border-b-2"
          >
            Buka Prototipe Penuh
            <Icon name="open_in_new" size="sm" />
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {THEME_OPTIONS.map((option) => (
            <ThemeMiniPreview
              key={option.id}
              option={option}
              selected={selectedId === option.id}
              onSelect={() => setSelectedId(option.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
