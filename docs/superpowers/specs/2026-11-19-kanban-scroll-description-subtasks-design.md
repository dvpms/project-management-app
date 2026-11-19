# Desain Fitur: Scroll Vertikal Kanban, Pratinjau Deskripsi Card, dan Sub-tugas Mandiri

**Tanggal:** 2026-11-19
**Status:** Disetujui

## 1. Tujuan
Menambahkan tiga peningkatan alur kerja eksekusi harian di **Space Kanban** agar tetap nyaman saat daftar tugas membesar:
1. **Scroll vertikal per kolom** pada Space Kanban dan per kartu pada Proyek Aktif agar tampilan tetap terstruktur tanpa memanjangkan halaman secara berlebihan.
2. **Pratinjau deskripsi tugas** langsung pada card Kanban dan baris tugas di halaman detail proyek.
3. **Sub-tugas 1 tingkat** yang tampil sebagai card mandiri di papan Space Kanban, sementara tugas induk bertindak sebagai wadah progres di daftar proyek.

## 2. Pendekatan yang Dipilih
- **Self-referential `Task.parentId` (maksimal 1 level):** Sub-tugas disimpan di tabel `tasks` yang sama melalui relasi opsional `parentId -> Task.id` (`onDelete: Cascade`).
- **Alasan pemilihan:** Atribut sub-tugas sama lengkapnya dengan tugas biasa (judul, deskripsi, prioritas, tenggat, status), sehingga `@dnd-kit`, `moveTaskAction`, `TaskDetailModal`, arsip, dan pengurutan berjalan seragam tanpa duplikasi komponen atau skema.
- **Pendekatan yang ditolak:** Tabel `Subtask` terpisah, karena akan menggandakan union type dan alur sinkronisasi Kanban/modal.

## 3. Aturan Desain & Perilaku

### A. Scroll Vertikal
- **`KanbanColumn`:** Header kolom (dot warna, judul, jumlah tugas, tombol `+` / `Arsipkan`) tetap menempel di atas (`shrink-0`). Area kartu di bawahnya dapat di-scroll vertikal:
  - Mode **Split:** `max-h-[520px]`
  - Mode **Fokus Kanban:** `max-h-[calc(100vh-240px)] min-h-[420px]`
  - `DragOverlay` dirender di luar container scroll agar proses drag antar kolom tidak terpotong.
- **`ProjectTasksColumn`:** Header link proyek dan form quick-add tetap menempel di atas; daftar tugas aktif dan akordeon Selesai berada di area scroll vertikal `max-h-[360px]`.

### B. Pratinjau Deskripsi di Card
- Helper `stripMarkdownToPlainText` membersihkan sintaks Markdown umum (`#`, `*`, `_`, backtick, blok kode, tautan `[teks](url)`, gambar `![alt](url)`, blockquote `>`, list marker) menjadi teks polos ringkas.
- **Card Kanban (`KanbanTaskCard`):** Menampilkan maksimal 2 baris (`line-clamp-2`) pratinjau teks polos di bawah judul jika deskripsi tidak kosong.
- **Daftar Tugas (`/projects/[id]`):** Menampilkan pratinjau deskripsi hingga 2 baris pada tugas utama dan 1 baris pada sub-tugas.
- **Kartu Proyek Aktif (`/`):** Tetap ringkas (judul + badge progres/status) tanpa deskripsi.

### C. Sub-tugas & Tugas Induk
- **Tampilan papan Kanban (`SpaceKanbanBoard`):** Hanya unit eksekusi aktif (`isArchived: false`) yang muncul di Kanban — yaitu **tugas tunggal** (tanpa sub-tugas) dan **seluruh sub-tugas**. Tugas induk yang memiliki minimal 1 sub-tugas otomatis menjadi *wadah* dan tidak tampil di Kanban.
- **Kedalaman & pewarisan:** Maksimal 1 level (`parent.parentId === null` wajib). Sub-tugas otomatis mewarisi `projectId` dan `milestoneId` induknya; perubahan proyek/milestone pada induk ikut memperbarui seluruh sub-tugas.
- **Derivasi status induk otomatis (server & optimis):**
  - Semua sub-tugas `DONE` → Induk `DONE`
  - Semua sub-tugas `BACKLOG` → Induk `BACKLOG`
  - Ada `ON_PROGRESS` atau campuran `BACKLOG` + status lain → Induk `ON_PROGRESS`
  - Sisanya hanya `REVIEW` & `DONE` (dengan minimal satu `REVIEW`) → Induk `REVIEW`
- **Arsip & hapus:**
  - Sub-tugas `DONE` yang diarsipkan tetap dihitung pada progres `X/Y` induk dan progres proyek/milestone.
  - Jika seluruh sub-tugas diarsipkan, induk otomatis ikut diarsipkan; jika salah satu sub-tugas dipulihkan (atau sub-tugas baru ditambahkan), induk otomatis aktif kembali.
  - Menghapus induk akan menghapus seluruh sub-tugas (`onDelete: Cascade`). Jika semua sub-tugas dihapus satu per satu hingga kosong, induk kembali menjadi tugas tunggal di Kanban.
- **Progres proyek & milestone:** Menghitung **unit eksekusi** (tugas tunggal + seluruh sub-tugas, tanpa *double-counting* tugas induk).
