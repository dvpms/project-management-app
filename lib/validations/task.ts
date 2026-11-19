import { z } from "zod";

export const TASK_STATUS_VALUES = [
  "BACKLOG",
  "ON_PROGRESS",
  "REVIEW",
  "DONE",
] as const;

export const TASK_PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "Proyek wajib dipilih."),
  milestoneId: z.string().trim().optional().nullable(),
  title: z
    .string()
    .trim()
    .min(1, "Judul tugas wajib diisi.")
    .max(140, "Judul tugas maksimal 140 karakter."),
  description: z.string().max(20000, "Deskripsi tugas terlalu panjang.").optional(),
  status: z.enum(TASK_STATUS_VALUES).default("BACKLOG"),
  priority: z.enum(TASK_PRIORITY_VALUES).default("MEDIUM"),
  dueDate: z.string().trim().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().min(1),
});

export const moveTaskSchema = z.object({
  taskId: z.string().min(1),
  targetStatus: z.enum(TASK_STATUS_VALUES),
  orderedTaskIds: z.array(z.string().min(1)),
});

export const archiveDoneTasksSchema = z.object({
  projectId: z.string().trim().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
