"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  archiveSingleTaskAction,
  createTaskAction,
  deleteTaskAction,
  updateTaskAction,
} from "@/actions/task-actions";
import type { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";
import {
  Badge,
  Button,
  FormField,
  Icon,
  IconButton,
  Input,
  MarkdownEditor,
  Modal,
  Select,
  useConfirm,
  useToast,
} from "@/components/ui";
import { KANBAN_COLUMNS, TASK_STATUS_META } from "@/lib/project-constants";
import { deriveParentStatus } from "@/lib/task-helpers";
import { sortProjectActiveTasks } from "@/lib/task-sorting";
import { cn } from "@/lib/utils";

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
  parentId?: string | null;
  parentTitle?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  order?: number;
  isArchived: boolean;
}

interface TaskDetailModalProps {
  open: boolean;
  task: EditableTaskItem | null;
  allTasks?: EditableTaskItem[];
  defaultProjectId?: string;
  defaultMilestoneId?: string;
  defaultParentId?: string;
  defaultStatus?: TaskStatus;
  projects: TaskModalProjectOption[];
  milestones: TaskModalMilestoneOption[];
  onSelectTask?: (task: EditableTaskItem) => void;
  onClose: () => void;
  onSuccess?: () => void;
}

function TaskDetailModalInner({
  task,
  allTasks = [],
  defaultProjectId,
  defaultMilestoneId,
  defaultParentId,
  defaultStatus = "BACKLOG",
  projects,
  milestones,
  onSelectTask,
  onClose,
  onSuccess,
}: Omit<TaskDetailModalProps, "open">) {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [isSubtaskPending, startSubtaskTransition] = useTransition();

  const resolvedParentId = task?.parentId ?? defaultParentId ?? null;
  const parentTask = resolvedParentId
    ? (allTasks.find((t) => t.id === resolvedParentId) ?? null)
    : null;
  const parentTitle = parentTask?.title ?? task?.parentTitle ?? null;
  const isSubtaskMode = Boolean(resolvedParentId);

  const [title, setTitle] = useState(task?.title ?? "");
  const [projectId, setProjectId] = useState(
    task?.projectId ?? parentTask?.projectId ?? defaultProjectId ?? projects[0]?.id ?? ""
  );
  const [milestoneId, setMilestoneId] = useState(
    task?.milestoneId ?? parentTask?.milestoneId ?? defaultMilestoneId ?? ""
  );
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "MEDIUM"
  );
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [titleError, setTitleError] = useState("");

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [localAddedSubtasks, setLocalAddedSubtasks] = useState<EditableTaskItem[]>([]);
  const [deletedSubtaskIds, setDeletedSubtaskIds] = useState<Set<string>>(
    () => new Set()
  );

  const canManageSubtasks = Boolean(task && !task.parentId);
  const remoteSubtasks = canManageSubtasks
    ? allTasks.filter((t) => t.parentId === task!.id && !deletedSubtaskIds.has(t.id))
    : [];
  const remoteIds = new Set(remoteSubtasks.map((s) => s.id));
  const mergedSubtasks = sortProjectActiveTasks(
    [
      ...remoteSubtasks,
      ...localAddedSubtasks.filter(
        (s) => !remoteIds.has(s.id) && !deletedSubtaskIds.has(s.id)
      ),
    ].map((s, idx) => ({ ...s, order: s.order ?? idx }))
  );

  const isParentContainer = Boolean(canManageSubtasks && mergedSubtasks.length > 0);
  const derivedStatus = isParentContainer
    ? deriveParentStatus(mergedSubtasks.map((s) => s.status))
    : status;
  const derivedStatusMeta = TASK_STATUS_META[derivedStatus];
  const doneSubtasksCount = mergedSubtasks.filter((s) => s.status === "DONE").length;

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
        parentId: task ? undefined : defaultParentId || null,
        title: title.trim(),
        description,
        status: isParentContainer ? derivedStatus : status,
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
        title: task
          ? "Perubahan tugas disimpan"
          : isSubtaskMode
            ? "Sub-tugas baru dibuat!"
            : "Tugas baru dibuat!",
        variant: "success",
      });
      onSuccess?.();
      onClose();
    });
  };

  const handleAddSubtaskInline = (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;

    startSubtaskTransition(async () => {
      const res = await createTaskAction({
        projectId: task.projectId,
        milestoneId: task.milestoneId,
        parentId: task.id,
        title: trimmed,
        status: "BACKLOG",
        priority: "MEDIUM",
      });

      if (!res.ok || !res.data) {
        showToast({
          title: "Gagal menambah sub-tugas",
          description: res.error,
          variant: "error",
        });
        return;
      }

      setLocalAddedSubtasks((prev) => [
        ...prev,
        {
          id: res.data!.id,
          projectId: task.projectId,
          milestoneId: task.milestoneId,
          parentId: task.id,
          parentTitle: task.title,
          title: trimmed,
          description: "",
          status: "BACKLOG",
          priority: "MEDIUM",
          dueDate: null,
          order: mergedSubtasks.length,
          isArchived: false,
        },
      ]);
      setNewSubtaskTitle("");
      showToast({
        title: "Sub-tugas ditambahkan!",
        description: `"${trimmed}" masuk ke Space Kanban.`,
        variant: "success",
      });
      onSuccess?.();
    });
  };

  const handleDeleteSubtaskInline = async (sub: EditableTaskItem) => {
    const ok = await confirm({
      title: "Hapus Sub-tugas?",
      message: `Sub-tugas "${sub.title}" akan dihapus permanen dari papan Space Kanban.`,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      tone: "danger",
    });
    if (!ok) return;

    startSubtaskTransition(async () => {
      const res = await deleteTaskAction(sub.id);
      if (!res.ok) {
        showToast({
          title: "Gagal menghapus sub-tugas",
          description: res.error,
          variant: "error",
        });
        return;
      }
      setDeletedSubtaskIds((prev) => {
        const next = new Set(prev);
        next.add(sub.id);
        return next;
      });
      showToast({ title: "Sub-tugas dihapus", variant: "info" });
      onSuccess?.();
    });
  };

  const handleArchive = () => {
    if (!task) return;
    startTransition(async () => {
      const res = await archiveSingleTaskAction(task.id);
      if (!res.ok) {
        showToast({
          title: "Gagal mengarsipkan",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Tugas dipindahkan ke Riwayat Arsip", variant: "info" });
      onSuccess?.();
      onClose();
    });
  };

  const handleDelete = async () => {
    if (!task) return;
    const message = isParentContainer
      ? `Tugas "${task.title}" dan ${mergedSubtasks.length} sub-tugas di dalamnya akan dihapus permanen dari proyek dan papan Space Kanban.`
      : `Tugas "${task.title}" akan dihapus permanen dari proyek dan papan Space Kanban.`;

    const ok = await confirm({
      title: "Hapus Tugas?",
      message,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      tone: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      const res = await deleteTaskAction(task.id);
      if (!res.ok) {
        showToast({
          title: "Gagal menghapus",
          description: res.error,
          variant: "error",
        });
        return;
      }
      showToast({ title: "Tugas dihapus", variant: "info" });
      onSuccess?.();
      onClose();
    });
  };

  const canArchiveCurrent =
    Boolean(task && !task.isArchived) &&
    (isParentContainer
      ? mergedSubtasks.every((s) => s.status === "DONE")
      : status === "DONE");

  return (
    <Modal
      open
      onClose={onClose}
      title={
        task
          ? isSubtaskMode
            ? "Detail & Edit Sub-tugas"
            : "Detail & Edit Tugas"
          : isSubtaskMode
            ? "Buat Sub-tugas Baru"
            : "Buat Tugas Baru"
      }
      description={
        isSubtaskMode
          ? "Sub-tugas tampil sebagai card mandiri di Space Kanban dan mengikuti proyek induknya."
          : task
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
            {canArchiveCurrent && (
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
              {isPending
                ? "Menyimpan..."
                : task
                  ? "Simpan Perubahan"
                  : isSubtaskMode
                    ? "Tambah Sub-tugas"
                    : "Tambah Tugas"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {isSubtaskMode && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-border-soft bg-surface-hover px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Icon
                name="subdirectory_arrow_right"
                size="sm"
                className="shrink-0 text-primary"
              />
              <span className="truncate font-sans text-[13px] font-semibold text-ink">
                Sub-tugas dari:{" "}
                <strong className="font-display font-bold">
                  {parentTitle ?? "Tugas Induk"}
                </strong>
              </span>
            </div>
            {parentTask && onSelectTask && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon name="arrow_back" size="sm" />}
                onClick={() => onSelectTask(parentTask)}
              >
                Kembali ke Induk
              </Button>
            )}
          </div>
        )}

        <FormField
          label={isSubtaskMode ? "Judul Sub-tugas" : "Judul Tugas"}
          htmlFor="task-title"
          required
          error={titleError}
        >
          <Input
            id="task-title"
            hasError={Boolean(titleError)}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError("");
            }}
            placeholder={
              isSubtaskMode
                ? "Contoh: Konfigurasi redirect URI"
                : "Contoh: Integrasi Google OAuth"
            }
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField label="Status Kanban" htmlFor="task-status">
            {isParentContainer ? (
              <div className="flex h-11 items-center justify-between gap-2 rounded-2xl border-2 border-border-soft bg-surface-hover px-3.5">
                <Badge variant={derivedStatusMeta.badgeVariant}>
                  {derivedStatusMeta.label}
                </Badge>
                <span className="font-sans text-[12px] font-semibold text-ink-muted">
                  Otomatis dari sub-tugas
                </span>
              </div>
            ) : (
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
            )}
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

          <FormField
            label="Proyek"
            htmlFor="task-project"
            helperText={isSubtaskMode ? "Mengikuti tugas induk" : undefined}
          >
            <Select
              id="task-project"
              disabled={isSubtaskMode}
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

          <FormField
            label="Milestone (Opsional)"
            htmlFor="task-milestone"
            helperText={isSubtaskMode ? "Mengikuti tugas induk" : undefined}
          >
            <Select
              id="task-milestone"
              disabled={isSubtaskMode}
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

        {canManageSubtasks && (
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-border-soft bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="checklist" size="sm" className="text-primary" />
                <h3 className="font-display text-[14px] font-bold text-ink">
                  Sub-tugas
                </h3>
              </div>
              <Badge
                variant={
                  mergedSubtasks.length > 0 &&
                  doneSubtasksCount === mergedSubtasks.length
                    ? "success"
                    : "primary"
                }
                mono
              >
                {doneSubtasksCount}/{mergedSubtasks.length}
              </Badge>
            </div>

            <form onSubmit={handleAddSubtaskInline} className="flex gap-2">
              <Input
                aria-label="Tambah sub-tugas baru"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Tambah sub-tugas baru..."
                disabled={isSubtaskPending}
                className="h-10 rounded-xl px-3 py-2 text-[13px]"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={isSubtaskPending || !newSubtaskTitle.trim()}
                leftIcon={<Icon name="add" size="sm" />}
                className="shrink-0"
              >
                Tambah
              </Button>
            </form>

            {mergedSubtasks.length === 0 ? (
              <p className="py-1 font-sans text-[12px] font-medium text-ink-muted">
                Belum ada sub-tugas. Tambahkan sub-tugas untuk memecah pekerjaan ini ke Space Kanban.
              </p>
            ) : (
              <div className="flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1">
                {mergedSubtasks.map((sub) => {
                  const subStatusMeta = TASK_STATUS_META[sub.status];
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-2 rounded-2xl border-2 border-border-soft bg-surface-hover px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectTask?.(sub)}
                        className="group flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
                      >
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate font-display text-[13px] font-bold group-hover:text-primary",
                            sub.status === "DONE"
                              ? "text-ink-muted line-through"
                              : "text-ink"
                          )}
                        >
                          {sub.title}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {sub.isArchived && (
                          <Badge variant="neutral">Arsip</Badge>
                        )}
                        <Badge variant={subStatusMeta.badgeVariant}>
                          {subStatusMeta.label}
                        </Badge>
                        <IconButton
                          size="sm"
                          variant="danger"
                          label={`Hapus sub-tugas ${sub.title}`}
                          icon={<Icon name="delete" size="sm" />}
                          onClick={() => handleDeleteSubtaskInline(sub)}
                          disabled={isSubtaskPending}
                          className="h-7 w-7"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function TaskDetailModal(props: TaskDetailModalProps) {
  if (!props.open) return null;
  const key = `${props.task?.id ?? "new"}-${props.defaultParentId ?? ""}-${props.defaultStatus ?? "BACKLOG"}-${props.defaultProjectId ?? ""}-${props.defaultMilestoneId ?? ""}`;
  return <TaskDetailModalInner key={key} {...props} />;
}
