"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth-guard";
import {
  archiveDoneTasksSchema,
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type MoveTaskInput,
  type UpdateTaskInput,
} from "@/lib/validations/task";
import {
  archiveDoneTasks,
  archiveSingleTask,
  createTask,
  deleteTask,
  moveTask,
  restoreTask,
  updateTask,
} from "@/services/task-service";

export interface ActionResponse<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function createTaskAction(
  input: CreateTaskInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const userId = await requireUserId();
    const parsed = createTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const created = await createTask(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${created.projectId}`);
    return { ok: true, data: { id: created.id } };
  } catch (err) {
    console.error("createTaskAction error:", err);
    return { ok: false, error: "Gagal membuat tugas." };
  }
}

export async function updateTaskAction(
  input: UpdateTaskInput
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const parsed = updateTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const updated = await updateTask(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${updated.projectId}`);
    if (updated.previousProjectId !== updated.projectId) {
      revalidatePath(`/projects/${updated.previousProjectId}`);
    }
    return { ok: true };
  } catch (err) {
    console.error("updateTaskAction error:", err);
    return { ok: false, error: "Gagal memperbarui tugas." };
  }
}

export async function moveTaskAction(
  input: MoveTaskInput
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const parsed = moveTaskSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const projectIds = await moveTask(userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/projects");
    for (const pid of projectIds) {
      revalidatePath(`/projects/${pid}`);
    }
    return { ok: true };
  } catch (err) {
    console.error("moveTaskAction error:", err);
    return { ok: false, error: "Gagal memindahkan tugas." };
  }
}

export async function archiveDoneTasksAction(
  projectId?: string | null
): Promise<ActionResponse<{ count: number }>> {
  try {
    const userId = await requireUserId();
    const parsed = archiveDoneTasksSchema.safeParse({ projectId });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message };
    }

    const { count, projectIds } = await archiveDoneTasks(
      userId,
      parsed.data.projectId
    );
    revalidatePath("/");
    revalidatePath("/projects");
    const affectedProjects = new Set<string>(projectIds);
    if (parsed.data.projectId) {
      affectedProjects.add(parsed.data.projectId);
    }
    for (const pid of affectedProjects) {
      revalidatePath(`/projects/${pid}`);
    }
    return { ok: true, data: { count } };
  } catch (err) {
    console.error("archiveDoneTasksAction error:", err);
    return { ok: false, error: "Gagal mengarsipkan tugas selesai." };
  }
}

export async function archiveSingleTaskAction(
  taskId: string
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const projectId = await archiveSingleTask(userId, taskId);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("archiveSingleTaskAction error:", err);
    return { ok: false, error: "Gagal mengarsipkan tugas." };
  }
}

export async function restoreTaskAction(
  taskId: string
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const projectId = await restoreTask(userId, taskId);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("restoreTaskAction error:", err);
    return { ok: false, error: "Gagal memulihkan tugas." };
  }
}

export async function deleteTaskAction(
  taskId: string
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    const projectId = await deleteTask(userId, taskId);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { ok: true };
  } catch (err) {
    console.error("deleteTaskAction error:", err);
    return { ok: false, error: "Gagal menghapus tugas." };
  }
}
