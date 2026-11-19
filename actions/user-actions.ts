"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth-guard";
import type { ThemeId } from "@/lib/theme-presets";
import {
  updateUserThemeSchema,
  updateWorkspaceIdentitySchema,
  type UpdateWorkspaceIdentityInput,
} from "@/lib/validations/user-settings";
import {
  updateUserTheme,
  updateWorkspaceIdentity,
} from "@/services/user-service";

export interface ActionResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function updateThemeAction(
  theme: ThemeId
): Promise<ActionResult<{ theme: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = updateUserThemeSchema.safeParse({ theme });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const updated = await updateUserTheme(userId, parsed.data.theme);
    revalidatePath("/", "layout");
    return { ok: true, data: { theme: updated.theme } };
  } catch (err) {
    console.error("updateThemeAction error:", err);
    return { ok: false, error: "Gagal menyimpan preferensi tema." };
  }
}

export async function updateWorkspaceIdentityAction(
  input: UpdateWorkspaceIdentityInput
): Promise<ActionResult<{ workspaceTitle: string; workspaceSubtitle: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = updateWorkspaceIdentitySchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const updated = await updateWorkspaceIdentity(userId, parsed.data);
    revalidatePath("/", "layout");
    return {
      ok: true,
      data: {
        workspaceTitle: updated.workspaceTitle,
        workspaceSubtitle: updated.workspaceSubtitle,
      },
    };
  } catch (err) {
    console.error("updateWorkspaceIdentityAction error:", err);
    return { ok: false, error: "Gagal menyimpan pengaturan workspace." };
  }
}
