import { z } from "zod";

export const THEME_IDS = [
  "sky-blue",
  "emerald-mint",
  "warm-cream",
  "berry-rose",
  "pink-purple",
  "sakura-pink",
  "midnight-dark",
] as const;

export const updateUserThemeSchema = z.object({
  theme: z.enum(THEME_IDS, {
    message: "Pilihan tema warna tidak valid.",
  }),
});

export const updateWorkspaceIdentitySchema = z.object({
  workspaceTitle: z
    .string()
    .trim()
    .min(1, "Judul workspace wajib diisi.")
    .max(40, "Judul workspace maksimal 40 karakter."),
  workspaceSubtitle: z
    .string()
    .trim()
    .max(100, "Deskripsi singkat maksimal 100 karakter."),
});

export type UpdateWorkspaceIdentityInput = z.infer<
  typeof updateWorkspaceIdentitySchema
>;
