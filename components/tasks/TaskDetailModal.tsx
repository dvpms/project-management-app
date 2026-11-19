"use client";

import { useState, useTransition } from "react";
import {
  archiveSingleTaskAction,
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/actions/task-actions";
import type { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";
import {
  Button,
  FormField,
  Icon,
  Input,
  MarkdownEditor,
  Modal,
  Select,
  useConfirm,
  useToast,
} from "@/components/ui";
import { KANBAN_COLUMNS } from "@/lib/project-constants";

export interface TaskModalProjectOption {
  id: string;
  name: string;
}

export interface TaskModalMilestoneOption {
  id: string;
  projectId: string;
  title: string;
}

export interface EditableTaskItem {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  isArchived: boolean;
}

interface TaskDetailModalProps {
  open: boolean;
  task: EditableTaskItem | null;
  defaultProjectId?: string;
  defaultMilestoneId?: string;
  defaultStatus?: TaskStatus;
  projects: TaskModalProjectOption[];
  milestones: TaskModalMilestoneOption[];
  onClose: () => void;
  onSuccess?: () => void;
}

function TaskDetailModalInner({
  task,
  defaultProjectId,
  defaultMilestoneId,
  defaultStatus = "BACKLOG",
  projects,
  milestones,
  onClose,
  onSuccess,
}: Omit<TaskDetailModalProps, "open">) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(task?.title ?? "");
  const [projectId, setProjectId] = useState(
    task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? ""
  );
  const [milestoneId, setMilestoneId] = useState(
    task?.milestoneId ?? defaultMilestoneId ?? ""
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "MEDIUM"
  );
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [titleError, setTitleError] = useState("");

  const availableMilestones = milestones.filter((m) => m.projectId === projectId);

  const handleProjectChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    const valid = milestones.some(
      (m) => m.id === milestoneId && m.projectId === nextProjectId
    );
    if (!valid) setMilestoneId("");
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError("Judul tugas wajib diisi.");
      return;
    }

    startTransition(async () => {
      const payload = {
        projectId,
        milestoneId: milestoneId || null,
        title: title.trim(),
        description,
        status,
        priority,
        dueDate: dueDate || null,
      };

      const res = task
        ? await updateTaskAction({ ...payload, taskId: task.id })
        : await createTaskAction(payload);

      if (!res.ok) {
        showToast({
          title: "Gagal menyimpan tugas",
          description: res.error,
          variant: "error",
        });
        return;
      }

      showToast({
        title: task ? "Perubahan tugas disimpan" : "Tugas baru dibuat!",
        variant: "success",
      });
      onSuccess?.();
      onClose();
    });
  };

  const handleArchive = () => {
    if (!task) return;
    startTransition(async () => {
      const res = await archiveSingleTaskAction(task.id);
      if (!res.ok) {
        showToast({ title: "Gagal mengarsipkan", description: res.error, variant: "error" });
        return;
      }
      showToast({ title: "Tugas dipindahkan ke Riwayat Arsip", variant: "info" });
      onSuccess?.();
      onClose();
    });
  };

  const handleDelete = async () => {
    if (!task) return;
    const ok = await confirm({
      title: "Hapus Tugas?",
      message: `Tugas "${task.title}" akan dihapus permanen dari proyek dan papan Space Kanban.`,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      tone: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteTaskAction(task.id);
      if (!res.ok) {
        showToast({ title: "Gagal menghapus", description: res.error, variant: "error" });
        return;
      }
      showToast({ title: "Tugas dihapus", variant: "info" });
      onSuccess?.();
      onClose();
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? "Detail & Edit Tugas" : "Buat Tugas Baru"}
      description={
        task
          ? "Perubahan langsung tersinkron antara Space Kanban dan detail proyek."
          : "Tugas baru otomatis masuk ke Space Kanban dan daftar proyek."
      }
      size="lg"
      headerTone={task ? "blue" : "white"}
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {task && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Icon name="delete" size="sm" />}
                onClick={handleDelete}
                disabled={isPending}
              >
                Hapus
              </Button>
            )}
            {task && status === "DONE" && !task.isArchived && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Icon name="inventory_2" size="sm" />}
                onClick={handleArchive}
                disabled={isPending}
              >
                Arsipkan
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button
              variant="primary"
              leftIcon={<Icon name="save" size="sm" />}
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Menyimpan..." : task ? "Simpan Perubahan" : "Tambah Tugas"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <FormField label="Judul Tugas" htmlFor="task-title" required error={titleError}>
          <Input
            id="task-title"
            hasError={Boolean(titleError)}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            placeholder="Contoh: Integrasi Google OAuth"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField label="Status Kanban" htmlFor="task-status">
            <Select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {KANBAN_COLUMNS.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Prioritas" htmlFor="task-priority">
            <Select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </Select>
          </FormField>

          <FormField label="Proyek" htmlFor="task-project">
            <Select
              id="task-project"
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Milestone (Opsional)" htmlFor="task-milestone">
            <Select
              id="task-milestone"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
            >
              <option value="">Tanpa milestone</option>
              {availableMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Target Tanggal (Opsional)" htmlFor="task-due-date">
          <Input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormField>

        <MarkdownEditor
          id="task-description"
          label="Deskripsi & Catatan"
          value={description}
          onChange={setDescription}
          minHeightClass="min-h-[110px]"
        />
      </div>
    </Modal>
  );
}

export function TaskDetailModal(props: TaskDetailModalProps) {
  if (!props.open) return null;
  const key = `${props.task?.id ?? "new"}-${props.defaultStatus ?? "BACKLOG"}-${props.defaultProjectId ?? ""}-${props.defaultMilestoneId ?? ""}`;
  return <TaskDetailModalInner key={key} {...props} />;
}
