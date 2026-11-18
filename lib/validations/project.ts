import { z } from "zod";

export const PROJECT_STATUS_VALUES = [
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
] as const;

export const PROJECT_COLOR_VALUES = [
  "sky",
  "emerald",
  "orange",
  "rose",
  "amber",
  "teal",
] as const;

export const projectAttributeSchema = z.object({
  id: z.string().trim().min(1),
  label: z
    .string()
    .trim()
    .min(1, "Label atribut wajib diisi.")
    .max(50, "Label atribut maksimal 50 karakter."),
  value: z
    .string()
    .trim()
    .min(1, "Nilai atribut wajib diisi.")
    .max(300, "Nilai atribut maksimal 300 karakter."),
});

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama proyek wajib diisi.")
    .max(80, "Nama proyek maksimal 80 karakter."),
  summary: z
    .string()
    .trim()
    .max(240, "Deskripsi singkat maksimal 240 karakter.")
    .optional(),
  status: z.enum(PROJECT_STATUS_VALUES).default("ACTIVE"),
  color: z.enum(PROJECT_COLOR_VALUES).default("sky"),
});

export const updateProjectConfigSchema = z.object({
  projectId: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(1, "Nama proyek wajib diisi.")
    .max(80, "Nama proyek maksimal 80 karakter."),
  summary: z
    .string()
    .trim()
    .max(240, "Deskripsi singkat maksimal 240 karakter.")
    .optional(),
  status: z.enum(PROJECT_STATUS_VALUES),
  color: z.enum(PROJECT_COLOR_VALUES),
  attributes: z.array(projectAttributeSchema).max(30, "Maksimal 30 atribut."),
});

export const updateProjectNotesSchema = z.object({
  projectId: z.string().min(1),
  notes: z.string().max(50000, "Catatan terlalu panjang."),
});

export const updateProjectStatusSchema = z.object({
  projectId: z.string().min(1),
  status: z.enum(PROJECT_STATUS_VALUES),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectConfigInput = z.infer<typeof updateProjectConfigSchema>;
export type UpdateProjectNotesInput = z.infer<typeof updateProjectNotesSchema>;
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
