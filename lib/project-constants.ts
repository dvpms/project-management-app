import type {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "@/app/generated/prisma/enums";
import type { BadgeVariant } from "@/components/ui";

export type ProjectColorTone =
  | "sky"
  | "emerald"
  | "orange"
  | "rose"
  | "amber"
  | "teal";

export interface ProjectAttribute {
  id: string;
  label: string;
  value: string;
}

export const PROJECT_COLOR_OPTIONS: Array<{
  value: ProjectColorTone;
  label: string;
  dotClass: string;
}> = [
  { value: "sky", label: "Sky Blue", dotClass: "bg-[#0284C7]" },
  { value: "emerald", label: "Emerald Green", dotClass: "bg-[#059669]" },
  { value: "orange", label: "Warm Orange", dotClass: "bg-[#EA580C]" },
  { value: "rose", label: "Berry Rose", dotClass: "bg-[#E11D48]" },
  { value: "amber", label: "Sunny Amber", dotClass: "bg-[#D97706]" },
  { value: "teal", label: "Fresh Teal", dotClass: "bg-[#0D9488]" },
];

export const PROJECT_COLOR_DOT: Record<ProjectColorTone, string> = {
  sky: "bg-[#0284C7]",
  emerald: "bg-[#059669]",
  orange: "bg-[#EA580C]",
  rose: "bg-[#E11D48]",
  amber: "bg-[#D97706]",
  teal: "bg-[#0D9488]",
};

export function resolveProjectTone(color: string): ProjectColorTone {
  return color in PROJECT_COLOR_DOT ? (color as ProjectColorTone) : "sky";
}

export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; badgeVariant: BadgeVariant }
> = {
  ACTIVE: { label: "Aktif", badgeVariant: "success" },
  ON_HOLD: { label: "Ditunda", badgeVariant: "warning" },
  COMPLETED: { label: "Selesai", badgeVariant: "info" },
  ARCHIVED: { label: "Diarsipkan", badgeVariant: "neutral" },
};

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
  { label: string; badgeVariant: "neutral" | "warning" | "danger"; textColor: string }
> = {
  LOW: { label: "Rendah", badgeVariant: "neutral", textColor: "text-[#0284C7]" },
  MEDIUM: { label: "Sedang", badgeVariant: "warning", textColor: "text-[#D97706]" },
  HIGH: { label: "Tinggi", badgeVariant: "danger", textColor: "text-[#E11D48]" },
};

export function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function parseProjectAttributes(raw: unknown): ProjectAttribute[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is ProjectAttribute => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.label === "string" &&
      typeof candidate.value === "string"
    );
  });
}

export function formatDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}
