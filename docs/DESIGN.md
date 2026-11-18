# DESIGN.md — SpaceFlow Soft Tactile 3D × Apple Interaction Craft

Dokumen acuan resmi sistem desain aplikasi **Space Kanban**. Seluruh implementasi komponen, halaman, animasi, dan alur interaksi **wajib mengikuti dokumen ini**.

Desain ini memadukan estetika **Soft Tactile 3D** (modern, empuk, *cute* sederhana ala Duolingo/stationery modern) dengan prinsip interaksi **Apple Design** (*Designing Fluid Interfaces* & *8 Principles of Great Design*) serta kepatuhan **100% Solid UI**.

---

## 1. Prinsip Utama & Hierarki Aturan

1. **100% Solid, Zero Transparency**:
   - Seluruh permukaan (halaman, navbar, kolom, kartu, tombol, input, badge, toast, dialog modal) **100% solid opaque**.
   - **DILARANG** memakai *glassmorphism*, `backdrop-blur-*`, atau background semi-transparan pada komponen UI. Satu-satunya transparansi yang diizinkan adalah backdrop scrim gelap (`bg-[#0F172A]/55`) di belakang `Modal`.
2. **Soft Tactile 3D (Tanpa Garis Hitam Keras)**:
   - Hindari border hitam tebal `#1C1917` dan bayangan hitam kasar.
   - Kedalaman 3D diciptakan dari **border tipis warna senada** (`border border-[#E2E8F0]`) dipadukan dengan **bibir 3D bawah** (`border-b-4` warna lebih gelap senada, mis. `#CBD5E1` untuk kartu putih atau `#1D4ED8` untuk tombol biru) serta bayangan lembut tipis bila diperlukan.
3. **Solid Bold Badges (Anti-Pastel Pudar)**:
   - Seluruh badge status, prioritas, dan label proyek memakai **warna jenuh 100% solid dengan teks putih tebal** (`#FFFFFF`), bukan badge pastel pudar berlatar transparan/redup.
4. **Kill Latency — Umpan Balik Instan di Pointer-Down**:
   - Tombol 3D merespons seketika pada `pointer-down` (`active:translate-y-[2px] active:border-b-2`), terasa empuk seperti tombol fisik.
   - Jangan pernah mengunci input selama transisi atau memberi delay artifisial.
5. **Direct Manipulation & Interruptibility (Drag-and-Drop)**:
   - Kartu Space Kanban mengikuti pointer 1:1 tepat dari titik pegangan (*grab offset*) menggunakan `@dnd-kit`, animasi berbasis `transform` & `opacity`, dan dapat diinterupsi kapan saja.
6. **Whitespace & Visual Restraint (Lega di Mata)**:
   - Ritme 8px lega: jarak antar seksi `40px` (`gap-10`), padding halaman `24px–32px`, padding kolom `20px` (`p-5`), jarak antar kartu Kanban `14px–16px`, padding kartu `16px` (`p-4`).
   - Di area **Proyek Aktif (bawah)**, setiap proyek tampil sebagai **1 Kartu Proyek 3D putih bersih** berisi daftar tugas berbentuk **baris list ringan** (pemisah garis tipis `#F1F5F9`), bukan kartu bertumpuk di dalam kartu.
   - **Wayfinding, Grouping & Agency**: kontrol ditempatkan dekat objek yang dipengaruhinya; `ConfirmModal` hanya dipakai untuk aksi destruktif/massal (`Hapus`, `Arsipkan Semua`, `Keluar`).

---

## 2. Sistem Multi-Tema Warna (`[data-theme]` di `app/globals.css`)

Seluruh 7 tema memakai struktur **Sky Tactile 3D** yang identik, dibedakan melalui CSS variables pada `[data-theme="..."]` (`lib/theme-presets.ts`) dan disimpan ke `localStorage` + `User.theme`:

1. **`sky-blue` (Default)**: Surface `#F7F8FC`, Kolom `#EEF2F6`, Kartu `#FFFFFF`, Primary `#2563EB` (bibir `#1D4ED8`).
2. **`emerald-mint`**: Surface `#F3FAF6`, Kolom `#E3F3EA`, Kartu `#FFFFFF`, Primary `#059669` (bibir `#047857`).
3. **`warm-cream`**: Surface `#FAF6EE`, Kolom `#F1E9DA`, Kartu `#FFFDF9`, Primary `#EA580C` (bibir `#C2410C`).
4. **`berry-rose`**: Surface `#FFF5F7`, Kolom `#FCE7EC`, Kartu `#FFFFFF`, Primary `#E11D48` (bibir `#BE123C`).
5. **`pink-purple`**: Surface `#FDF7FF`, Kolom `#F5E8FA`, Kartu `#FFFFFF`, Primary `#C026D3` (bibir `#A21CAF`).
6. **`sakura-pink`**: Surface `#FFF6FA`, Kolom `#FCE7F3`, Kartu `#FFFFFF`, Primary `#EC4899` (bibir `#DB2777`).
7. **`midnight-dark` (Dark Mode 100% Solid)**: Surface `#0B1120`, Kolom `#162032`, Kartu `#1E293B`, Border `#334155`, Bibir `#090E1A`, Primary `#3B82F6` (bibir `#1D4ED8`), Teks `#F8FAFC`.

### Token Semantik Bersama (Semua Tema)

| Kategori | Token / Nilai Hex | Penggunaan |
|---|---|---|
| **Surface (Halaman)** | `#F7F8FC` | Latar halaman utama (crisp cool off-white) |
| **Surface Column** | `#EEF2F6` (border `#DCE4EE`) | Wadah kolom Space Kanban |
| **Container (Kartu/Modal)** | `#FFFFFF` (border `#E2E8F0`, bibir `#CBD5E1`) | Kartu tugas, kartu proyek 3D, input, dialog |
| **Surface Subtle** | `#F1F5F9` | Pemisah list ringan, hover row, area preview |
| **Ink Primary** | `#0F172A` | Teks judul & isi utama |
| **Ink Muted** | `#64748B` | Teks sekunder, placeholder, tanggal |
| **Focus Ring** | `#2563EB` | Focus ring keyboard & input aktif |
| **Primary Button** | `#2563EB` (bibir `#1D4ED8`, teks `#FFFFFF`) | Aksi utama (Simpan, Tambah, Mulai) |
| **Secondary Accent** | `#F59E0B` (bibir `#D97706`, teks `#FFFFFF`) | Highlight sekunder / aksi perhatian |
| **Success** | `#16A34A` (bibir `#15803D`, teks `#FFFFFF`) | Status `Selesai`, Toast sukses |
| **Info** | `#0284C7` (bibir `#0369A1`, teks `#FFFFFF`) | Status `Sedang dikerjakan`, Toast info |
| **Warning** | `#D97706` (bibir `#B45309`, teks `#FFFFFF`) | Status `Review`, Toast peringatan |
| **Danger** | `#E11D48` (bibir `#BE123C`, teks `#FFFFFF`) | Prioritas Tinggi, hapus, Toast error |
| **Neutral Badge** | `#475569` (bibir `#334155`, teks `#FFFFFF`) | Status `Belum dikerjakan`, metadata netral |

### Palet Warna Proyek (100% Solid + Teks Putih untuk Badge/Aksen)
- **Sky**: `#0284C7` (bibir `#0369A1`)
- **Emerald**: `#059669` (bibir `#047857`)
- **Orange**: `#EA580C` (bibir `#C2410C`)
- **Rose**: `#E11D48` (bibir `#BE123C`)
- **Amber**: `#D97706` (bibir `#B45309`)
- **Teal**: `#0D9488` (bibir `#0F766E`)

---

## 3. Tipografi (Optical Sizing, Tracking, Leading) & Ikon

Dikonfigurasi di `app/layout.tsx` via `next/font/google` dan `app/globals.css`:

- **Display / Heading / Button / Badge (`font-display`)**: `Nunito` (400–800)
  - `Display Large`: `30px–32px`, ExtraBold/Bold, tracking `-0.02em`, leading `1.2`
  - `Headline Large`: `22px–24px`, Bold, tracking `-0.015em`, leading `1.25`
  - `Headline Medium`: `17px–18px`, Bold, tracking `-0.01em`, leading `1.3`
  - `Headline Small`: `15px`, Bold, tracking `0`, leading `1.35`
- **Body UI (`font-sans`)**: `Plus Jakarta Sans` (400–700)
  - `Body Large`: `15px` / `22px`, Medium, tracking `0`
  - `Body Medium`: `13px–14px` / `20px`, Medium, tracking `0`
  - `Body Small`: `11px–12px` / `16px`, Semibold, tracking `+0.01em`
- **Monospace / Metadata (`font-mono`)**: `Space Mono` (400, 700)
  - `Mono Small`: `11px` / `16px`, Bold — tanggal, counter, tag *tech stack*
- **Ikon**: `Material Symbols Rounded` (paket lokal `material-symbols/rounded.css`), diakses via `<Icon name="..." />`.

---

## 4. Elevasi, Bentuk, Gerak & Reduced Motion

### Elevasi Tactile 3D & Radius
- **Kolom Kanban (`SurfaceColumn`)**: `rounded-3xl` (24px), `bg-[#EEF2F6] border-2 border-[#DCE4EE]`
- **Kartu 3D (`Card`)**: `rounded-2xl` (16px) atau `rounded-3xl` (kartu proyek), `bg-[#FFFFFF] border-2 border-[#E2E8F0] border-b-4 border-b-[#CBD5E1] shadow-[0_6px_16px_rgba(15,23,42,0.05)]` -> tunggu: pastikan *shadow* lembut tanpa efek kaca/transparan pada latar; lebih bersih lagi memakai `shadow-sm` atau murni bibir 3D solid `border-2 border-[#E2E8F0] border-b-[5px] border-b-[#CBD5E1]`!
- **Tombol 3D (`Button`)**: `rounded-2xl` / `rounded-xl`, `border-2 border-b-[5px]` dengan warna bibir lebih gelap; saat ditekan: `active:translate-y-[3px] active:border-b-2`.
- **Badge Status (`Badge`)**: `rounded-full` dengan warna 100% solid jenuh dan teks putih tebal (tanpa border hitam dan tanpa bayangan bertumpuk).
- **Chip Filter (`Chip`)**: `rounded-full border-2 border-b-[4px]`, aktif `#2563EB` (bibir `#1D4ED8`, teks `#FFFFFF`), non-aktif `#FFFFFF` (border `#E2E8F0`, bibir `#CBD5E1`, teks `#0F172A`).

### Hukum Gerak & Reduced Motion
- **State-change tombol & chip**: `transition-all duration-100 ease-[cubic-bezier(0.16,1,0.3,1)]`.
- **Card hover**: `transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5`.
- **Reduced Motion**: `@media (prefers-reduced-motion: reduce)` di `app/globals.css` menonaktifkan animasi gerak besar dan menggantinya dengan transisi singkat.

---

## 5. Voice & Content Strategy (Bahasa Indonesia)

- Ringkas, positif, dan langsung ke maksud: `"Santai & Fokus"`, `"Mulai"`, `"Selesai!"`, `"100% Tuntas"`, `"Belum dikerjakan"`, `"Sedang dikerjakan"`, `"Review"`, `"Selesai"`, `"Pulihkan ke Board"`.

---

## 6. Katalog Komponen (`components/ui/`)

Import terpusat melalui `@/components/ui`:

| Komponen | Lokasi | Fungsi Utama |
|---|---|---|
| `Icon` | `components/ui/icon.tsx` | Wrapper `Material Symbols Rounded` (`sm`/`md`/`lg`/`xl`, `filled`) |
| `Button`, `IconButton` | `components/ui/button.tsx` | Tombol 3D taktil solid (`primary`, `secondary`, `outline`, `success`, `warning`, `danger`, `info`) |
| `Badge`, `Chip` | `components/ui/badge.tsx` | Pill status solid berteks putih, warna identitas proyek, & chip filter 3D |
| `Card`, `SurfaceColumn` | `components/ui/card.tsx` | Kartu 3D putih bersih & kontainer kolom lembut |
| `FormField`, `Input`, `Select`, `Textarea` | `components/ui/input.tsx` | Kontrol form solid dengan border `#CBD5E1` & error inline |
| `ToastProvider`, `useToast` | `components/ui/toast.tsx` | Notifikasi ringan solid non-blocking (4 varian semantik, auto-dismiss 3,5 dtk) |
| `Modal`, `ConfirmModalProvider`, `useConfirm` | `components/ui/modal.tsx` | Dialog form kustom & konfirmasi destruktif berbasis Promise (tanpa `alert()`/`confirm()`/`sweetalert2`) |

Halaman pratinjau visual tersedia di `/design-system` dan prototipe interaktif di `/prototype`.
