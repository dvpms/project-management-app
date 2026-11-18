# Implementation Todo: Space Kanban

## Phase 1: Fondasi Database & Autentikasi
- [x] **Task 1**: Lengkapi `prisma/schema.prisma` (`User.theme`/`workspaceTitle`/`workspaceSubtitle` & `Project.attributes`), `lib/prisma.ts`, `.env.example`
- [x] **Task 2**: Setup Auth.js v5 Google OAuth (`auth.ts`, `/api/auth/[...nextauth]/route.ts`, `lib/auth-guard.ts`)
- [x] **Task 3**: Buat Route Groups `(auth)/login` dan `(workspace)/layout.tsx` (Guard sesi, Navbar configurable, Modal Pengaturan Akun & 7 Tema, Toast & ConfirmModal providers)
- [x] **Checkpoint 1**: `npx prisma generate --config prisma7.config.ts`, `npx tsc --noEmit`, `pnpm lint`, dan `pnpm build` lulus

## Phase 2: Pusat Manajemen Proyek (`/projects` & `/projects/[id]`)
- [ ] **Task 4**: Validasi Zod + `services/project-service.ts` + `actions/project-actions.ts` + `MarkdownEditor` (`Edit`/`Preview`)
- [ ] **Task 5**: Halaman `/projects` (filter tab status, grid kartu proyek klik langsung ke detail, Modal `+ Proyek Baru`)
- [ ] **Task 6**: Halaman `/projects/[id]` Header (`+ Tugas Baru`), Detail Awal (**Daftar Tugas** + **Catatan** Markdown di kiri, **Informasi Teknis & Atribut** configurable di kanan), dan tombol tab **Milestones**
- [ ] **Task 7**: `services/milestone-service.ts` + `actions/milestone-actions.ts` + Tab **Milestones** di `/projects/[id]` (progress otomatis dari task `DONE`)
- [ ] **Checkpoint 2**: Flow proyek & milestone terverifikasi; `npx tsc --noEmit && pnpm lint && pnpm build` lulus

## Phase 3: Dashboard Eksekusi Harian (`/`)
- [ ] **Task 8**: `lib/validations/task.ts` + `services/task-service.ts` + `actions/task-actions.ts` (`moveTask` `$transaction`, `archiveDoneTasks`, `restoreTask`) + `lib/task-sorting.ts`
- [ ] **Task 9**: `app/(workspace)/page.tsx` + `WorkspaceClient` (optimistic state bersama, toggle `Split`/`Fokus Kanban`/`Fokus Proyek`, filter proyek)
- [ ] **Task 10**: Area Atas **Space Kanban** (`@dnd-kit` 4 kolom: `Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai` + arsip batch)
- [ ] **Task 11**: Area Bawah **Proyek Aktif** (horizontal scroll, `+ Tambah tugas cepat`, urutan otomatis, akordeon `Selesai`)
- [ ] **Task 12**: **Modal Detail / Edit Tugas** bersama (status, pindah proyek, milestone, prioritas, tanggal, Markdown, arsip, hapus)
- [ ] **Checkpoint 3**: Sinkronisasi 2 arah & drag-and-drop berjalan; `pnpm lint && pnpm build` lulus

## Phase 4: Riwayat Arsip & Polish Akhir
- [ ] **Task 13**: Tab **Tugas** & **`Riwayat Arsip`** di `/projects/[id]` (pulihkan ke board & hapus permanen)
- [ ] **Task 14**: Hapus starter `app/page.tsx`, audit responsivitas (320px–1440px), aksesibilitas, dan verifikasi final `pnpm lint && pnpm build`
- [ ] **Checkpoint Final**: Semua acceptance criteria terpenuhi dan siap digunakan
