"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth-guard";
import {
  createProjectSchema,
  updateProjectConfigSchema,
  updateProjectNotesSchema,
  updateProjectStatusSchema,
  type CreateProjectInput,
  type UpdateProjectConfigInput,
  type UpdateProjectNotesInput,
  type UpdateProjectStatusInput,
} from "@/lib/validations/project";
import {
  createProject,
  deleteProject,
  updateProjectConfig,
  updateProjectNotes,
  updateProjectStatus,
} from "@/services/project-service";

export interface ActionResponse<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function createProjectAction(
  input: CreateProjectInput
): Promise<ActionResponse<{ id: string; name: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const created = await createProject(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/projects");
    return { ok: true, data: created };
  } catch (err) {
    console.error("createProjectAction error:", err);
    return { ok: false, error: "Gagal membuat proyek baru." };
  }
}

export async function updateProjectConfigAction(
  input: UpdateProjectConfigInput
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const parsed = updateProjectConfigSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    await updateProjectConfig(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${parsed.data.projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("updateProjectConfigAction error:", err);
    return { ok: false, error: "Gagal memperbarui konfigurasi proyek." };
  }
}

export async function updateProjectNotesAction(
  input: UpdateProjectNotesInput
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const parsed = updateProjectNotesSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    await updateProjectNotes(userId, parsed.data);
    revalidatePath(`/projects/${parsed.data.projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("updateProjectNotesAction error:", err);
    return { ok: false, error: "Gagal menyimpan catatan proyek." };
  }
}

export async function updateProjectStatusAction(
  input: UpdateProjectStatusInput
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const parsed = updateProjectStatusSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    await updateProjectStatus(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${parsed.data.projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("updateProjectStatusAction error:", err);
    return { ok: false, error: "Gagal mengubah status proyek." };
  }
}

export async function deleteProjectAction(
  projectId: string
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    await deleteProject(userId, projectId);
    revalidatePath("/");
    revalidatePath("/projects");
    return { ok: true };
  } catch (err) {
    console.error("deleteProjectAction error:", err);
    return { ok: false, error: "Gagal menghapus proyek." };
  }
}
