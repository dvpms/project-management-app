import { z } from "zod";

export const createMilestoneSchema = z.object({
  projectId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(1, "Judul milestone wajib diisi.")
    .max(100, "Judul milestone maksimal 100 karakter."),
  description: z
    .string()
    .trim()
    .max(1000, "Deskripsi milestone maksimal 1000 karakter.")
    .optional(),
  targetDate: z.string().trim().optional().nullable(),
});

export const updateMilestoneSchema = createMilestoneSchema.extend({
  milestoneId: z.string().min(1),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
