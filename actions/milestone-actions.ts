"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth-guard";
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
} from "@/lib/validations/milestone";
import {
  createMilestone,
  deleteMilestone,
  updateMilestone,
} from "@/services/milestone-service";

export interface ActionResponse<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function createMilestoneAction(
  input: CreateMilestoneInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = createMilestoneSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const created = await createMilestone(userId, parsed.data);
    revalidatePath(`/projects/${created.projectId}`);
    return { ok: true, data: { id: created.id } };
  } catch (err) {
    console.error("createMilestoneAction error:", err);
    return { ok: false, error: "Gagal menambahkan milestone." };
  }
}

export async function updateMilestoneAction(
  input: UpdateMilestoneInput
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const parsed = updateMilestoneSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const updated = await updateMilestone(userId, parsed.data);
    revalidatePath(`/projects/${updated.projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("updateMilestoneAction error:", err);
    return { ok: false, error: "Gagal memperbarui milestone." };
  }
}

export async function deleteMilestoneAction(
  milestoneId: string
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const projectId = await deleteMilestone(userId, milestoneId);
    revalidatePath("/");
    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("deleteMilestoneAction error:", err);
    return { ok: false, error: "Gagal menghapus milestone." };
  }
}
