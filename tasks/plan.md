# Implementation Plan: Space Kanban

## Overview
Membangun aplikasi manajemen proyek dan eksekusi tugas harian **Space Kanban** di atas Next.js 16 (App Router), React 19, Tailwind CSS v4 (*DevFlow Cute Solid*), Prisma 7 + PostgreSQL (`@prisma/adapter-pg`), dan Auth.js v5 (Google OAuth). Aplikasi memiliki dua area utama: **Dashboard (`/`)** yang menyinkronkan *Space Kanban* (4 kolom: `Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai`) dengan kolom *Proyek Aktif* secara real-time, serta **Pusat Manajemen Proyek (`/projects` & `/projects/[id]`)** untuk detail proyek, Markdown notes, milestone otomatis, dan riwayat arsip.

## Architecture Decisions
- **Auth & Route Isolation**: Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter` (Google OAuth terbuka) dengan Route Groups `(auth)` dan `(workspace)` serta isolasi query per `userId` (`requireUserId()`).
- **Data Flow & State**: Server Components untuk SSR initial load; Server Actions + `revalidatePath` untuk mutasi; *optimistic state* di `WorkspaceClient` (tanpa Redux) agar Space Kanban dan kolom Proyek Aktif selalu sinkron.
- **UI & Feedback**: Mengikuti penuh [DESIGN.md](../DESIGN.md) (*DevFlow Cute Solid* × *Apple Interaction Craft*: 100% solid tanpa transparansi/`backdrop-blur`, respons instan `pointer-down`, direct manipulation `@dnd-kit`, *reduced-motion*, Markdown aman XSS via `react-markdown` + `remark-gfm`, serta **Toast** & **Modal** kustom).

---

## Task List

### Phase 1: Fondasi Database & Autentikasi

#### Task 1: Setup Skema Prisma 7 & Konfigurasi PostgreSQL
**Description:** Menyiapkan `prisma/schema.prisma` (model Auth.js termasuk kolom `User.theme` + `Project`, `Milestone`, `Task`, beserta enum & index), konfigurasi Prisma 7 (`prisma.config.ts`), client singleton `lib/prisma.ts` dengan `@prisma/adapter-pg`, dan `.env.example`.
**Acceptance criteria:**
- [ ] Skema Prisma mencakup `User` (dengan field `theme String @default("sky-blue")`), `Account`, `Session`, `VerificationToken`, `Project`, `Milestone`, `Task`, dan enum `ProjectStatus`, `TaskStatus`, `TaskPriority`.
- [ ] Index komposit `(userId, status)` dan `(userId, isArchived, status)` terpasang.
- [ ] `.env.example` mendokumentasikan `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, dan `AUTH_GOOGLE_SECRET`.
**Verification:**
- [ ] `npx prisma validate` dan `npx prisma generate` sukses tanpa error.
- [ ] TypeScript check (`pnpm build` / `tsc --noEmit`) lulus.
**Dependencies:** None  
**Files likely touched:** `prisma/schema.prisma`, `prisma.config.ts`, `lib/prisma.ts`, `.env.example`  
**Estimated scope:** Medium (4 files)

#### Task 2: Setup Auth.js v5 (Google OAuth) & Helper Sesi
**Description:** Memasang `next-auth@beta` dan `@auth/prisma-adapter`, mengonfigurasi Google Provider + Prisma Adapter, mengekspos `/api/auth/[...nextauth]/route.ts`, dan membuat helper server `getCurrentUser()` / `requireUserId()`.
**Acceptance criteria:**
- [ ] Endpoint `/api/auth/[...nextauth]` aktif untuk Google OAuth callback & session.
- [ ] `requireUserId()` melempar/redirect secara aman jika sesi tidak ditemukan.
- [ ] Tipe `session.user.id` terdefinisi rapi di TypeScript.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 1  
**Files likely touched:** `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `lib/auth-guard.ts`, `types/next-auth.d.ts`  
**Estimated scope:** Medium (4 files)

#### Task 3: Route Groups `(auth)` dan `(workspace)` + Navbar, Theme & Feedback Providers
**Description:** Memisahkan halaman publik `/login` di `(auth)` (tombol solid "Masuk dengan Google") dan layout terproteksi di `(workspace)/layout.tsx` lengkap dengan Navbar, `ThemeProvider` + `ThemeSwitcher` (7 tema Sky Tactile 3D tersinkron ke `localStorage` & `User.theme`), konfirmasi keluar via `useConfirm()`, `ToastProvider`, dan `ConfirmModalProvider`.
**Acceptance criteria:**
- [ ] Pengguna belum login yang membuka `/` atau `/projects` otomatis di-redirect ke `/login`.
- [ ] Pengguna sudah login yang membuka `/login` otomatis di-redirect ke `/`.
- [ ] Navbar menampilkan navigasi `Dashboard` (`/`) dan `Proyek` (`/projects`), `ThemeSwitcher` (7 tema tersinkron ke DB & browser), info user, serta tombol `Keluar` dengan konfirmasi Modal kustom.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
- [ ] Manual check: akses `/login` dan redirect guard berjalan sesuai status sesi.
**Dependencies:** Task 2  
**Files likely touched:** `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(workspace)/layout.tsx`, `components/layout/Navbar.tsx`  
**Estimated scope:** Medium (4 files)

### Checkpoint: Fondasi & Auth
- [ ] `prisma generate`, `pnpm lint`, dan `pnpm build` bersih tanpa error.
- [ ] Pemisahan route group `(auth)` vs `(workspace)` dan proteksi sesi berfungsi.

---

### Phase 2: Pusat Manajemen Proyek (`/projects` & `/projects/[id]`)

#### Task 4: Server Actions Proyek & Komponen Markdown Editor/Preview
**Description:** Membuat validasi Zod dan Server Actions CRUD proyek (`createProject`, `updateProject`, `updateProjectStatus`, `deleteProject`) dengan proteksi `userId`, serta komponen reusable `MarkdownEditor` (`react-markdown` + `remark-gfm`, tab `Edit` / `Preview`, aman XSS).
**Acceptance criteria:**
- [ ] Seluruh mutasi proyek memverifikasi `userId` pemilik sebelum eksekusi.
- [ ] `MarkdownEditor` mendukung mode `Edit` dan `Preview` dengan styling *DevFlow Cute Solid* tanpa mengeksekusi HTML mentah.
- [ ] Error validasi mengembalikan pesan Bahasa Indonesia yang jelas.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 2  
**Files likely touched:** `lib/validations/project.ts`, `actions/project-actions.ts`, `components/ui/markdown-editor.tsx`  
**Estimated scope:** Medium (3 files)

#### Task 5: Halaman Daftar Proyek (`/projects`) & Modal Proyek Baru
**Description:** Membangun halaman `/projects` dengan filter tab status (`Semua`, `Aktif`, `Ditunda`, `Selesai`, `Diarsipkan`), grid kartu proyek solid (warna identitas, progress ringkas, *tech stack* chips, kontrol status cepat), dan Modal form `+ Proyek Baru`.
**Acceptance criteria:**
- [ ] Pengguna dapat membuat proyek baru lengkap dengan warna kategori dari palet *DevFlow Cute Solid*.
- [ ] Filter tab status menyaring daftar proyek secara akurat.
- [ ] Mengubah status proyek memberi feedback **Toast** dan memengaruhi kemunculan di Dashboard utama.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
- [ ] Manual check: buat proyek baru, ubah status, dan verifikasi filter tab.
**Dependencies:** Task 3, Task 4  
**Files likely touched:** `app/(workspace)/projects/page.tsx`, `components/projects/ProjectsClient.tsx`, `components/projects/ProjectFormModal.tsx`  
**Estimated scope:** Medium (3 files)

#### Task 6: Halaman Detail Proyek (`/projects/[id]`) — Header & Tab Overview
**Description:** Membangun kerangka detail proyek `/projects/[id]` dengan header identitas proyek (ubah status, edit metadata, hapus proyek via `useConfirm()`), serta tab **Overview** (catatan Markdown `Edit`/`Preview`, *tech stack* tags, `Repo URL`, `Live URL`, `Target Tanggal`, dan ringkasan statistik tugas).
**Acceptance criteria:**
- [ ] Halaman menolak akses (404/notFound) jika proyek bukan milik `userId` aktif.
- [ ] Edit overview Markdown, tech stack, tautan, dan tanggal tersimpan ke PostgreSQL dengan Toast konfirmasi.
- [ ] Hapus proyek meminta konfirmasi lewat Modal kustom sebelum menghapus cascade.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 5  
**Files likely touched:** `app/(workspace)/projects/[id]/page.tsx`, `components/projects/ProjectDetailClient.tsx`, `components/projects/ProjectOverviewTab.tsx`  
**Estimated scope:** Medium (3 files)

#### Task 7: Tab Milestones di `/projects/[id]`
**Description:** Menambahkan Server Actions & validasi `Milestone` (`createMilestone`, `updateMilestone`, `deleteMilestone`) serta tab **Milestones** di `/projects/[id]` yang menghitung progress otomatis (`DONE / total` termasuk task terarsip) dan menyediakan tombol tambah tugas langsung ke milestone.
**Acceptance criteria:**
- [ ] Progress bar milestone terhitung otomatis dari seluruh task tertaut (`DONE / total`), termasuk task `DONE` dengan `isArchived = true`.
- [ ] CRUD milestone memvalidasi kepemilikan `userId` & `projectId`, dengan konfirmasi hapus via `useConfirm()`.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 6  
**Files likely touched:** `lib/validations/milestone.ts`, `actions/milestone-actions.ts`, `components/projects/ProjectMilestonesTab.tsx`  
**Estimated scope:** Medium (3 files)

### Checkpoint: Manajemen Proyek
- [ ] Alur `/projects` -> `/projects/[id]` (Overview + Milestones) berjalan penuh dengan Toast & Modal kustom.
- [ ] `pnpm lint && pnpm build` lulus.

---

### Phase 3: Dashboard Eksekusi Harian (`/`) — Space Kanban & Proyek Aktif

#### Task 8: Server Actions Tugas & Logika Order/Arsip
**Description:** Membuat validasi Zod dan Server Actions tugas (`createTask`, `updateTask`, `moveTask` dalam `$transaction`, `archiveDoneTasks`, `restoreTask`, `deleteTask`) beserta helper pengurutan deterministik area bawah.
**Acceptance criteria:**
- [ ] `moveTask` memperbarui `status` dan `order` seluruh ID di kolom tujuan secara atomik dalam `prisma.$transaction`.
- [ ] `updateTask` otomatis me-reset `milestoneId = null` jika `projectId` berpindah dan milestone lama bukan milik proyek baru.
- [ ] `archiveDoneTasks` hanya mengarsipkan tugas `DONE` milik proyek aktif (atau proyek terfilter) milik `userId`.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 4, Task 7  
**Files likely touched:** `lib/validations/task.ts`, `actions/task-actions.ts`, `lib/task-sorting.ts`  
**Estimated scope:** Medium (3 files)

#### Task 9: Shell `WorkspaceClient`, Kontrol Layout & Filter Proyek
**Description:** Membangun `app/(workspace)/page.tsx` (SSR query proyek `ACTIVE` + task belum terarsip + milestone) dan `WorkspaceClient` yang memegang optimistic state bersama untuk Kanban atas & Proyek bawah, toggle tampilan (`Split` / `Fokus Kanban` / `Fokus Proyek`), serta filter proyek Kanban.
**Acceptance criteria:**
- [ ] Dashboard utama hanya memuat proyek `ACTIVE` dan tugas `isArchived = false`.
- [ ] Toggle `Split` / `Fokus Kanban` / `Fokus Proyek` mengubah tata letak tanpa kehilangan state filter.
- [ ] Filter proyek menyaring kartu Space Kanban secara instan.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 8  
**Files likely touched:** `app/(workspace)/page.tsx`, `components/workspace/WorkspaceClient.tsx`, `components/workspace/WorkspaceToolbar.tsx`  
**Estimated scope:** Medium (3 files)

#### Task 10: Space Kanban (`@dnd-kit`) + Arsip Batch Kolom Selesai
**Description:** Memasang `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` dan membangun `SpaceKanbanBoard` dengan 4 kolom (`Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai`), kartu tugas solid, drag-and-drop optimistik dengan rollback + Toast error, serta tombol `Arsipkan Selesai` berkonfirmasi Modal.
**Acceptance criteria:**
- [ ] Drag-and-drop antar 4 kolom & reorder dalam kolom langsung memperbarui state di Kanban atas dan Proyek bawah.
- [ ] Jika Server Action gagal, posisi kartu rollback ke state awal dan muncul Toast error.
- [ ] Tombol `Arsipkan Selesai` memunculkan `useConfirm()` sebelum mengarsipkan seluruh tugas `Selesai` sesuai filter.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
- [ ] Manual check: drag kartu antar kolom, reload halaman, pastikan posisi & status persisten.
**Dependencies:** Task 9  
**Files likely touched:** `components/kanban/SpaceKanbanBoard.tsx`, `components/kanban/KanbanColumn.tsx`, `components/kanban/KanbanTaskCard.tsx`  
**Estimated scope:** Medium (3 files)

#### Task 11: Area Bawah Proyek Aktif (Horizontal Scroll + Quick-Add + Collapsible Selesai)
**Description:** Membangun `ActiveProjectsBoard` di bawah Space Kanban dengan horizontal scroll kolom proyek `ACTIVE`, form `+ Tambah tugas cepat` inline (Enter langsung tambah ke `Belum dikerjakan` & muncul di Kanban), daftar tugas terurut otomatis (`Sedang dikerjakan -> Review -> Belum dikerjakan -> order`), dan akordeon `Selesai (N)` yang dapat dilipat.
**Acceptance criteria:**
- [ ] Proyek `ACTIVE` > 3 tampil rapi dengan horizontal scroll.
- [ ] Menambah tugas inline di kolom proyek bawah langsung memunculkan kartu di kolom `Belum dikerjakan` pada Space Kanban atas.
- [ ] Tugas `Selesai` terlipat secara default di dalam akordeon per proyek.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 9, Task 10  
**Files likely touched:** `components/workspace/ActiveProjectsBoard.tsx`, `components/workspace/ProjectTasksColumn.tsx`  
**Estimated scope:** Small (2 files)

#### Task 12: Modal Detail / Edit Tugas Bersama
**Description:** Membuat `TaskDetailModal` yang dapat dibuka dari kartu Space Kanban maupun baris tugas Proyek Aktif, mendukung edit judul, status, pindah proyek, pilih milestone, prioritas, target tanggal, deskripsi Markdown (`Edit`/`Preview`), arsip tugas `Selesai`, dan hapus tugas via `useConfirm()`.
**Acceptance criteria:**
- [ ] Membuka tugas dari Kanban atau Proyek bawah menampilkan modal yang sama dan menyinkronkan perubahan ke kedua area.
- [ ] Dropdown milestone otomatis menyesuaikan proyek yang sedang dipilih di modal.
- [ ] Hapus tugas meminta konfirmasi lewat Modal kustom dan memberi Toast feedback.
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 10, Task 11  
**Files likely touched:** `components/tasks/TaskDetailModal.tsx`, `components/workspace/WorkspaceClient.tsx`  
**Estimated scope:** Small (2 files)

### Checkpoint: Dashboard Harian Lengkap
- [ ] Sinkronisasi penuh Space Kanban <-> Proyek Aktif <-> Modal Tugas berjalan mulus.
- [ ] `pnpm lint && pnpm build` lulus.

---

### Phase 4: Riwayat Arsip & Polish Akhir

#### Task 13: Tab Tugas & Riwayat Arsip di `/projects/[id]`
**Description:** Membangun tab **Tugas** pada `/projects/[id]` yang menampilkan seluruh tugas proyek dengan filter status serta tab/toggle **Riwayat Arsip** (`isArchived = true`) untuk melihat tugas yang sudah diarsipkan, memulihkannya ke board (`Pulihkan ke Board`), atau menghapus permanen.
**Acceptance criteria:**
- [ ] Tugas yang diarsipkan dari Space Kanban muncul di `Riwayat Arsip` pada proyek terkait.
- [ ] Tombol `Pulihkan ke Board` mengembalikan tugas ke Dashboard (jika proyek berstatus `ACTIVE`).
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus.
**Dependencies:** Task 7, Task 8  
**Files likely touched:** `components/projects/ProjectTasksTab.tsx`, `components/projects/ProjectDetailClient.tsx`  
**Estimated scope:** Small (2 files)

#### Task 14: Audit Responsivitas, Aksesibilitas & Verifikasi End-to-End
**Description:** Membersihkan sisa template awal (`app/page.tsx` root lama sudah digantikan `(workspace)/page.tsx`), memastikan responsive layout di 320px/768px/1024px/1440px, kontras & aksesibilitas keyboard, empty/error states, serta verifikasi build & lint final.
**Acceptance criteria:**
- [ ] Tidak ada konflik rute `/` antara `app/page.tsx` dan `app/(workspace)/page.tsx`.
- [ ] Tidak ada warning ESLint, error TypeScript, atau broken state di mobile/desktop.
- [ ] Seluruh halaman mematuhi standar solid *DevFlow Cute Solid* (`DESIGN.md`).
**Verification:**
- [ ] `pnpm lint && pnpm build` lulus bersih.
- [ ] Manual walkthrough: Login Google -> Buat Proyek -> Tambah Milestone -> Tambah/Drag Tugas -> Arsip Selesai -> Pulihkan di `/projects/[id]`.
**Dependencies:** Task 12, Task 13  
**Files likely touched:** `app/page.tsx` (hapus starter lama), `components/layout/Navbar.tsx`, `components/workspace/*`, `components/projects/*`  
**Estimated scope:** Medium (3-4 files)

### Checkpoint: Complete
- [ ] Seluruh fitur pada `docs/superpowers/specs/2026-11-18-space-kanban-design.md` terpenuhi.
- [ ] Aplikasi build bersih dan siap dijalankan.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Auth.js v5 (`next-auth@beta`) + Prisma 7 `@prisma/adapter-pg` compatibility** | High | Verifikasi dokumentasi terbaru lewat `ctx7` sebelum setup Task 2; uji typecheck dan build langsung di Checkpoint 1. |
| **Konflik routing `app/page.tsx` vs `app/(workspace)/page.tsx`** | High | Hapus starter `app/page.tsx` saat memindahkan `/` ke `app/(workspace)/page.tsx` di Task 9/14. |
| **State drag-and-drop `@dnd-kit` tidak sinkron dengan Server Action saat cepat digeser** | Med | Gunakan `useOptimistic` / snapshot rollback + transaksi `$transaction` berbasis urutan ID eksplisit pada `moveTask`. |
| **User belum mengisi `.env` (`DATABASE_URL`, Google OAuth credentials)** | Med | Sediakan `.env.example` yang jelas dan guard runtime yang ramah jika env belum lengkap saat dev. |

## Open Questions
- Tidak ada; seluruh keputusan desain sudah dikunci di [2026-11-18-space-kanban-design.md](file:///d:/Coding/project-management-app/docs/superpowers/specs/2026-11-18-space-kanban-design.md) dan [DESIGN.md](file:///d:/Coding/project-management-app/DESIGN.md).
