# Space Kanban — Dokumen Desain Aplikasi Manajemen Proyek & Tugas

Tanggal: 2026-11-18  
Ukuran Pekerjaan: Proyek Aplikasi Penuh (Next.js App Router + PostgreSQL/Prisma + Auth.js)

---

## 1. Tujuan & Latar Belakang (Intent & Why)

**Space Kanban** adalah aplikasi manajemen proyek dan eksekusi tugas harian pribadi untuk pengembang perangkat lunak yang mengerjakan beberapa proyek secara paralel.

Masalah utama yang diselesaikan:
- Daftar tugas sering tercecer antara kebutuhan *melihat status pekerjaan harian lintas proyek* dan kebutuhan *melihat backlog tugas per proyek*.
- Detail strategis proyek (status siklus hidup, milestone, catatan teknis, atribut teknis/URL) jika ditaruh di papan harian akan memenuhi layar dan mengganggu fokus eksekusi.

Solusi yang dibangun (mengikuti wireframe pengguna):
- **Dashboard Utama (`/`)** memisahkan layar secara vertikal menjadi dua area sinkron dari satu sumber data:
  1. **Atas — Space Kanban**: 4 kolom status (`Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai`) yang menampilkan tugas lintas proyek aktif (dapat difilter per proyek).
  2. **Bawah — Proyek Aktif**: kolom-kolom proyek berstatus `Active` yang tersusun berdampingan (*horizontal scroll*) berisi daftar tugas masing-masing proyek.
- **Pusat Manajemen Proyek (`/projects` & `/projects/[id]`)** menjadi tempat terpisah untuk mengelola seluruh detail proyek, milestone, dan riwayat arsip tugas.

---

## 2. Goals, Non-Goals, dan Anti-Goals

### Goals
1. **Satu sumber data, dua tampilan sinkron**: perubahan status, judul, detail, atau penghapusan tugas di Space Kanban langsung tercermin di kolom proyek bawah, dan sebaliknya.
2. **Eksekusi harian cepat**: tambah tugas cepat langsung dari kolom proyek maupun dari Kanban, drag-and-drop antar kolom status & reorder di Space Kanban dengan *optimistic UI update*, serta toggle tampilan `Split` / `Fokus Kanban` / `Fokus Proyek`.
3. **Pengelolaan proyek terstruktur**: halaman `/projects` dan `/projects/[id]` mengelola status proyek (`Active`, `On Hold`, `Completed`, `Archived`), catatan Markdown (mode Edit/Preview), atribut teknis dinamis (repo/URL/endpoint yang dapat ditambah/edit/hapus bebas), dan *Milestone* yang progress-nya dihitung otomatis dari tugas tertaut yang berstatus `Selesai`.
4. **Kebersihan board jangka panjang**: hanya proyek `Active` yang tampil di dashboard utama; tugas `Selesai` di kolom proyek bawah terlipat (*collapsible*); dan tugas `Selesai` di Kanban dapat diarsipkan per batch tanpa menghapus histori maupun merusak perhitungan progress milestone.
5. **Autentikasi & isolasi data ketat**: login via **Google OAuth (Auth.js v5)** dengan pemisahan Next.js Route Groups `(auth)` dan `(workspace)`. Setiap akun Google yang login otomatis terdaftar dan memiliki workspace terisolasi berdasarkan `userId`.
6. **UI Bahasa Indonesia & Solid Kontras Tinggi**: antarmuka Light Mode 100% solid (zero translucency / no glassmorphism) dengan komponen feedback kustom seragam (**Toast** dan **Modal**).

### Non-Goals
- Kolaborasi multi-user / tim dalam proyek yang sama (sharing proyek antar akun, assignment ke anggota lain, komentar tim, role/RBAC).
- Pembatasan daftar email pemilik tunggal (*allowlist*) — siapa pun yang login dengan Google dapat memakai ruang kerjanya sendiri yang terisolasi per `userId`.
- Login atau pendaftaran manual menggunakan email & password.
- Integrasi otomatis eksternal (GitHub Issues/PR sync, webhook, email/push reminder).
- Time tracking, stopwatch, atau laporan jam kerja.

### Anti-Goals
- **Ketidaksinkronan data** antara papan Kanban atas dan kolom Proyek bawah.
- **Board yang penuh sesak** oleh proyek non-aktif atau tumpukan tugas selesai berbulan-bulan lalu.
- **Komponen UI pudar/transparan** (glassmorphism, `backdrop-blur`, badge pastel pucat) atau penggunaan `alert()` / `confirm()` bawaan browser maupun `sweetalert2`.

---

## 3. Kendala & Konteks Teknis (Constraints)

Berdasarkan `package.json` yang sudah ada di repositori:
- **Framework**: Next.js `16.1.6` (App Router), React `19.2.3`, TypeScript `^5`, Tailwind CSS `^4`.
- **Database & ORM**: PostgreSQL dengan Prisma `^7.10.1` (`@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`).
- **Standar UI & Design System (*DevFlow Cute Solid*)**:
  - Mengikuti `devflow_design_system.md` (Light Mode solid, zero transparency, tanpa `backdrop-blur-*`).
  - **Warna**: Surface dasar `#F6F4EE`, kartu `#FFFFFF`, kontainer sekunder `#F4F2EB`, border & teks utama `#1C1917`, secondary `#FEF08A`, accent `#FECDD3`, kategori pastel solid 100% opaque (`#E0F2FE`, `#FEF3C7`, `#DCFCE7`, `#FED7AA`, `#FECDD3`), serta semantic solid berteks putih (`#15803D` success, `#B45309` warning, `#BE123C` danger, `#0369A1` info).
  - **Border & Shadow**: `border-2 border-[#1C1917]` + hard offset shadow solid (`shadow-[0_4px_0_#1C1917]` kolom, `shadow-[0_3px_0_#1C1917]` kartu/badge, `shadow-[0_2px_0_#1C1917]` tombol dengan `active:translate-y-0.5 active:shadow-none`).
  - **Tipografi & Ikon**: `Nunito` (heading, tombol, badge), `Plus Jakarta Sans` (body UI), `Space Mono` (tanggal, metadata, counter), serta ikon `Material Symbols Rounded`.
  - **Bentuk & Gerak**: `rounded-3xl` (kolom/kontainer besar), `rounded-2xl` (kartu/tombol), `rounded-full` (badge/chip), transisi `100ms`/`150ms` `cubic-bezier(0.16, 1, 0.3, 1)`.
  - **Bahasa & Feedback**: Bahasa Indonesia penuh dengan nada ramah & terstruktur (*"Santai & Fokus"*, *"Mulai"*, *"Selesai!"*, *"100% Tuntas"*), kecuali istilah teknis Kanban (`Space Kanban`, `Review`). Seluruh notifikasi memakai **Toast** kustom dan dialog memakai **Modal** kustom (tanpa `sweetalert2` dan tanpa `alert()`/`confirm()`).

---

## 4. Pendekatan Teknis (Approaches)

Selama diskusi desain, tiga alternatif arsitektur dibandingkan:

1. **Custom Session (`jose` + `bcryptjs`) + Server Components/Actions + `@dnd-kit`**
   - *Trade-off*: Ringan dan bebas friksi adapter pihak ketiga, namun khusus untuk email+password; tidak langsung mendukung Google OAuth.
2. **Auth.js v5 (`next-auth`) + REST API Routes (`/api/*`) + `@dnd-kit`**
   - *Trade-off*: Mendukung Google OAuth dan cocok jika ada klien eksternal/mobile, tetapi endpoint REST manual untuk semua CRUD menambah boilerplate dibanding Server Actions.
3. **Custom Session + HTML5 Drag-and-Drop Native**
   - *Trade-off*: Minim dependensi, namun drag-and-drop HTML5 native buruk di layar sentuh dan rapuh untuk *reordering* antar/dalam kolom.

### Pendekatan Terpilih (Keputusan Final)
Menggabungkan **Auth.js v5 (`next-auth`) + `@auth/prisma-adapter` (khusus Google OAuth terbuka dengan isolasi per `userId`)** dengan **Next.js App Router Server Components + Server Actions / Route Handler ringan + `@dnd-kit` + Markdown renderer**:
- **Autentikasi**: Auth.js v5 dengan Google Provider dan Prisma Adapter. Tidak ada form password maupun email allowlist; akun Google mana pun yang login pertama kali otomatis dibuatkan record `User` dan `Account` di PostgreSQL dengan ruang kerja terisolasi per `userId`.
- **Alur Data**: Server Components membaca data awal langsung dari Prisma (`@prisma/adapter-pg`) tanpa loading waterfall. Mutasi (CRUD proyek, milestone, tugas, perpindahan kolom Kanban, arsip batch) dijalankan lewat Server Actions (atau Route Handler tipis bila dibutuhkan untuk payload optimistik) dengan validasi kepemilikan `userId` dan `revalidatePath`.
- **Interaksi Drag-and-Drop**: `@dnd-kit/core` + `@dnd-kit/sortable` digunakan pada Space Kanban (atas) dengan *optimistic state* di client agar perpindahan kartu terasa instan, disertai rollback + Toast error jika pembaruan server gagal. Kolom Proyek (bawah) menampilkan tugas secara terurut otomatis tanpa drag-reorder terpisah.
- **Markdown**: Deskripsi/catatan pada `Project` dan `Task` dirender menggunakan parser/renderer Markdown yang aman dari XSS (misalnya `react-markdown` + `remark-gfm` tanpa raw HTML) dengan tab `Edit` / `Preview`.

---

## 5. Arsitektur Route & Struktur Halaman

Pemisahan dilakukan menggunakan **Next.js App Router Route Groups**:

```text
app/
├── api/
│   └── auth/
│       └── [...nextauth]/route.ts   # Endpoint Auth.js (Google OAuth callback & session)
├── (auth)/
│   ├── layout.tsx                   # Layout minimalis untuk halaman autentikasi
│   └── login/
│       └── page.tsx                 # Halaman masuk ("Masuk dengan Google")
└── (workspace)/
    ├── layout.tsx                   # Guard sesi (redirect ke /login jika belum login), Navbar, ToastProvider, ConfirmModalProvider
    ├── page.tsx                     # Dashboard Utama (Space Kanban + Proyek Aktif)
    └── projects/
        ├── page.tsx                 # Daftar & manajemen seluruh proyek
        └── [id]/
            └── page.tsx             # Detail proyek (Overview, Milestones, Tasks + Arsip)
```

**Aturan Guard Sesi**:
- Jika pengguna belum terautentikasi dan mengakses route di `(workspace)`, `layout.tsx` (dan/atau middleware/proxy redirect) mengarahkan ke `/login`.
- Jika pengguna sudah terautentikasi dan membuka `/login`, diarahkan ke `/`.
- Seluruh Server Actions dan query Prisma selalu mengambil `session.user.id` di server dan menolak akses bila tidak ada sesi atau `userId` tidak cocok.

---

## 6. Model Data (Skema Prisma & PostgreSQL)

### Model Auth.js Standar
- `User` (`id`, `name`, `email`, `emailVerified`, `image`, `theme`, `workspaceTitle`, `workspaceSubtitle`, `createdAt`, `updatedAt`, relasi ke `accounts`, `sessions`, `projects`, `milestones`, `tasks`)
- `Account`, `Session`, `VerificationToken` sesuai standar `@auth/prisma-adapter`.

### Enum Domain
- `ProjectStatus`: `ACTIVE` | `ON_HOLD` | `COMPLETED` | `ARCHIVED`
- `TaskStatus`: `BACKLOG` (*Belum dikerjakan*) | `ON_PROGRESS` (*Sedang dikerjakan*) | `REVIEW` (*Review*) | `DONE` (*Selesai*)
- `TaskPriority`: `LOW` (*Rendah*) | `MEDIUM` (*Sedang*) | `HIGH` (*Tinggi*)

### Tabel Domain
1. **`Project`**
   - `id`: `String @id @default(cuid())`
   - `userId`: `String` (relasi ke `User`, `onDelete: Cascade`)
   - `name`: `String`
   - `summary`: `String?` (deskripsi singkat 1–2 baris di header & kartu proyek)
   - `notes`: `String?` (catatan panjang format Markdown di tab `Catatan`)
   - `status`: `ProjectStatus @default(ACTIVE)`
   - `color`: `String` (token/kode warna solid identitas proyek untuk badge di Kanban)
   - `attributes`: `Json @default("[]")` (daftar atribut teknis dinamis `Array<{ id, label, value }>` yang dapat ditambah/edit/hapus bebas oleh pengguna, mis. Git Repository, Deployment, Database Endpoint, Target Rilis)
   - `createdAt`, `updatedAt`
   - Index: `@@index([userId, status])`

2. **`Milestone`**
   - `id`: `String @id @default(cuid())`
   - `projectId`: `String` (relasi ke `Project`, `onDelete: Cascade`)
   - `userId`: `String` (relasi ke `User`, `onDelete: Cascade`)
   - `title`: `String`
   - `description`: `String?`
   - `targetDate`: `DateTime?`
   - `order`: `Int @default(0)`
   - `createdAt`, `updatedAt`
   - Index: `@@index([projectId])`, `@@index([userId])`

3. **`Task`**
   - `id`: `String @id @default(cuid())`
   - `projectId`: `String` (relasi ke `Project`, `onDelete: Cascade`)
   - `milestoneId`: `String?` (relasi ke `Milestone`, `onDelete: SetNull`)
   - `userId`: `String` (relasi ke `User`, `onDelete: Cascade`)
   - `title`: `String`
   - `description`: `String?` (catatan/deskripsi tugas)
   - `status`: `TaskStatus @default(BACKLOG)`
   - `priority`: `TaskPriority @default(MEDIUM)`
   - `dueDate`: `DateTime?`
   - `order`: `Int @default(0)` (urutan tampilan di kolom Kanban)
   - `isArchived`: `Boolean @default(false)`
   - `archivedAt`: `DateTime?`
   - `createdAt`, `updatedAt`
   - Index: `@@index([userId, isArchived, status])`, `@@index([projectId, isArchived, status])`, `@@index([milestoneId])`

### Aturan Konsistensi Data
- **Perhitungan Progress Milestone**: dihitung dari seluruh tugas milik milestone tersebut (`count(status === DONE) / count(all)`), **termasuk** tugas `DONE` yang sudah `isArchived = true`, sehingga mengarsipkan tugas selesai dari papan harian tidak mengurangi persentase milestone.
- **Pindah Proyek pada Tugas**: jika sebuah tugas dipindahkan ke proyek lain melalui Modal Detail Tugas, `milestoneId` otomatis dikosongkan (`null`) kecuali pengguna memilih milestone baru dari proyek tujuan.
- **Perubahan Status Proyek**: mengubah proyek dari `ACTIVE` ke `ON_HOLD`/`COMPLETED`/`ARCHIVED` otomatis menyembunyikan proyek beserta tugasnya dari Dashboard Utama (`/`) tanpa mengubah `isArchived` pada tugas maupun menghapus data.

---

## 7. Desain Fitur & Alur Antarmuka

### A. Dashboard Utama (`/`)
1. **Header & Kontrol Layout**
   - Identitas Navbar yang dapat dikonfigurasi: **Judul Navbar** (default `"Space Kanban"`) + **Deskripsi Singkat** di bawahnya.
   - Navigasi: `Dashboard` (`/`) dan `Daftar Proyek` (`/projects`) — tanpa tab `Detail Proyek` di Navbar.
   - Menu **Akun & Tema** (Modal Pengaturan): mengubah Judul & Deskripsi Singkat Navbar, memilih salah satu dari 7 tema warna (*Sky Tactile 3D*), dan tombol `Keluar Akun` (memicu Modal konfirmasi kustom).
   - Kontrol Layout Split-Screen: tombol segmented solid dengan 3 pilihan:
     - `Split` (default, atas-bawah sesuai wireframe)
     - `Fokus Kanban` (menyembunyikan area Proyek bawah agar Kanban maksimal)
     - `Fokus Proyek` (menyembunyikan Space Kanban atas agar daftar Proyek maksimal)

2. **Area Atas — Space Kanban**
   - **Toolbar Kanban**:
     - Filter proyek: opsi `Semua Proyek Aktif` atau pilih satu proyek aktif tertentu.
     - Tombol `+ Tugas Baru` (membuka Modal buat tugas dengan pilihan proyek).
     - Tombol `Arsipkan Selesai` (aktif jika ada tugas di kolom `Selesai` sesuai filter yang aktif; memunculkan Modal konfirmasi kustom sebelum set `isArchived = true`).
   - **4 Kolom Status**:
     - `Belum dikerjakan` (`BACKLOG`)
     - `Sedang dikerjakan` (`ON_PROGRESS`)
     - `Review` (`REVIEW`)
     - `Selesai` (`DONE`)
     - Setiap kolom menampilkan header solid + badge jumlah tugas.
   - **Kartu Tugas (Kanban Card)**:
     - Menampilkan: badge solid nama proyek (memakai warna proyek), judul tugas, badge solid prioritas (`Rendah` / `Sedang` / `Tinggi`), target tanggal (jika ada; ditandai warna merah solid bila lewat tanggal hari ini dan belum `DONE`), serta badge kecil nama Milestone jika tertaut.
     - Mendukung drag-and-drop antar kolom dan pengurutan dalam kolom (`@dnd-kit`). Klik kartu membuka **Modal Detail/Edit Tugas**.

3. **Area Bawah — Proyek Aktif**
   - Menampilkan seluruh proyek berstatus `ACTIVE` dalam container **horizontal scroll** (kolom berlebar tetap agar nyaman untuk > 3 proyek).
   - **Empty State**: jika belum ada proyek `ACTIVE`, tampilkan ajakan solid untuk membuat proyek pertama atau membuka `/projects`.
   - **Setiap Kolom Proyek**:
     - Header dapat diklik langsung untuk membuka `/projects/[id]` (tanpa tombol `Detail` terpisah); menampilkan indikator warna proyek, judul proyek, jumlah tugas aktif, dan ikon panah halus.
     - Input/tombol `+ Tambah tugas cepat`: input cepat (cukup ketik judul lalu Enter, otomatis masuk status `Belum dikerjakan` pada proyek tersebut dan langsung muncul di Kanban atas) atau tombol buka Modal lengkap.
     - Daftar Tugas Aktif (`Sedang dikerjakan`, `Review`, `Belum dikerjakan`): otomatis diurutkan berdasarkan prioritas alur status (`ON_PROGRESS` -> `REVIEW` -> `BACKLOG`) lalu mengikuti `Task.order` (urutan Kanban), tanpa drag-and-drop terpisah di area bawah. Setiap baris menampilkan judul, badge status solid, dan badge prioritas. Klik baris membuka **Modal Detail/Edit Tugas**.
     - Seksi `Selesai (N)`: dikelompokkan dalam akordeon/bagian lipat (*collapsible*, tertutup secara default) yang memuat tugas `DONE` yang belum diarsipkan milik proyek tersebut.

### B. Modal Detail / Edit Tugas
- Dapat dibuka dari kartu Kanban maupun baris tugas di kolom Proyek bawah.
- Field yang dapat diedit:
  - Judul tugas (wajib)
  - Status (`Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai`)
  - Proyek tujuan (dropdown proyek pengguna)
  - Milestone (opsional, daftar milestone dari proyek terpilih)
  - Prioritas (`Rendah`, `Sedang`, `Tinggi`)
  - Target tanggal (opsional)
  - Deskripsi / catatan Markdown (mendukung mode tab `Edit` dan `Preview` dengan rendering heading, list, link, dan code block yang aman)
- Aksi footer: `Simpan Perubahan`, `Arsipkan` (tersedia jika status `Selesai`), dan `Hapus Tugas` (memicu Modal konfirmasi kustom).

### C. Halaman Daftar Proyek (`/projects`)
- Filter tab status: `Semua`, `Aktif`, `Ditunda`, `Selesai`, `Diarsipkan`.
- Tombol `+ Proyek Baru` yang membuka Modal pembuatan proyek (nama, warna identitas, status awal, deskripsi singkat).
- Grid kartu proyek: menampilkan warna identitas, nama, badge status solid, ringkasan progress tugas (`X/Y Selesai`), dan kontrol cepat ubah status proyek. Klik kartu proyek langsung membuka `/projects/[id]` (tanpa tombol `Detail` terpisah).

### D. Halaman Detail Proyek (`/projects/[id]`)
- **Header Proyek**: badge status, nama proyek, deskripsi singkat di bawah judul, serta ringkasan statistik (`Tugas Tuntas X/Y`, `Selesai Z%`) + tombol `+ Tugas Baru` langsung di kanan header.
- **2 Tampilan (Detail Awal & Milestones)**:
  1. **Halaman Detail Awal (`Tugas & Catatan`, default layout 2 kolom)**:
     - Kiri (~2/3): **Daftar Tugas Khusus Proyek Ini** (filter status `Semua Status`, `Belum dikerjakan`, `Sedang dikerjakan`, `Review`, `Selesai`, serta `Riwayat Arsip` dengan tombol `Pulihkan ke Board`, klik baris untuk edit tugas) dan tepat di bawahnya **Catatan Proyek (Markdown)** dengan mode `Edit` / `Preview`.
     - Kanan (~1/3): **Informasi Teknis & Atribut** menampilkan daftar atribut dinamis (`label` + `value`, otomatis menjadi link jika berawalan `http://`/`https://`), tombol `Edit Konfigurasi` (buka Modal untuk edit metadata proyek dan tambah/ubah/hapus baris atribut secara bebas), serta tombol hapus proyek (ikon tempat sampah dengan Modal konfirmasi kustom).
  2. **Milestones** *(satu tombol tab terpisah di atas)*:
     - Tombol `+ Tambah Milestone` (judul, deskripsi opsional, target tanggal opsional).
     - Kartu per Milestone menampilkan progress bar otomatis (`N/M tugas selesai`, persentase), daftar tugas tertaut, tombol edit/hapus milestone (dengan konfirmasi Modal), dan aksi cepat `+ Tugas` langsung ke milestone tersebut.

### E. Sistem Feedback Kustom: Toast & Modal (*DevFlow Cute Solid*)
1. **Toast (`ToastProvider` + `useToast`)**
   - Posisi tetap (pojok kanan bawah pada desktop, atas-tengah pada mobile).
   - 4 varian solid kontras tinggi dengan `border-2 border-[#1C1917]` + `shadow-[0_3px_0_#1C1917]` + `rounded-2xl`: `success` (`#15803D` + teks `#FFFFFF`), `error` (`#BE123C` + teks `#FFFFFF`), `warning` (`#B45309` + teks `#FFFFFF`), `info` (`#0369A1` + teks `#FFFFFF`).
   - Auto-dismiss (3,5 detik) dengan tombol tutup manual `×`.
2. **Modal (`Modal` & `ConfirmModal` via `useConfirm`)**
   - Backdrop scrim gelap standar untuk meredupkan konten di belakangnya; kontainer dialog 100% solid `#FFFFFF` dengan `border-2 border-[#1C1917]` + `shadow-[0_4px_0_#1C1917]` + `rounded-3xl`, tanpa `backdrop-blur`.
   - `Modal` umum digunakan untuk form (Detail Tugas, Proyek Baru, Edit Proyek, Milestone).
   - `ConfirmModal` digunakan untuk seluruh konfirmasi destruktif atau massal (hapus tugas, hapus proyek, hapus milestone, arsipkan semua tugas selesai, keluar akun) dengan tombol aksi solid (`shadow-[0_2px_0_#1C1917]`).

---

## 8. Hal yang Diserahkan ke Implementer (What's Left to the Builder)

- **Mapping warna proyek**: pemilihan preset warna kategori dari palet *DevFlow Cute Solid* (`#E0F2FE`, `#FEF3C7`, `#DCFCE7`, `#FED7AA`, `#FECDD3`, `#FEF08A`, dll.) untuk opsi warna identitas proyek.
- **Organisasi direktori kode**: pembagian folder `lib/` (Prisma client singleton dengan `@prisma/adapter-pg`, konfigurasi Auth.js, helper validasi), `actions/` (Server Actions), dan `components/` (`ui/toast`, `ui/modal`, `kanban/`, `projects/`).
- **Validasi input & error handling**: implementasi skema validasi payload di server sebelum menulis ke Prisma serta pesan error Bahasa Indonesia yang jelas.
- **Konfigurasi environment template**: menyediakan `.env.example` yang mendokumentasikan `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, dan `AUTH_GOOGLE_SECRET`, serta script `prisma/schema.prisma` dan konfigurasi Prisma 7 (`prisma.config.ts` jika diperlukan oleh Prisma 7 CLI).
