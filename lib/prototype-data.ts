export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
export type TaskStatus = "BACKLOG" | "ON_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type ProjectColorTone =
  | "sky"
  | "emerald"
  | "orange"
  | "rose"
  | "amber"
  | "teal";

export interface ProtoProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  tone: ProjectColorTone;
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  targetDate?: string;
}

export interface ProtoMilestone {
  id: string;
  projectId: string;
  title: string;
  targetDate?: string;
}

export interface ProtoTask {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  order: number;
  isArchived: boolean;
}

export const KANBAN_COLUMNS: Array<{
  id: TaskStatus;
  label: string;
  dotColor: string;
}> = [
  { id: "BACKLOG", label: "Belum dikerjakan", dotColor: "bg-[#64748B]" },
  { id: "ON_PROGRESS", label: "Sedang dikerjakan", dotColor: "bg-[#0284C7]" },
  { id: "REVIEW", label: "Review", dotColor: "bg-[#D97706]" },
  { id: "DONE", label: "Selesai", dotColor: "bg-[#16A34A]" },
];

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; badgeVariant: "success" | "warning" | "info" | "neutral" }
> = {
  ACTIVE: { label: "Aktif", badgeVariant: "success" },
  ON_HOLD: { label: "Ditunda", badgeVariant: "warning" },
  COMPLETED: { label: "Selesai", badgeVariant: "info" },
  ARCHIVED: { label: "Diarsipkan", badgeVariant: "neutral" },
};

export const TASK_STATUS_META: Record<
  TaskStatus,
  { label: string; badgeVariant: "neutral" | "info" | "warning" | "success" }
> = {
  BACKLOG: { label: "Belum dikerjakan", badgeVariant: "neutral" },
  ON_PROGRESS: { label: "Sedang dikerjakan", badgeVariant: "info" },
  REVIEW: { label: "Review", badgeVariant: "warning" },
  DONE: { label: "Selesai", badgeVariant: "success" },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badgeVariant: "neutral" | "warning" | "danger" }
> = {
  LOW: { label: "Rendah", badgeVariant: "neutral" },
  MEDIUM: { label: "Sedang", badgeVariant: "warning" },
  HIGH: { label: "Tinggi", badgeVariant: "danger" },
};

export const PROJECT_COLOR_DOT: Record<ProjectColorTone, string> = {
  sky: "bg-[#0284C7]",
  emerald: "bg-[#059669]",
  orange: "bg-[#EA580C]",
  rose: "bg-[#E11D48]",
  amber: "bg-[#D97706]",
  teal: "bg-[#0D9488]",
};

const ACTIVE_STATUS_WEIGHT: Record<TaskStatus, number> = {
  ON_PROGRESS: 0,
  REVIEW: 1,
  BACKLOG: 2,
  DONE: 3,
};

export function sortProjectActiveTasks(tasks: ProtoTask[]): ProtoTask[] {
  return [...tasks].sort((a, b) => {
    const weightDiff = ACTIVE_STATUS_WEIGHT[a.status] - ACTIVE_STATUS_WEIGHT[b.status];
    if (weightDiff !== 0) return weightDiff;
    return a.order - b.order;
  });
}

export const INITIAL_PROJECTS: ProtoProject[] = [
  {
    id: "p1",
    name: "Space Kanban",
    description:
      "Aplikasi manajemen proyek pribadi dengan papan Kanban lintas proyek dan daftar tugas per proyek.\n\n- Fokus eksekusi harian di `/`.\n- Manajemen detail proyek & milestone di `/projects`.",
    status: "ACTIVE",
    tone: "sky",
    techStack: ["Next.js 16", "Prisma 7", "PostgreSQL", "Tailwind v4"],
    repoUrl: "https://github.com/contoh/space-kanban",
    liveUrl: "https://space-kanban.example.com",
    targetDate: "2026-12-10",
  },
  {
    id: "p2",
    name: "API Gateway",
    description:
      "Layanan gateway internal untuk rate limiting, validasi JWT, dan logging terpusat.",
    status: "ACTIVE",
    tone: "emerald",
    techStack: ["Go", "Redis", "PostgreSQL"],
    repoUrl: "https://github.com/contoh/api-gateway",
    targetDate: "2026-11-30",
  },
  {
    id: "p3",
    name: "Landing Toko",
    description:
      "Landing page katalog produk ringan dengan fokus performa dan form pemesanan cepat.",
    status: "ACTIVE",
    tone: "orange",
    techStack: ["Astro", "Tailwind CSS"],
    liveUrl: "https://toko.example.com",
    targetDate: "2026-11-25",
  },
  {
    id: "p4",
    name: "Mobile Tracker",
    description: "Aplikasi pencatat kebiasaan harian versi mobile (sedang ditunda).",
    status: "ON_HOLD",
    tone: "rose",
    techStack: ["Flutter", "SQLite"],
  },
];

export const INITIAL_MILESTONES: ProtoMilestone[] = [
  { id: "m1", projectId: "p1", title: "M1: Auth & Skema Database", targetDate: "2026-11-22" },
  { id: "m2", projectId: "p1", title: "M2: Dashboard Kanban Sinkron", targetDate: "2026-12-01" },
  { id: "m3", projectId: "p2", title: "M1: Rate Limiter Redis", targetDate: "2026-11-24" },
];

export const INITIAL_TASKS: ProtoTask[] = [
  {
    id: "t1",
    projectId: "p1",
    milestoneId: "m1",
    title: "Setup skema Prisma 7 & adapter-pg",
    description: "Tambahkan model User, Project, Milestone, dan Task beserta index komposit.",
    status: "ON_PROGRESS",
    priority: "HIGH",
    dueDate: "2026-11-20",
    order: 0,
    isArchived: false,
  },
  {
    id: "t2",
    projectId: "p1",
    milestoneId: "m2",
    title: "Implementasi drag-and-drop Space Kanban",
    description: "Gunakan @dnd-kit dengan optimistic update dan rollback jika server error.",
    status: "BACKLOG",
    priority: "MEDIUM",
    dueDate: "2026-11-24",
    order: 0,
    isArchived: false,
  },
  {
    id: "t3",
    projectId: "p1",
    milestoneId: "m1",
    title: "Halaman login Google OAuth (auth)",
    description: "Pisahkan di route group `(auth)/login`.",
    status: "DONE",
    priority: "HIGH",
    order: 0,
    isArchived: false,
  },
  {
    id: "t4",
    projectId: "p2",
    milestoneId: "m3",
    title: "Middleware token bucket per IP",
    description: "Batasi 100 request/menit per IP menggunakan Redis.",
    status: "REVIEW",
    priority: "HIGH",
    dueDate: "2026-11-21",
    order: 0,
    isArchived: false,
  },
  {
    id: "t5",
    projectId: "p2",
    title: "Benchmark endpoint /health & /metrics",
    description: "Pastikan p99 di bawah 15ms.",
    status: "BACKLOG",
    priority: "LOW",
    order: 1,
    isArchived: false,
  },
  {
    id: "t6",
    projectId: "p3",
    title: "Slicing section testimoni solid",
    description: "Gunakan kartu solid tanpa transparansi.",
    status: "ON_PROGRESS",
    priority: "MEDIUM",
    dueDate: "2026-11-22",
    order: 1,
    isArchived: false,
  },
  {
    id: "t7",
    projectId: "p3",
    title: "Optimasi gambar katalog WebP",
    description: "Kompres seluruh aset produk di bawah 120KB.",
    status: "DONE",
    priority: "LOW",
    order: 1,
    isArchived: false,
  },
  {
    id: "t8",
    projectId: "p1",
    milestoneId: "m1",
    title: "Inisialisasi proyek Next.js 16 & DESIGN.md",
    description: "Sudah selesai dan diarsipkan dari papan harian.",
    status: "DONE",
    priority: "MEDIUM",
    order: 0,
    isArchived: true,
  },
];
