# Space Kanban — System Design

Dokumen arsitektur teknis untuk aplikasi **Space Kanban** (merujuk pada spesifikasi fungsional [2026-11-18-space-kanban-design.md](./2026-11-18-space-kanban-design.md) dan design system *DevFlow Cute Solid*).

---

## 1. Requirements & Constraints

### Functional Requirements
- **Auth & Isolasi Data**: Google OAuth via Auth.js v5 (`next-auth`), pemisahan route group `(auth)` dan `(workspace)`, isolasi data ketat per `userId`.
- **Dashboard Utama (`/`)**:
  - **Space Kanban (atas)**: 4 kolom (`Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai`), filter per proyek aktif, drag-and-drop pindah kolom & reorder, tambah tugas, arsip batch kolom `Selesai`.
  - **Proyek Aktif (bawah)**: kolom horizontal scroll per proyek `ACTIVE`, tambah tugas cepat inline, tugas aktif terurut otomatis (`ON_PROGRESS` -> `REVIEW` -> `BACKLOG`, lalu `order`), bagian `Selesai` lipat (*collapsible*).
  - **Layout & Detail**: toggle `Split` / `Fokus Kanban` / `Fokus Proyek`; Modal Detail Tugas dengan deskripsi Markdown (`Edit`/`Preview`).
- **Manajemen Proyek (`/projects` & `/projects/[id]`)**:
  - CRUD proyek (status `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`, warna, tech stack, repo/live URL, target tanggal).
  - Detail proyek: Overview (Markdown `Edit`/`Preview`), Milestones (progress otomatis dari task tertaut berstatus `DONE` termasuk yang terarsip), dan Tasks (termasuk tab `Riwayat Arsip` + pulihkan tugas).
- **UI & Feedback**: Design system *DevFlow Cute Solid* (Light Mode `#F6F4EE`/`#FFFFFF`/`#1C1917`, 3D offset shadow, `Fredoka` + `Plus Jakarta Sans` + `Space Mono`, ikon `Material Symbols Rounded`), Bahasa Indonesia penuh, **Toast** & **Modal** kustom.

### Non-Functional Requirements
- **Latensi interaksi**: drag-and-drop Kanban terasa instan (< 16ms UI update via optimistic state), sinkron server < 200ms pada koneksi lokal/regional.
- **Konsistensi**: tidak ada ketidaksinkronan antara papan Kanban dan kolom Proyek bawah (keduanya membaca/memutasi state yang sama).
- **Keamanan**: seluruh query & mutasi memverifikasi `session.user.id` di server; rendering Markdown bebas XSS (tanpa raw HTML).

### Constraints (dari `package.json`)
- Next.js `16.1.6` (App Router), React `19.2.3`, TypeScript `^5`, Tailwind CSS `^4`.
- Prisma `^7.10.1` + `@prisma/adapter-pg` + `pg` (PostgreSQL).
- Tanpa `sweetalert2`, tanpa efek transparan/`backdrop-blur` (kecuali scrim modal).

---

## 2. High-Level Design

### Arsitektur Sistem
```text
+-------------------------------------------------------------------+
| Browser (React 19 + @dnd-kit + DevFlow Cute Solid UI)             |
|  ├── (auth)/login       -> Google OAuth Button                    |
|  └── (workspace)/*      -> Dashboard | /projects | /projects/[id] |
|        └── Client Store (Optimistic State + Toast + Modal)        |
+---------------------------+-------------------+-------------------+
                            | Server Actions    | /api/auth/*
                            v                   v
+-------------------------------------------------------------------+
| Next.js 16 App Server                                             |
|  ├── Auth.js v5 (Google Provider + @auth/prisma-adapter)          |
|  ├── Workspace Layout Guard -> redirect('/login') jika unauth     |
|  ├── Server Components      -> Initial SSR Query (by userId)      |
|  └── Server Actions         -> Auth check + Validasi + Mutasi     |
+---------------------------+---------------------------------------+
                            | @prisma/adapter-pg + pg Pool
                            v
+-------------------------------------------------------------------+
| PostgreSQL                                                        |
|  User, Account, Session, VerificationToken,                       |
|  Project, Milestone, Task                                         |
+-------------------------------------------------------------------+
```

### Data Flow Utama
1. **Read Path (SSR)**: `(workspace)/page.tsx` memanggil `auth()`, mengambil proyek `ACTIVE` + task belum terarsip + milestone milik `userId` dalam satu query terstruktur, lalu mengirim props ke `WorkspaceClient`.
2. **Write Path (Optimistic + Server Action)**:
   - Drag kartu di Kanban -> `WorkspaceClient` langsung memperbarui state lokal (sehingga Kanban atas & kolom Proyek bawah ikut berubah instan) -> panggil Server Action `moveTaskAction`.
   - Jika Server Action sukses -> `revalidatePath('/')`. Jika gagal -> rollback ke snapshot sebelumnya dan tampilkan **Toast** error solid.

---

## 3. Deep Dive

### A. Data Model & Indexing (Prisma + PostgreSQL)
- **Auth**: `User`, `Account`, `Session`, `VerificationToken` (`@auth/prisma-adapter`).
- **Domain**:
  - `Project`: `id`, `userId`, `name`, `description`, `status` (`ProjectStatus`), `color`, `techStack` (`String[]`), `repoUrl`, `liveUrl`, `targetDate`. Index: `(userId, status)`.
  - `Milestone`: `id`, `projectId`, `userId`, `title`, `description`, `targetDate`, `order`. Index: `(projectId)`, `(userId)`.
  - `Task`: `id`, `projectId`, `milestoneId?`, `userId`, `title`, `description`, `status` (`TaskStatus`), `priority` (`TaskPriority`), `dueDate`, `order` (`Int`), `isArchived` (`Boolean`), `archivedAt`. Index: `(userId, isArchived, status)`, `(projectId, isArchived, status)`, `(milestoneId)`.

### B. Kontrak Server Actions (Ringkas)
Semua action diawali `requireUserId()` dan verifikasi kepemilikan record (`where: { id, userId }`):
- **Project**: `createProject`, `updateProject`, `updateProjectStatus`, `deleteProject`
- **Milestone**: `createMilestone`, `updateMilestone`, `deleteMilestone`
- **Task**:
  - `createTask` (quick-add atau full modal; hitung `order` terakhir di kolom target)
  - `updateTask` (jika `projectId` berubah, validasi proyek baru milik user dan reset `milestoneId` jika tidak cocok)
  - `moveTask` (`taskId`, `targetStatus`, `orderedTaskIds` dalam transaksi `$transaction` untuk update status & `order` atomik)
  - `archiveDoneTasks` (`projectId?` -> `updateMany` set `isArchived: true, archivedAt: new Date()`)
  - `restoreTask` (`isArchived: false, archivedAt: null`) & `deleteTask`

### C. Strategi Ordering & Reorder
- **Space Kanban (atas)**: diurutkan berdasarkan `Task.order ASC`, `updatedAt DESC`. Saat drag-and-drop selesai, kirim daftar ID terurut pada kolom tujuan ke `moveTask` dalam `prisma.$transaction`.
- **Proyek Aktif (bawah)**: tidak menyimpan kolom urutan terpisah; diturunkan secara deterministik di client/server dengan bobot status (`ON_PROGRESS: 0`, `REVIEW: 1`, `BACKLOG: 2`) lalu `Task.order ASC`.

### D. Design System & Rendering
- **Font & CSS Tokens**: load `Fredoka`, `Plus Jakarta Sans`, dan `Space Mono` via `next/font/google`, plus `Material Symbols Rounded` (Google Fonts stylesheet / paket simbol) yang dipetakan di `app/globals.css` (Tailwind v4 `@theme inline`).
- **Markdown**: `react-markdown` + `remark-gfm` tanpa `rehype-raw` agar aman dari XSS, dengan styling heading/list/code block solid kontras tinggi `#1C1917`.
- **Feedback UI**: `ToastProvider` (stack kanan bawah, auto-dismiss 3,5 dtk) dan `ConfirmModalProvider` (`Promise<boolean>` hook `useConfirm()`) menggantikan `alert()`/`confirm()`.

---

## 4. Scale & Reliability

- **Estimasi Beban**: aplikasi produktivitas personal/multi-tenant ringan (puluhan proyek, ratusan–ribuan task per user). Payload awal dashboard hanya memuat proyek `ACTIVE` dan task `isArchived = false` sehingga tetap ringan (< 50 KB JSON).
- **Optimasi DB**: composite index `(userId, isArchived, status)` memastikan query dashboard dan arsip batch tetap *index-only / index-scan* tanpa full table scan.
- **Keandalan Mutasi & Sesi**:
  - Transaksi Prisma (`$transaction`) mencegah urutan `Task.order` korup saat reorder paralel.
  - Optimistic rollback di client mencegah state UI melenceng saat koneksi terputus.
  - Pool `pg` dikelola sebagai singleton di `globalThis` pada mode development agar tidak kehabisan koneksi saat HMR Next.js.

---

## 5. Trade-off Analysis & Poin Revisit

| Keputusan | Pilihan | Trade-off | Kapan Direvisit |
|---|---|---|---|
| **Mutasi Data** | Server Actions + `revalidatePath` + optimistic state | Lebih ringkas daripada REST API + React Query, namun terikat pada klien web Next.js | Jika kelak butuh aplikasi mobile native atau public API -> tambah REST `/api/v1/*` |
| **Ordering Task** | Integer `order` + update batch via `$transaction` | Mudah dipahami & cepat untuk < 200 kartu per kolom | Jika satu kolom berisi > 500 kartu -> migrasi ke *fractional indexing* (LexoRank) |
| **Auth** | Auth.js v5 (Google OAuth + Prisma Adapter) | Tanpa manajemen password, tapi butuh setup Google Cloud OAuth credentials | Jika butuh login non-Google -> tambah provider GitHub / Email magic link |
| **Arsip Kanban** | Flag `isArchived` pada `Task` | Tugas selesai hilang dari board harian namun tetap dihitung di progress Milestone | Jika tabel `Task` tumbuh sangat besar per user -> tambah pagination di tab `Riwayat Arsip` |
