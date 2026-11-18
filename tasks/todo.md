# Implementation Todo: Space Kanban

## Phase 1: Fondasi Database & Autentikasi
- [ ] **Task 1**: Setup skema Prisma 7 (`prisma/schema.prisma` termasuk `User.theme`/`workspaceTitle`/`workspaceSubtitle` & `Project.attributes`, `prisma.config.ts`, `lib/prisma.ts`, `.env.example`)
- [ ] **Task 2**: Setup Auth.js v5 Google OAuth (`auth.ts`, `/api/auth/[...nextauth]/route.ts`, `lib/auth-guard.ts`)
- [ ] **Task 3**: Buat Route Groups `(auth)/login` dan `(workspace)/layout.tsx` (Guard sesi, Navbar configurable, Modal Pengaturan Akun & 7 Tema, Toast & ConfirmModal providers)
- [ ] **Checkpoint 1**: `npx prisma generate`, `pnpm lint`, dan `pnpm build` lulus

## Phase 2: Pusat Manajemen Proyek (`/projects` & `/projects/[id]`)
- [ ] **Task 4**: Server Actions Proyek + validasi Zod + komponen `MarkdownEditor` (`Edit`/`Preview`)
- [ ] **Task 5**: Halaman `/projects` (filter tab status, grid kartu proyek klik langsung ke detail, Modal `+ Proyek Baru`)
- [ ] **Task 6**: Halaman `/projects/[id]` Header (`+ Tugas Baru`), Detail Awal (**Daftar Tugas** + **Catatan** Markdown di kiri, **Informasi Teknis & Atribut** configurable di kanan), dan tombol tab **Milestones**
- [ ] **Task 7**: Server Actions Milestone + Tab **Milestones** di `/projects/[id]` (progress otomatis dari task `DONE`)
- [ ] **Checkpoint 2**: Flow proyek & milestone terverifikasi; `pnpm lint && pnpm build` lulus

## Phase 3: Dashboard Eksekusi Harian (`/`)
- [ ] **Task 8**: Server Actions Tugas (`createTask`, `updateTask`, `moveTask` `$transaction`, `archiveDoneTasks`, `restoreTask`, `deleteTask`)
- [ ] **Task 9**: `app/(workspace)/page.tsx` + `WorkspaceClient` (optimistic state bersama, toggle `Split`/`Fokus Kanban`/`Fokus Proyek`, filter proyek)
- [ ] **Task 10**: Area Atas **Space Kanban** (`@dnd-kit` 4 kolom: `Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai` + arsip batch)
- [ ] **Task 11**: Area Bawah **Proyek Aktif** (horizontal scroll, `+ Tambah tugas cepat`, urutan otomatis, akordeon `Selesai`)
- [ ] **Task 12**: **Modal Detail / Edit Tugas** bersama (status, pindah proyek, milestone, prioritas, tanggal, Markdown, arsip, hapus)
- [ ] **Checkpoint 3**: Sinkronisasi 2 arah & drag-and-drop berjalan; `pnpm lint && pnpm build` lulus

## Phase 4: Riwayat Arsip & Polish Akhir
- [ ] **Task 13**: Tab **Tugas** & **`Riwayat Arsip`** di `/projects/[id]` (pulihkan ke board & hapus permanen)
- [ ] **Task 14**: Hapus starter `app/page.tsx`, audit responsivitas (320px–1440px), aksesibilitas, dan verifikasi final `pnpm lint && pnpm build`
- [ ] **Checkpoint Final**: Semua acceptance criteria terpenuhi dan siap digunakan
